import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";

// Resolve lib/ from server/ context: server/ is one level inside project root
const PROJECT_ROOT = path.join(process.cwd(), "..");
const MEMES_DIR = process.env.MEMES_DIR
  ? path.isAbsolute(process.env.MEMES_DIR)
    ? process.env.MEMES_DIR
    : path.join(process.cwd(), process.env.MEMES_DIR)
  : path.join(PROJECT_ROOT, "memes");

const DATA_DIR = process.env.MEME_DATA_DIR
  ? path.isAbsolute(process.env.MEME_DATA_DIR)
    ? process.env.MEME_DATA_DIR
    : path.join(process.cwd(), process.env.MEME_DATA_DIR)
  : path.join(PROJECT_ROOT, "data");

const MANIFEST_PATH = path.join(DATA_DIR, "manifest.json");

function loadManifest(): any {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { artworks: [] };
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
}

function saveManifest(manifest: any): void {
  const tmp = MANIFEST_PATH + ".tmp." + Date.now();
  fs.writeFileSync(tmp, JSON.stringify(manifest, null, 2), "utf-8");
  fs.renameSync(tmp, MANIFEST_PATH);
}

async function curateArtwork(artwork: any): Promise<any> {
  const { executeTwoPassPipeline } = await import(
    path.join(PROJECT_ROOT, "lib", "ai", "twoPass.ts")
  ).catch(() =>
    import(path.join(PROJECT_ROOT, "lib", "ai", "twoPass.js"))
  );

  const manifest = loadManifest();
  const existingTitles = manifest.artworks
    .filter((a: any) => a.id !== artwork.id && a.aiGenerated)
    .map((a: any) => a.title)
    .filter(Boolean);

  const filePath = path.join(MEMES_DIR, artwork.filename);
  const result = await executeTwoPassPipeline({
    assetId: artwork.id,
    filename: artwork.filename,
    filePath,
    mediaType: artwork.type,
    contentHash: artwork.hash,
    format: artwork.format,
    width: artwork.width,
    height: artwork.height,
    existingTitles,
  });

  return result;
}

export const aiRouter = Router();

/**
 * POST /api/ai/roast
 * Body: { id: string; force?: boolean }
 * Triggers Two-Pass pipeline for a single artwork.
 */
aiRouter.post("/roast", async (req: Request, res: Response) => {
  const { id, force } = req.body as { id: string; force?: boolean };

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing required field: id" });
  }

  const manifest = loadManifest();
  const idx = manifest.artworks.findIndex((a: any) => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: `Artwork not found: ${id}` });
  }

  const artwork = manifest.artworks[idx];

  // Skip if already curated and force not set
  if (artwork.aiGenerated && artwork.aiStatus === "success" && !force) {
    return res.json({
      success: true,
      skipped: true,
      message: "Artwork already curated. Use force=true to re-run.",
      artwork,
    });
  }

  try {
    const result = await curateArtwork(artwork);

    // Merge AI result into artwork
    const updated = {
      ...artwork,
      title: result.title,
      caption: result.caption,
      description: result.description,
      curatorReview: result.curatorReview || result.description,
      visual_summary: result.visual_summary,
      funny_observation: result.funny_observation,
      tags: result.tags || artwork.tags,
      candidates: result.candidates,
      analysis_status: result.analysis_status,
      review_status: result.review_status,
      groundingWarning: result.groundingWarning,
      confidence: result.confidence,
      aiGenerated: result.aiGenerated,
      aiModel: result.aiModel,
      aiStatus: result.aiStatus,
      aiError: result.aiError,
      aiGeneratedAt: result.aiGeneratedAt,
    };

    manifest.artworks[idx] = updated;
    if (result.aiStatus === "success") {
      manifest.aiCuratedCount = manifest.artworks.filter(
        (a: any) => a.aiGenerated && a.aiStatus === "success"
      ).length;
    }
    saveManifest(manifest);

    return res.json({ success: true, artwork: updated });
  } catch (err: any) {
    console.error("[AI Roast] Error:", err);
    return res.status(500).json({
      error: err?.message || "Internal server error",
      details: String(err),
    });
  }
});

/**
 * GET /api/ai/review
 * Query: status?, type?, page?, limit?
 * Lists artworks filtered by review status.
 */
aiRouter.get("/review", (req: Request, res: Response) => {
  const { status, type, page = "1", limit = "20" } = req.query as Record<string, string>;

  const manifest = loadManifest();
  let artworks: any[] = manifest.artworks || [];

  if (status) {
    artworks = artworks.filter((a: any) => a.review_status === status || a.aiStatus === status);
  }
  if (type) {
    artworks = artworks.filter((a: any) => a.type === type);
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const total = artworks.length;
  const sliced = artworks.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return res.json({
    artworks: sliced,
    total,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil(total / limitNum),
  });
});

/**
 * POST /api/ai/review
 * Body: { action: "approve"|"flag"|"select_candidate"|"regenerate"; id: string; candidateIndex?: number }
 */
aiRouter.post("/review", async (req: Request, res: Response) => {
  const { action, id, candidateIndex } = req.body as {
    action: "approve" | "flag" | "select_candidate" | "regenerate";
    id: string;
    candidateIndex?: number;
  };

  if (!action || !id) {
    return res.status(400).json({ error: "Missing action or id" });
  }

  const manifest = loadManifest();
  const idx = manifest.artworks.findIndex((a: any) => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: `Artwork not found: ${id}` });
  }

  const artwork = manifest.artworks[idx];

  if (action === "approve") {
    manifest.artworks[idx] = { ...artwork, review_status: "approved", needsReview: false };
    saveManifest(manifest);
    return res.json({ success: true, artwork: manifest.artworks[idx] });
  }

  if (action === "flag") {
    manifest.artworks[idx] = { ...artwork, review_status: "flagged", needsReview: true };
    saveManifest(manifest);
    return res.json({ success: true, artwork: manifest.artworks[idx] });
  }

  if (action === "select_candidate") {
    const ci = typeof candidateIndex === "number" ? candidateIndex : 0;
    const candidate = artwork.candidates?.[ci];
    if (!candidate) {
      return res.status(400).json({ error: `No candidate at index ${ci}` });
    }
    manifest.artworks[idx] = {
      ...artwork,
      title: candidate.title,
      caption: candidate.caption || artwork.caption,
      selectedCandidate: candidate.title,
      selectionReason: `User selected candidate ${ci}`,
      review_status: "approved",
      needsReview: false,
    };
    saveManifest(manifest);
    return res.json({ success: true, artwork: manifest.artworks[idx] });
  }

  if (action === "regenerate") {
    try {
      const result = await curateArtwork({ ...artwork });
      const updated = {
        ...artwork,
        title: result.title,
        caption: result.caption,
        description: result.description,
        curatorReview: result.curatorReview || result.description,
        visual_summary: result.visual_summary,
        funny_observation: result.funny_observation,
        tags: result.tags || artwork.tags,
        candidates: result.candidates,
        analysis_status: result.analysis_status,
        review_status: result.review_status,
        groundingWarning: result.groundingWarning,
        confidence: result.confidence,
        aiGenerated: result.aiGenerated,
        aiModel: result.aiModel,
        aiStatus: result.aiStatus,
        aiError: result.aiError,
        aiGeneratedAt: result.aiGeneratedAt,
      };
      manifest.artworks[idx] = updated;
      saveManifest(manifest);
      return res.json({ success: true, artwork: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || "Regeneration failed" });
    }
  }

  return res.status(400).json({ error: `Unknown action: ${action}` });
});
