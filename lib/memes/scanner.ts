import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import sharp from "sharp";
import { ArtworkMedia, MediaType, MuseumManifest, SyncStats } from "./types";
import { loadManifest, saveManifest } from "./manifest";
import { generateThumbnail } from "./thumbnails";
import { curateArtwork } from "../ai";

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
  previewOnly?: number;
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

  const stats: SyncStats = {
    added: 0,
    updated: 0,
    unchanged: 0,
    removed: 0,
    errors: 0,
    aiProcessed: 0,
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

  // Sort files for deterministic order (by name)
  mediaFiles.sort((a, b) => a.localeCompare(b));

  const existingByFilename = new Map<string, ArtworkMedia>();
  const existingByHash = new Map<string, ArtworkMedia>();
  for (const item of existingManifest.artworks) {
    existingByFilename.set(item.filename, item);
    existingByHash.set(item.hash, item);
  }

  const newArtworks: ArtworkMedia[] = [];
  const scannedFilenames = new Set<string>();

  let catalogCounter = 1;
  let previewCountAchieved = 0;

  for (let i = 0; i < mediaFiles.length; i++) {
    const filePath = mediaFiles[i];
    const relPath = path.relative(memesDir, filePath).replace(/\\/g, "/");
    scannedFilenames.add(relPath);

    if (options.onProgress) {
      options.onProgress(i + 1, mediaFiles.length, relPath);
    }

    try {
      const stat = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const format = ext.replace(".", "");
      const isVideo = VIDEO_EXTENSIONS.has(ext);
      const mediaType: MediaType = isVideo ? "video" : "image";

      const hash = await computeFileHash(filePath);
      const safeUrl = encodeURIComponent(relPath).replace(/%2F/g, "/");
      const catalogNumber = catalogCounter++;
      const id = `DANH-${catalogNumber.toString().padStart(3, "0")}`;

      const existing = existingByFilename.get(relPath);

      // Determine if AI needs to be called
      let needsAi = false;
      if (options.forceAi) {
        needsAi = true;
      } else if (!existing) {
        needsAi = true;
      } else if (existing.hash !== hash) {
        needsAi = true;
      } else if (options.retryFailedOnly && (existing.aiStatus === "error" || existing.needsReview)) {
        needsAi = true;
      }

      // 1. Unchanged file (Same filename & same hash & valid metadata) -> Keep without AI
      if (!needsAi && existing && existing.hash === hash) {
        stats.unchanged++;
        newArtworks.push({
          ...existing,
          id,
          catalogNumber,
          safeUrl,
          contentHash: hash,
          mediaType,
          sizeBytes: stat.size,
          modifiedAt: stat.mtime.toISOString(),
        });
        continue;
      }

      // 2. Renamed/moved file (Different filename, but same hash)
      const existingSameHash = existingByHash.get(hash);
      if (!needsAi && existingSameHash) {
        stats.updated++;
        newArtworks.push({
          ...existingSameHash,
          id,
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

      // Check preview limit if preview mode active
      if (options.previewOnly && previewCountAchieved >= options.previewOnly) {
        // If preview limit reached, retain existing if available
        if (existing) {
          stats.unchanged++;
          newArtworks.push({ ...existing, id, catalogNumber });
        }
        continue;
      }

      // New or Modified file requiring AI
      if (existing) {
        stats.updated++;
      } else {
        stats.added++;
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
        aspectRatio = 1.778; // 16:9 standard video aspect
      }

      // Run AI Curation with retry/backoff for rate limits
      let curationResult;
      if (!options.dryRun) {
        let retryCount = 0;
        let success = false;
        while (!success && retryCount <= 2) {
          try {
            curationResult = await curateArtwork({
              filePath,
              filename: relPath,
              mediaType,
              catalogNumber,
              hash,
              forceAi: options.forceAi,
            });
            success = true;
          } catch (err: any) {
            const errStr = String(err?.message || err);
            if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("RESOURCE_EXHAUSTED")) {
              retryCount++;
              const backoffMs = retryCount * 5000;
              console.warn(`[Scanner] Gặp giới hạn rate limit. Tạm dừng ${backoffMs / 1000}s trước khi thử lại...`);
              await new Promise((r) => setTimeout(r, backoffMs));
            } else {
              break;
            }
          }
        }

        if (!curationResult) {
          curationResult = await curateArtwork({
            filePath,
            filename: relPath,
            mediaType,
            catalogNumber,
            hash,
            forceAi: options.forceAi,
          });
        }

        stats.aiProcessed++;
        previewCountAchieved++;
      } else {
        curationResult = {
          success: true,
          data: {
            candidates: [
              {
                approach: "A_direct_punchline" as const,
                title: `Ứng viên A #${catalogNumber}`,
                reason: "Punchline trực tiếp",
              },
              {
                approach: "B_short_meme" as const,
                title: `Ứng viên B #${catalogNumber}`,
                reason: "Ngắn gọn meme",
              },
              {
                approach: "C_creative_unexpected" as const,
                title: `Ứng viên C #${catalogNumber}`,
                reason: "Liên tưởng bất ngờ",
              },
            ],
            selected_candidate: "A" as const,
            selection_reason: "Phù hợp nhất trong chế độ chạy thử nghiệm",
            title: `Tác phẩm thử nghiệm #${catalogNumber}`,
            caption: "Đang xem trước chế độ chạy thử nghiệm (dry-run).",
            description: "Bản ghi tóm tắt trong chế độ kiểm thử.",
            tags: ["DryRun", mediaType],
            humor_style: "Kiểm thử",
            needs_review: false,
          },
          model: "dry-run",
          isAiGenerated: false,
          promptVersion: "dry-run",
        };
      }

      const artwork: ArtworkMedia = {
        id,
        catalogNumber,
        filename: relPath,
        safeUrl,
        hash,
        contentHash: hash,
        type: mediaType,
        mediaType,
        format,
        sizeBytes: stat.size,
        modifiedAt: stat.mtime.toISOString(),
        width,
        height,
        aspectRatio,
        title: curationResult.data.title,
        curatorReview: curationResult.data.caption,
        caption: curationResult.data.caption,
        description: curationResult.data.description,
        tags: curationResult.data.tags,
        humorStyle: curationResult.data.humor_style,
        candidates: curationResult.data.candidates,
        selectedCandidate: curationResult.data.selected_candidate,
        selectionReason: curationResult.data.selection_reason,
        needsReview: curationResult.data.needs_review,
        promptVersion: curationResult.promptVersion,
        aiGenerated: curationResult.isAiGenerated,
        aiModel: curationResult.model,
        aiStatus: curationResult.success
          ? curationResult.data.needs_review
            ? "needs_review"
            : "success"
          : "error",
        aiError: curationResult.error,
        aiGeneratedAt: new Date().toISOString(),
        featured: catalogNumber === 1 || catalogNumber === 15 || catalogNumber === 42,
      };

      if (options.onPreviewItem) {
        options.onPreviewItem(artwork);
      }

      newArtworks.push(artwork);

      // Incremental checkpoint: Save manifest periodically if processing multiple AI items
      if (!options.dryRun && (stats.aiProcessed % 5 === 0)) {
        const intermediateManifest: MuseumManifest = {
          version: "2.0",
          lastSyncedAt: new Date().toISOString(),
          totalCount: newArtworks.length,
          imageCount: newArtworks.filter((a) => a.type === "image").length,
          videoCount: newArtworks.filter((a) => a.type === "video").length,
          aiCuratedCount: newArtworks.filter((a) => a.aiGenerated).length,
          artworks: newArtworks,
        };
        saveManifest(intermediateManifest, false);
      }
    } catch (err) {
      console.error(`[Scanner] Error processing ${relPath}:`, err);
      stats.errors++;
    }
  }

  // Count removed items
  for (const item of existingManifest.artworks) {
    if (!scannedFilenames.has(item.filename)) {
      stats.removed++;
    }
  }

  const updatedManifest: MuseumManifest = {
    version: "2.0",
    lastSyncedAt: new Date().toISOString(),
    totalCount: newArtworks.length,
    imageCount: newArtworks.filter((a) => a.type === "image").length,
    videoCount: newArtworks.filter((a) => a.type === "video").length,
    aiCuratedCount: newArtworks.filter((a) => a.aiGenerated).length,
    artworks: newArtworks,
  };

  if (!options.dryRun) {
    saveManifest(updatedManifest, true);
  }

  return { manifest: updatedManifest, stats };
}
