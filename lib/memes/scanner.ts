import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import sharp from "sharp";
import { ArtworkMedia, MediaType, MuseumManifest, SyncStats } from "./types";
import { loadManifest, saveManifest } from "./manifest";
import { generateThumbnail } from "./thumbnails";
import { processAssetJobQueue, AssetJob } from "../ai/jobQueue";
import { executeTwoPassPipeline } from "../ai/twoPass";
import { PROMPT_VERSION } from "../ai/prompts";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".avif",
  ".svg",
]);

const VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".webm",
  ".ogv",
  ".mov",
  ".m4v",
]);

export function getMemesDir(): string {
  const custom = process.env.MEMES_DIR;
  if (custom) {
    return path.isAbsolute(custom) ? custom : path.join(process.cwd(), custom);
  }
  return path.join(process.cwd(), "memes");
}

export function computeFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("error", (err) => reject(err));
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

export async function getImageDimensions(filePath: string): Promise<{ width?: number; height?: number }> {
  try {
    const meta = await sharp(filePath).metadata();
    return { width: meta.width, height: meta.height };
  } catch {
    return {};
  }
}

export interface ScanOptions {
  dryRun?: boolean;
  forceAi?: boolean;
  reprocessLegacy?: boolean; // Reprocess items with old/offline metadata
  previewOnly?: number; // Preview mode for N items (e.g. 10 assets)
  concurrency?: number; // Default 1 for diagnosis
  retryFailedOnly?: boolean;
  onProgress?: (current: number, total: number, filename: string) => void;
  onPreviewItem?: (item: ArtworkMedia) => void;
}

