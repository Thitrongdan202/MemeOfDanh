import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";

// Re-use manifest logic from existing lib (relative path)
const DATA_DIR = process.env.MEME_DATA_DIR || path.join(process.cwd(), "..", "data");
const MANIFEST_PATH = path.join(DATA_DIR, "manifest.json");

export const manifestRouter = Router();

manifestRouter.get("/", (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync(MANIFEST_PATH)) {
      return res.json({
        version: "2.0",
        lastSyncedAt: new Date().toISOString(),
        totalCount: 0, imageCount: 0, videoCount: 0, aiCuratedCount: 0,
        artworks: [],
      });
    }
    const raw = fs.readFileSync(MANIFEST_PATH, "utf-8");
    const manifest = JSON.parse(raw);
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.json(manifest);
  } catch (err: any) {
    console.error("[ManifestRoute] Error:", err);
    return res.status(500).json({ error: "Could not load manifest" });
  }
});

manifestRouter.patch("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!fs.existsSync(MANIFEST_PATH)) {
      return res.status(404).json({ error: "Manifest not found" });
    }

    const raw = fs.readFileSync(MANIFEST_PATH, "utf-8");
    const manifest = JSON.parse(raw);
    const idx = manifest.artworks.findIndex((a: any) => a.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: `Artwork ${id} not found` });
    }

    manifest.artworks[idx] = { ...manifest.artworks[idx], ...updates };
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    return res.json({ success: true, artwork: manifest.artworks[idx] });
  } catch (err: any) {
    console.error("[ManifestRoute] Patch error:", err);
    return res.status(500).json({ error: err.message });
  }
});
