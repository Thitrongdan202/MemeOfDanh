import { NextRequest, NextResponse } from "next/server";
import * as path from "path";
import * as fs from "fs";
import { loadManifest, saveManifest } from "@/lib/memes/manifest";
import { getMemesDir } from "@/lib/memes/scanner";
import { curateArtwork } from "@/lib/ai";
import { ArtworkMedia } from "@/lib/memes/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/ai/review
 * Returns N artworks for the review UI.
 * Query params:
 *   ?limit=20        — max items to return (default 20)
 *   ?filter=all|needs_review|approved|pending — filter by review_status
 *   ?offset=0        — pagination offset
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const filter = searchParams.get("filter") || "all";

    const manifest = loadManifest();
    let artworks = manifest.artworks;

    // Apply filter
    if (filter === "needs_review") {
      artworks = artworks.filter(
        (a) => a.review_status === "needs_review" || a.needsReview
      );
    } else if (filter === "approved") {
      artworks = artworks.filter((a) => a.review_status === "approved");
    } else if (filter === "pending") {
      artworks = artworks.filter(
        (a) => a.analysis_status === "pending" || !a.aiGenerated
      );
    } else if (filter === "ai_generated") {
      artworks = artworks.filter((a) => a.aiGenerated);
    }

    const total = artworks.length;
    const page = artworks.slice(offset, offset + limit);

    return NextResponse.json({
      artworks: page,
      total,
      offset,
      limit,
      hasMore: offset + limit < total,
      stats: {
        total: manifest.artworks.length,
        aiCurated: manifest.aiCuratedCount,
        needsReview: manifest.artworks.filter((a) => a.review_status === "needs_review" || a.needsReview).length,
        approved: manifest.artworks.filter((a) => a.review_status === "approved").length,
        pending: manifest.artworks.filter((a) => a.analysis_status === "pending").length,
        withGroundingWarning: manifest.artworks.filter((a) => !!a.groundingWarning && a.aiGenerated).length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load review list" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/review
 * Actions: regenerate | approve | select_candidate | flag
 *
 * Body:
 *   { action: "regenerate", id: "DANH-001" }
 *   { action: "approve", id: "DANH-001" }
 *   { action: "flag", id: "DANH-001" }
 *   { action: "select_candidate", id: "DANH-001", candidateIndex: 1 }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
    }

    const manifest = loadManifest();
    const artworkIndex = manifest.artworks.findIndex((a) => a.id === id);
    if (artworkIndex === -1) {
      return NextResponse.json({ error: `Artwork ${id} not found` }, { status: 404 });
    }

    const artwork = manifest.artworks[artworkIndex];

    // --- APPROVE ---
    if (action === "approve") {
      artwork.review_status = "approved";
      artwork.needsReview = false;
      artwork.groundingWarning = undefined;
      manifest.artworks[artworkIndex] = artwork;
      saveManifest(manifest, false);
      return NextResponse.json({ success: true, artwork });
    }

    // --- FLAG ---
    if (action === "flag") {
      artwork.review_status = "flagged";
      artwork.needsReview = true;
      manifest.artworks[artworkIndex] = artwork;
      saveManifest(manifest, false);
      return NextResponse.json({ success: true, artwork });
    }

    // --- SELECT CANDIDATE ---
    if (action === "select_candidate") {
      const candidateIndex: number = body.candidateIndex ?? 0;
      const candidates = artwork.candidates;
      if (!candidates || candidates.length <= candidateIndex) {
        return NextResponse.json({ error: "Candidate index out of range" }, { status: 400 });
      }
      const chosen = candidates[candidateIndex];
      artwork.title = chosen.title;
      artwork.selectedCandidate = String(candidateIndex + 1);
      artwork.selectionReason = chosen.rationale;
      artwork.review_status = "approved";
      artwork.needsReview = false;
      artwork.groundingWarning = undefined;
      manifest.artworks[artworkIndex] = artwork;
      saveManifest(manifest, false);
      return NextResponse.json({ success: true, artwork });
    }

    // --- REGENERATE ---
    if (action === "regenerate") {
      const memesDir = getMemesDir();
      const filePath = path.join(memesDir, artwork.filename);

      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: `Media file not found: ${artwork.filename}` },
          { status: 404 }
        );
      }

      const result = await curateArtwork({
        filePath,
        filename: artwork.filename,
        mediaType: artwork.type,
        catalogNumber: artwork.catalogNumber,
        hash: artwork.hash,
        assetId: artwork.id,
        forceAi: true,
        format: artwork.format,
        width: artwork.width,
        height: artwork.height,
      });

      if (result.success) {
        artwork.title = result.metadata.title;
        artwork.caption = result.metadata.caption;
        artwork.curatorReview = result.metadata.caption;
        artwork.description = result.metadata.visual_summary;
        artwork.visual_summary = result.metadata.visual_summary;
        artwork.funny_observation = result.metadata.funny_observation;
        artwork.tags = result.metadata.tags;
        artwork.candidates = result.metadata.candidates;
        artwork.selectedCandidate = result.metadata.selectedCandidate;
        artwork.selectionReason = result.metadata.selectionReason;
        artwork.needsReview = result.metadata.review_status === "needs_review";
        artwork.analysis_status = result.metadata.analysis_status;
        artwork.review_status = result.metadata.review_status;
        artwork.groundingWarning = result.metadata.groundingWarning;
        artwork.confidence = result.metadata.confidence;
        artwork.promptVersion = result.metadata.prompt_version;
        artwork.aiGenerated = result.metadata.analysis_status === "success";
        artwork.aiModel = result.metadata.model;
        artwork.aiStatus = result.metadata.analysis_status;
        artwork.aiError = undefined;
        artwork.aiGeneratedAt = result.metadata.generated_at;

        manifest.artworks[artworkIndex] = artwork;
        manifest.aiCuratedCount = manifest.artworks.filter((a) => a.aiGenerated).length;
        saveManifest(manifest, false);
        return NextResponse.json({ success: true, artwork });
      } else {
        return NextResponse.json(
          { success: false, error: result.error || "AI regeneration failed", artwork },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Review action failed" },
      { status: 500 }
    );
  }
}
