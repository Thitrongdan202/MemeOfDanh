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
      forceAi: true,
    });

    if (result.success) {
      // Update with new witty metadata
      artwork.title = result.data.title;
      artwork.caption = result.data.caption;
      artwork.curatorReview = result.data.caption;
      artwork.description = result.data.description;
      artwork.tags = result.data.tags;
      artwork.humorStyle = result.data.humor_style;
      artwork.candidates = result.data.candidates;
      artwork.selectedCandidate = result.data.selected_candidate;
      artwork.selectionReason = result.data.selection_reason;
      artwork.needsReview = result.data.needs_review;
      artwork.promptVersion = result.promptVersion;
      artwork.aiGenerated = result.isAiGenerated;
      artwork.aiModel = result.model;
      artwork.aiStatus = result.data.needs_review ? "needs_review" : "success";
      artwork.aiError = undefined;
      artwork.aiGeneratedAt = new Date().toISOString();

      manifest.artworks[artworkIndex] = artwork;
      manifest.aiCuratedCount = manifest.artworks.filter((a) => a.aiGenerated).length;

      saveManifest(manifest, false);
    } else {
      // Preserve old metadata if AI failed! (Task 7 requirement)
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
