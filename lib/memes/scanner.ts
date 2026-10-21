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
  onProgress?: (current: number, total: number, filename: string) => void;
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

      // Check if file is unchanged (same filename AND same hash)
      const existing = existingByFilename.get(relPath);

      if (existing && existing.hash === hash && !options.forceAi) {
        // Keep existing metadata, just update catalog id & modifiedAt if needed
        stats.unchanged++;
        newArtworks.push({
          ...existing,
          id,
          catalogNumber,
          safeUrl,
          sizeBytes: stat.size,
          modifiedAt: stat.mtime.toISOString(),
        });
        continue;
      }

      // Check if file was renamed/moved (same hash)
      const existingSameHash = existingByHash.get(hash);
      if (existingSameHash && !options.forceAi) {
        stats.updated++;
        newArtworks.push({
          ...existingSameHash,
          id,
          catalogNumber,
          filename: relPath,
          safeUrl,
          sizeBytes: stat.size,
          modifiedAt: stat.mtime.toISOString(),
        });
        continue;
      }

      // New file or modified file
      if (existing) {
        stats.updated++;
      } else {
        stats.added++;
      }

      // Dimensions
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
        // Generate thumbnail
        if (!options.dryRun) {
          await generateThumbnail(filePath, hash);
        }
      } else {
        aspectRatio = 1.778; // 16:9 standard video aspect
      }

      // Run curation
      let curationResult;
      if (!options.dryRun) {
        curationResult = await curateArtwork({
          filePath,
          filename: relPath,
          mediaType,
          catalogNumber,
          hash,
          forceAi: options.forceAi,
        });
        stats.aiProcessed++;
      } else {
        curationResult = {
          success: true,
          data: {
            title: `Tác phẩm số #${catalogNumber}`,
            caption: "Đang xem trước chế độ chạy thử nghiệm (dry-run).",
            description: "Bản ghi tóm tắt trong chế độ kiểm thử.",
            tags: ["DryRun", mediaType],
            humor_style: "Kiểm thử",
          },
          model: "dry-run",
          isAiGenerated: false,
        };
      }

      const artwork: ArtworkMedia = {
        id,
        catalogNumber,
        filename: relPath,
        safeUrl,
        hash,
        type: mediaType,
        format,
        sizeBytes: stat.size,
        modifiedAt: stat.mtime.toISOString(),
        width,
        height,
        aspectRatio,
        title: curationResult.data.title,
        curatorReview: curationResult.data.caption,
        description: curationResult.data.description,
        tags: curationResult.data.tags,
        humorStyle: curationResult.data.humor_style,
        aiGenerated: curationResult.isAiGenerated,
        aiModel: curationResult.model,
        aiStatus: curationResult.success ? "success" : "error",
        aiError: curationResult.error,
        aiGeneratedAt: new Date().toISOString(),
        featured: catalogNumber === 1 || catalogNumber === 15 || catalogNumber === 42,
      };

      newArtworks.push(artwork);
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
