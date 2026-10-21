import { NextRequest, NextResponse } from "next/server";
import { scanAndSyncMemes } from "@/lib/memes/scanner";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {
      // empty body is fine
    }

    const { forceAi } = body as { forceAi?: boolean };
    const { manifest, stats } = await scanAndSyncMemes({ forceAi });

    return NextResponse.json({
      success: true,
      stats,
      manifest,
      message: `Đồng bộ thành công! Hiện có ${manifest.totalCount} tác phẩm trong bảo tàng.`,
    });
  } catch (error: any) {
    console.error("[SyncAPI] Error during sync:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Sync failed" },
      { status: 500 }
    );
  }
}
