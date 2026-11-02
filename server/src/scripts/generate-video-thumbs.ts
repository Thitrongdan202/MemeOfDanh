import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execFileSync } from "child_process";
import sharp from "sharp";

const PROJECT_ROOT = path.resolve(process.cwd(), "..");
const MEMES_DIR = path.join(PROJECT_ROOT, "memes");
const THUMB_DIR = path.join(PROJECT_ROOT, "public", "thumbnails");
const MANIFEST_PATH = path.join(PROJECT_ROOT, "data", "manifest.json");

function getFFmpegPath(): string {
  const binaryName = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  const candidate = path.join(process.cwd(), "node_modules", "@ffmpeg-installer", "win32-x64", binaryName);
  if (fs.existsSync(candidate)) return candidate;
  return "ffmpeg";
}

async function generateVideoThumbnail(filePath: string, hash: string, ffmpegPath: string) {
  if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true });
  const thumbPath = path.join(THUMB_DIR, `${hash}.webp`);
  if (fs.existsSync(thumbPath)) return false;

  const tmpFrame = path.join(os.tmpdir(), `vthumb-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`);
  try {
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
      return true;
    }
  } catch (err: any) {
    console.error(`Failed to generate thumb for ${path.basename(filePath)}:`, err?.message || err);
  } finally {
    if (fs.existsSync(tmpFrame)) {
      try { fs.unlinkSync(tmpFrame); } catch {}
    }
  }
  return false;
}

async function main() {
  console.log("Starting video thumbnail generation...");
  const ffmpegPath = getFFmpegPath();
  console.log("Using FFmpeg at:", ffmpegPath);

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  const videos = manifest.artworks.filter((a: any) => a.type === "video");
  console.log(`Found ${videos.length} videos in manifest.`);

  let created = 0;
  for (const v of videos) {
    const filePath = path.join(MEMES_DIR, v.filename);
    if (!fs.existsSync(filePath)) continue;
    const ok = await generateVideoThumbnail(filePath, v.hash, ffmpegPath);
    if (ok) {
      created++;
      process.stdout.write(`✓ [${created}] ${v.filename}\n`);
    }
  }
  console.log(`\nFinished! Created ${created} video thumbnails.`);
}

main().catch(console.error);
