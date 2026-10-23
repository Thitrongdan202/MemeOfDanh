import { NextRequest, NextResponse } from "next/server";
import * as path from "path";
import { loadManifest, saveManifest } from "@/lib/memes/manifest";
import { getMemesDir } from "@/lib/memes/scanner";
import { curateArtwork } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing artwork ID" }, { status: 400 });
    }

    const manifest = loadManifest();
    const artworkIndex = manifest.artworks.findIndex((a) => a.id === id);

    if (artworkIndex === -1) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    const artwork = manifest.artworks[artworkIndex];
    const memesDir = getMemesDir();
    const filePath = path.join(memesDir, artwork.filename);

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
      // Update with new two-pass grounded metadata
      artwork.title = result.metadata.title;
      artwork.caption = result.metadata.caption;
      artwork.curatorReview = result.metadata.caption;
      artwork.description = result.metadata.visual_summary;
      artwork.visual_summary = result.metadata.visual_summary;
      artwork.funny_observation = result.metadata.funny_observation;
      artwork.tags = result.metadata.tags;
      artwork.humorStyle = (result.metadata as any).humor_style || "Quan sát hài hước";
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
    } else {
      // Preserve old metadata if AI failed
      console.warn(`[RoastAPI] AI Call failed for ${artwork.filename}: ${result.error}`);
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Không thể gọi AI tạo lại bình luận",
          artwork, // Return intact existing artwork
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      artwork,
    });
  } catch (error: any) {
    console.error("[RoastAPI] Error regenerating critique:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to regenerate critique" },
      { status: 500 }
    );
  }
}
