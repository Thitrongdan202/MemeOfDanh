import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

const THUMBNAIL_DIR = path.join(process.cwd(), "public", "thumbnails");

export function ensureThumbnailDir(): void {
  if (!fs.existsSync(THUMBNAIL_DIR)) {
    fs.mkdirSync(THUMBNAIL_DIR, { recursive: true });
  }
}

export function getThumbnailPath(hash: string): string {
  return path.join(THUMBNAIL_DIR, `${hash}.webp`);
}

export function getThumbnailUrl(hash: string): string {
  return `/thumbnails/${hash}.webp`;
}

export function thumbnailExists(hash: string): boolean {
  return fs.existsSync(getThumbnailPath(hash));
}

export async function generateThumbnail(sourceFilePath: string, hash: string): Promise<boolean> {
  try {
    ensureThumbnailDir();
    const destPath = getThumbnailPath(hash);
    if (fs.existsSync(destPath)) {
      return true;
    }

    await sharp(sourceFilePath)
      .rotate() // Auto-orient based on EXIF
      .resize({
        width: 600,
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toFile(destPath);

    return true;
  } catch (error) {
    console.warn(`[Thumbnails] Could not generate thumbnail for ${sourceFilePath}:`, error);
    return false;
  }
}
