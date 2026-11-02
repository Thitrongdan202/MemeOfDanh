import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { lookup } from "./mimeTypes";

const MEMES_DIR = process.env.MEMES_DIR
  ? path.isAbsolute(process.env.MEMES_DIR)
    ? process.env.MEMES_DIR
    : path.join(process.cwd(), process.env.MEMES_DIR)
  : path.join(process.cwd(), "..", "memes");

const THUMB_DIR = path.join(process.cwd(), "..", "public", "thumbnails");

export const mediaRouter = Router();

// Serve original media files
mediaRouter.get("/*", (req: Request, res: Response) => {
  try {
    const rawPath = req.params[0] || (req.url.startsWith("/") ? req.url.slice(1) : req.url);
    const decoded = decodeURIComponent(rawPath);
    const filePath = path.join(MEMES_DIR, decoded);

    // Security: prevent path traversal
    const resolvedMemes = path.resolve(MEMES_DIR);
    const resolvedFile = path.resolve(filePath);
    if (!resolvedFile.startsWith(resolvedMemes)) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `File not found: ${decoded}` });
    }

    const ext = path.extname(filePath).toLowerCase().replace(".", "");
    const mimeType = lookup(ext) || "application/octet-stream";
    const stat = fs.statSync(filePath);

    // Support range requests for video
    const range = req.headers.range;
    if (range && (mimeType.startsWith("video/") || mimeType.startsWith("audio/"))) {
      const total = stat.size;
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 1024 * 1024 - 1, total - 1);
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=86400",
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.set({
        "Content-Type": mimeType,
        "Content-Length": String(stat.size),
        "Cache-Control": "public, max-age=86400",
        "Accept-Ranges": "bytes",
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err: any) {
    console.error("[MediaRoute] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export const thumbnailsRouter = Router();

thumbnailsRouter.get("/:hash.webp", (req: Request, res: Response) => {
  const { hash } = req.params;
  const thumbPath = path.join(THUMB_DIR, `${hash}.webp`);

  if (!fs.existsSync(thumbPath)) {
    return res.status(404).json({ error: "Thumbnail not found" });
  }

  res.set({
    "Content-Type": "image/webp",
    "Cache-Control": "public, max-age=604800",
  });
  fs.createReadStream(thumbPath).pipe(res);
});