export async function scanAndSyncMemes(options: ScanOptions = {}): Promise<{
  manifest: MuseumManifest;
  stats: SyncStats;
}> {
  const memesDir = getMemesDir();
  const existingManifest = loadManifest();

  // Save safety backup before bulk modifications (Section G requirement)
  if (!options.dryRun && existingManifest.artworks.length > 0) {
    saveManifest(existingManifest, true);
  }

  const stats: SyncStats = {
    added: 0,
    updated: 0,
    unchanged: 0,
    removed: 0,
    errors: 0,
    aiProcessed: 0,
    legacyReprocessed: 0,
    flaggedForReview: 0,
  };

  if (!fs.existsSync(memesDir)) {
    console.warn(`[Scanner] Memes directory not found: ${memesDir}`);
    return { manifest: existingManifest, stats };
  }

  // Find all media files recursively
  const mediaFiles: string[] = [];
  function walkDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext)) {
          mediaFiles.push(fullPath);
        }
      }
    }
  }

  walkDir(memesDir);
  mediaFiles.sort((a, b) => a.localeCompare(b));

  const existingByFilename = new Map<string, ArtworkMedia>();
  const existingByHash = new Map<string, ArtworkMedia>();
  for (const item of existingManifest.artworks) {
    existingByFilename.set(item.filename, item);
    existingByHash.set(item.hash, item);
  }

  const scannedFilenames = new Set<string>();
  const preservedArtworks: ArtworkMedia[] = [];
  const jobsToProcess: AssetJob[] = [];

  let catalogCounter = 1;

  for (let i = 0; i < mediaFiles.length; i++) {
    const filePath = mediaFiles[i];
    const relPath = path.relative(memesDir, filePath).replace(/\\/g, "/");
    scannedFilenames.add(relPath);

    try {
      const stat = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const format = ext.replace(".", "");
      const isVideo = VIDEO_EXTENSIONS.has(ext);
      const mediaType: MediaType = isVideo ? "video" : "image";

      const hash = await computeFileHash(filePath);
      const safeUrl = encodeURIComponent(relPath).replace(/%2F/g, "/");
      const catalogNumber = catalogCounter++;
      const assetId = `DANH-${catalogNumber.toString().padStart(3, "0")}`;

      const existing = existingByFilename.get(relPath);

      // Determine if item has legacy / ungrounded metadata
      const isLegacyMetadata =
        existing &&
        (existing.aiModel?.includes("Offline") ||
          existing.title.includes("Hồ sơ #") ||
          existing.promptVersion !== PROMPT_VERSION);

      let needsAi = false;
      if (options.forceAi) {
        needsAi = true;
      } else if (options.reprocessLegacy && isLegacyMetadata) {
        needsAi = true;
        stats.legacyReprocessed = (stats.legacyReprocessed || 0) + 1;
      } else if (!existing) {
        needsAi = true;
      } else if (existing.hash !== hash) {
        needsAi = true;
      } else if (options.retryFailedOnly && (existing.aiStatus === "error" || existing.needsReview)) {
        needsAi = true;
      }

      // Check unchanged & verified
      if (!needsAi && existing && existing.hash === hash) {
        stats.unchanged++;
        preservedArtworks.push({
          ...existing,
          id: assetId,
          asset_id: assetId,
          catalogNumber,
          safeUrl,
          contentHash: hash,
          mediaType,
          sizeBytes: stat.size,
          modifiedAt: stat.mtime.toISOString(),
        });
        continue;
      }

      // Renamed file with identical hash
      const existingSameHash = existingByHash.get(hash);
      if (!needsAi && existingSameHash) {
        stats.updated++;
        preservedArtworks.push({
          ...existingSameHash,
          id: assetId,
          asset_id: assetId,
          catalogNumber,
          filename: relPath,
          safeUrl,
          contentHash: hash,
          mediaType,
          sizeBytes: stat.size,
          modifiedAt: stat.mtime.toISOString(),
        });
        continue;
      }

      // Dimensions & Thumbnail
      let width: number | undefined;
      let height: number | undefined;
      let aspectRatio: number | undefined;

      if (!isVideo) {
        const dims = await getImageDimensions(filePath);
        width = dims.width;
        height = dims.height;
        if (width && height) {
          aspectRatio = parseFloat((width / height).toFixed(3));
        }
        if (!options.dryRun) {
          await generateThumbnail(filePath, hash);
        }
      } else {
        aspectRatio = 1.778;
      }

      if (existing) {
        stats.updated++;
      } else {
        stats.added++;
      }

      jobsToProcess.push({
        assetId,
        catalogNumber,
        filename: relPath,
        filePath,
        mediaType,
        format,
        contentHash: hash,
        sizeBytes: stat.size,
        width,
        height,
        aspectRatio,
        modifiedAt: stat.mtime.toISOString(),
        existingArtwork: existing,
      });
    } catch (err) {
      console.error(`[Scanner] Lỗi quét tệp ${relPath}:`, err);
      stats.errors++;
    }
  }

  // Count removed items
  for (const item of existingManifest.artworks) {
    if (!scannedFilenames.has(item.filename)) {
      stats.removed++;
    }
  }

  // Preview Mode: Process preview items only
  if (options.previewOnly && options.previewOnly > 0) {
    const previewJobs = jobsToProcess.slice(0, options.previewOnly);
    const existingTitles = existingManifest.artworks.map((a) => a.title).filter(Boolean);

    for (const job of previewJobs) {
      const result = await executeTwoPassPipeline({
        assetId: job.assetId,
        filename: job.filename,
        filePath: job.filePath,
        mediaType: job.mediaType,
        contentHash: job.contentHash,
        format: job.format,
        width: job.width,
        height: job.height,
        existingTitles,
      });

      const artwork: ArtworkMedia = {
        id: job.assetId,
        asset_id: job.assetId,
        catalogNumber: job.catalogNumber,
        filename: job.filename,
        safeUrl: encodeURIComponent(job.filename).replace(/%2F/g, "/"),
        hash: job.contentHash,
        contentHash: job.contentHash,
        type: job.mediaType,
        mediaType: job.mediaType,
        format: job.format,
        sizeBytes: job.sizeBytes,
        modifiedAt: job.modifiedAt,
        width: job.width,
        height: job.height,
        aspectRatio: job.aspectRatio,
        title: result.title,
        curatorReview: result.caption,
        caption: result.caption,
        description: result.visual_summary,
        visual_summary: result.visual_summary,
        funny_observation: result.funny_observation,
        tags: result.tags,
        humorStyle: (result as any).humor_style || "Quan sát hài hước",
        candidates: result.candidates,
        selectedCandidate: result.selectedCandidate,
        selectionReason: result.selectionReason,
        promptVersion: result.prompt_version,
        needsReview: result.review_status === "needs_review",
        analysis_status: result.analysis_status,
        review_status: result.review_status,
        groundingWarning: result.groundingWarning,
        confidence: result.confidence,
        aiGenerated: result.analysis_status === "success",
        aiModel: result.model,
        aiStatus: result.analysis_status,
        aiError: result.error,
        aiGeneratedAt: result.generated_at,
        featured: job.catalogNumber === 1 || job.catalogNumber === 15 || job.catalogNumber === 42,
      };

      if (options.onPreviewItem) {
        options.onPreviewItem(artwork);
      }
      stats.aiProcessed++;
    }

    return { manifest: existingManifest, stats };
  }

  // Batch Job Queue Processing with Bounded Concurrency
  if (!options.dryRun && jobsToProcess.length > 0) {
    // Seed initial preserved records into manifest to keep all items alive
    const initialManifest: MuseumManifest = {
      version: "2.0",
      lastSyncedAt: new Date().toISOString(),
      totalCount: preservedArtworks.length,
      imageCount: preservedArtworks.filter((a) => a.type === "image").length,
      videoCount: preservedArtworks.filter((a) => a.type === "video").length,
      aiCuratedCount: preservedArtworks.filter((a) => a.aiGenerated).length,
      artworks: preservedArtworks,
    };
    saveManifest(initialManifest, false);

    const queueSummary = await processAssetJobQueue(jobsToProcess, {
      concurrency: options.concurrency || 1, // Default 1 for diagnosis
      onProgress: options.onProgress,
    });

    stats.aiProcessed = queueSummary.processed;
    stats.flaggedForReview = queueSummary.flaggedForReview;
  }

  const finalManifest = loadManifest();
  return { manifest: finalManifest, stats };
}
