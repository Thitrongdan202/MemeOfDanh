import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import sharp from "sharp";
import { execFileSync } from "child_process";
import * as os from "os";

const MEMES_DIR = process.env.MEMES_DIR
  ? path.isAbsolute(process.env.MEMES_DIR)
    ? process.env.MEMES_DIR
    : path.join(process.cwd(), process.env.MEMES_DIR)
  : path.join(process.cwd(), "..", "memes");

const DATA_DIR = process.env.MEME_DATA_DIR || path.join(process.cwd(), "..", "data");
const MANIFEST_PATH = path.join(DATA_DIR, "manifest.json");
const THUMB_DIR = path.join(process.cwd(), "..", "public", "thumbnails");

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".avif"]);
const VIDEO_EXTS = new Set([".mp4", ".webm", ".ogv", ".mov", ".m4v"]);

export const syncRouter = Router();

function computeHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (d) => hash.update(d));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

async function getDimensions(filePath: string): Promise<{ width?: number; height?: number }> {
  try {
    const meta = await sharp(filePath).metadata();
    return { width: meta.width, height: meta.height };
  } catch {
    return {};
  }
}

async function generateThumbnail(filePath: string, hash: string): Promise<void> {
  if (!fs.existsSync(THUMB_DIR)) {
    fs.mkdirSync(THUMB_DIR, { recursive: true });
  }
  const thumbPath = path.join(THUMB_DIR, `${hash}.webp`);
  if (fs.existsSync(thumbPath)) return;

  await sharp(filePath)
    .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(thumbPath);
}

function getFFmpegPath(): string {
  const binaryName = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  const candidate = path.join(process.cwd(), "node_modules", "@ffmpeg-installer", "win32-x64", binaryName);
  if (fs.existsSync(candidate)) return candidate;
  return "ffmpeg";
}

async function generateVideoThumbnail(filePath: string, hash: string): Promise<void> {
  if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true });
  const thumbPath = path.join(THUMB_DIR, `${hash}.webp`);
  if (fs.existsSync(thumbPath)) return;

  const tmpFrame = path.join(os.tmpdir(), `vthumb-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`);
  try {
    const ffmpegPath = getFFmpegPath();
    execFileSync(ffmpegPath, [
      "-y",
      "-ss", "00:00:00.500",
      "-i", filePath,
      "-vframes", "1",
      "-vf", "scale=800:-1",
      "-q:v", "2",
      tmpFrame,
    ], { timeout: 15000, stdio: "ignore" });

    if (fs.existsSync(tmpFrame)) {
      await sharp(tmpFrame)
        .webp({ quality: 80 })
        .toFile(thumbPath);
    }
  } catch {
    // ignore
  } finally {
    if (fs.existsSync(tmpFrame)) {
      try { fs.unlinkSync(tmpFrame); } catch {}
    }
  }
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { version: "2.0", lastSyncedAt: new Date().toISOString(), totalCount: 0, imageCount: 0, videoCount: 0, aiCuratedCount: 0, artworks: [] };
  }
  const raw = fs.readFileSync(MANIFEST_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.artworks)) parsed.artworks = [];
  return parsed;
}

function saveManifest(manifest: any) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = MANIFEST_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(manifest, null, 2));
  fs.renameSync(tmp, MANIFEST_PATH);
}

syncRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { dryRun = false } = req.body || {};

    if (!fs.existsSync(MEMES_DIR)) {
      return res.status(400).json({ error: `Memes directory not found: ${MEMES_DIR}` });
    }

    const existing = loadManifest();
    const existingByFilename = new Map<string, any>(existing.artworks.map((a: any) => [a.filename, a]));
    const existingByHash = new Map<string, any>(existing.artworks.map((a: any) => [a.hash, a]));
    const scannedFilenames = new Set<string>();

    const allFiles: string[] = [];
    function walk(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) { walk(full); continue; }
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTS.has(ext) || VIDEO_EXTS.has(ext)) allFiles.push(full);
      }
    }
    walk(MEMES_DIR);
    allFiles.sort();

    const stats = { added: 0, updated: 0, unchanged: 0, removed: 0, errors: 0 };
    const artworks: any[] = [];
    let catalogCounter = 1;

    for (const filePath of allFiles) {
      const relPath = path.relative(MEMES_DIR, filePath).replace(/\\/g, "/");
      scannedFilenames.add(relPath);

      try {
        const stat = fs.statSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const format = ext.replace(".", "");
        const isVideo = VIDEO_EXTS.has(ext);
        const mediaType = isVideo ? "video" : "image";
        const hash = await computeHash(filePath);
        const safeUrl = encodeURIComponent(relPath).replace(/%2F/g, "/");
        const assetId = `DANH-${(catalogCounter++).toString().padStart(3, "0")}`;

        const existingItem = existingByFilename.get(relPath);

        if (existingItem && existingItem.hash === hash) {
          stats.unchanged++;
          artworks.push({ ...existingItem, id: assetId, safeUrl, sizeBytes: stat.size });
          continue;
        }

        const existingSameHash = existingByHash.get(hash);
        if (existingSameHash && !existingItem) {
          stats.updated++;
          artworks.push({ ...existingSameHash, id: assetId, filename: relPath, safeUrl, sizeBytes: stat.size });
          continue;
        }

        let width: number | undefined, height: number | undefined, aspectRatio: number | undefined;
        if (!isVideo) {
          const dims = await getDimensions(filePath);
          width = dims.width; height = dims.height;
          if (width && height) aspectRatio = parseFloat((width / height).toFixed(3));
          if (!dryRun) await generateThumbnail(filePath, hash).catch(() => {});
        } else {
          aspectRatio = 1.778;
          if (!dryRun) await generateVideoThumbnail(filePath, hash).catch(() => {});
        }

        const isNew = !existingItem;
        if (isNew) stats.added++; else stats.updated++;

        const newItem: any = {
          id: assetId,
          catalogNumber: catalogCounter - 1,
          filename: relPath,
          safeUrl,
          hash,
          type: mediaType,
          format,
          sizeBytes: stat.size,
          modifiedAt: stat.mtime.toISOString(),
          width, height, aspectRatio,
          title: existingItem?.title || `${mediaType === "video" ? "Video" : "Ảnh"} ${format.toUpperCase()} #${assetId}`,
          curatorReview: existingItem?.curatorReview || "",
          caption: existingItem?.caption || "",
          description: existingItem?.description || "",
          tags: existingItem?.tags || [format.toUpperCase()],
          aiGenerated: existingItem?.aiGenerated || false,
          aiModel: existingItem?.aiModel || null,
          aiStatus: existingItem?.aiStatus || "pending",
          analysis_status: existingItem?.analysis_status || "pending",
          review_status: existingItem?.review_status || "needs_review",
          promptVersion: existingItem?.promptVersion || null,
          featured: existingItem?.featured || false,
        };
        artworks.push(newItem);
      } catch (err) {
        console.error(`[Sync] Error processing ${relPath}:`, err);
        stats.errors++;
      }
    }

    for (const item of existing.artworks) {
      if (!scannedFilenames.has(item.filename)) stats.removed++;
    }

    const manifest = {
      version: "2.0",
      lastSyncedAt: new Date().toISOString(),
      totalCount: artworks.length,
      imageCount: artworks.filter((a) => a.type === "image").length,
      videoCount: artworks.filter((a) => a.type === "video").length,
      aiCuratedCount: artworks.filter((a) => a.aiGenerated).length,
      artworks,
    };

    if (!dryRun) saveManifest(manifest);

    return res.json({ success: true, stats, manifest });
  } catch (err: any) {
    console.error("[SyncRoute] Error:", err);
    return res.status(500).json({ error: err.message });
  }
});
