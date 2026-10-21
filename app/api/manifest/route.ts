import { NextResponse } from "next/server";
import { loadManifest } from "@/lib/memes/manifest";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const manifest = loadManifest();
    return NextResponse.json(manifest, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[ManifestAPI] Error loading manifest:", error);
    return NextResponse.json(
      { error: "Could not load museum manifest" },
      { status: 500 }
    );
  }
}
