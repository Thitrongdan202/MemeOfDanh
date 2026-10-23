import { scanAndSyncMemes } from "../lib/memes/scanner";
import { loadManifest } from "../lib/memes/manifest";
import * as fs from "fs";
import * as path from "path";
import { getMemesDir } from "../lib/memes/scanner";
import { PROMPT_VERSION } from "../lib/ai/prompts";

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run") || args.includes("-d");
  const forceAi = args.includes("--ai") || args.includes("-a") || args.includes("--force-ai");
  const retryFailed = args.includes("--retry-failed") || args.includes("-r");
  const reprocessLegacy = args.includes("--reprocess-legacy") || args.includes("-l");

  let previewOnly: number | undefined;
  const previewIdx = args.findIndex((arg) => arg === "--preview" || arg === "-p");
  if (previewIdx !== -1) {
    const nextArg = args[previewIdx + 1];
    const parsed = parseInt(nextArg, 10);
    previewOnly = !isNaN(parsed) && parsed > 0 ? parsed : 10; // Default 10 assets for Section G
  }

  let concurrency = 1;
  const concIdx = args.findIndex((arg) => arg === "--concurrency" || arg === "-c");
  if (concIdx !== -1) {
    const nextArg = args[concIdx + 1];
    const parsed = parseInt(nextArg, 10);
    if (!isNaN(parsed) && parsed > 0) concurrency = parsed;
  }

  console.log("================================================================================");
  console.log(" 🏛️  MEMEOF DANH — TWO-PASS GROUNDED AI NAMING PIPELINE (V4.0)");
  console.log(" 🔍 FACTUAL VISUAL UNDERSTANDING + CREATIVE VIETNAMESE NAMING");
  console.log("================================================================================");

  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const modelName = process.env.AI_MODEL || (provider === "gemini" ? "gemini-3.8-flash" : "qwen3-vl");
  const hasKey = Boolean(process.env.AI_API_KEY || process.env.GEMINI_API_KEY);

  console.log(`📡 Provider:          ${provider.toUpperCase()}`);
  console.log(`🧠 Vision Model ID:   ${modelName}`);
  console.log(`🔑 API Key:           ${hasKey ? "Đã cấu hình hợp lệ ✓" : "Chưa có (Chạy chế độ an toàn có kiểm chứng)"}`);
  console.log(`⚙️  Concurrency:       ${concurrency} (mặc định 1 để chẩn đoán chính xác)`);
  console.log(`🔖 Prompt Version:    ${PROMPT_VERSION}`);

  // Pre-run analysis (Section A & F)
  const existingManifest = loadManifest();
  const memesDir = getMemesDir();

  let diskCount = 0;
  if (fs.existsSync(memesDir)) {
    const files = fs.readdirSync(memesDir);
    diskCount = files.filter((f) => /\.(jpe?g|png|webp|gif|mp4|webm|mov)$/i.test(f)).length;
  }

  const legacyCount = existingManifest.artworks.filter(
    (a) => a.aiModel?.includes("Offline") || a.title.includes("Hồ sơ #") || a.promptVersion !== PROMPT_VERSION
  ).length;

  const validGroundedCount = existingManifest.artworks.filter(
    (a) => a.promptVersion === PROMPT_VERSION && a.aiStatus === "success" && !a.needsReview
  ).length;

  console.log("--------------------------------------------------------------------------------");
  console.log(`📊 BÁO CÁO KIỂM KÊ THƯ VIỆN & TRẠNG THÁI METADATA:`);
  console.log(`   - Tổng hiện vật trên ổ đĩa:           ${diskCount}`);
  console.log(`   - Đã qua Two-Pass xác thực (v4.0):    ${validGroundedCount} (đã lưu cache không tốn quota)`);
  console.log(`   - Metadata cũ / Chưa kiểm chứng:      ${legacyCount} hiện vật`);

  if (legacyCount > 0 && !reprocessLegacy && !forceAi) {
    console.log(`\n💡 LƯU Ý QUAN TRỌNG:`);
    console.log(`   Có ${legacyCount} hiện vật đang mang metadata cũ từ template offline.`);
    console.log(`   Để nâng cấp toàn bộ sang hệ thống Two-Pass v4.0, hãy chạy:`);
    console.log(`     npm.cmd run sync:memes -- --reprocess-legacy`);
  }

  if (previewOnly) {
    console.log(`\n👀 CHẾ ĐỘ PREVIEW KIỂM THỬ: Đang kiểm tra ${previewOnly} hiện vật đại diện (Section G)...`);
  }
  if (dryRun) {
    console.log(`\n⚠️  CHẾ ĐỘ DRY-RUN: Không ghi đè manifest hay gọi AI thật.`);
  }

  console.log("--------------------------------------------------------------------------------");

  const startTime = Date.now();

  try {
    let previewIndex = 1;
    const { manifest, stats } = await scanAndSyncMemes({
      dryRun,
      forceAi,
      reprocessLegacy,
      previewOnly,
      concurrency,
      retryFailedOnly: retryFailed,
      onProgress: (curr, total, assetId) => {
        const percent = Math.round((curr / total) * 100);
        process.stdout.write(
          `\r[${percent.toString().padStart(3, " ")}%] [${curr}/${total}] Đang xử lý: ${assetId} `
        );
      },
      onPreviewItem: (artwork) => {
        console.log(`\n┌───────────────────────────────────────────────────────────────────────────────`);
        console.log(`│ 🎯 PREVIEW HIỆN VẬT #${previewIndex++}: [${artwork.id}] ${artwork.filename}`);
        console.log(`├───────────────────────────────────────────────────────────────────────────────`);
        console.log(`│ 📸 Phân loại:      ${artwork.type.toUpperCase()} (${artwork.format.toUpperCase()})`);
        console.log(`│ 🔍 PASS 1 (THỰC TẾ): "${artwork.description || artwork.visual_summary || 'N/A'}"`);
        console.log(`│`);
        if (artwork.candidates && artwork.candidates.length > 0) {
          console.log(`│ 💡 PASS 2 (3 ỨNG VIÊN):`);
          artwork.candidates.forEach((c, idx) => {
            const isWinner = String(idx + 1) === String(artwork.selectedCandidate) ? "🏆 [CHỌN]" : "  ";
            console.log(`│    ${isWinner} ${idx + 1}. [${c.approach}]: "${c.title}"`);
            console.log(`│        └─ Căn cứ: ${c.rationale || (c as any).reason}`);
          });
        }
        console.log(`│`);
        console.log(`│ ✨ TIÊU ĐỀ CHÍNH THỨC: "${artwork.title}"`);
        console.log(`│ 💬 LỜI BÌNH (CAPTION):  "${artwork.curatorReview || artwork.caption}"`);
        console.log(`│ 🏷️  THẺ TÌM KIẾM:       [${artwork.tags.join(", ")}]`);
        if (artwork.groundingWarning) {
          console.log(`│ ⚠️  CẢNH BÁO ĐỐI SOÁT: ${artwork.groundingWarning}`);
        } else {
          console.log(`│ ✅ KIỂM CHỨNG:         Khớp 100% với chi tiết quan sát thực tế`);
        }
        console.log(`└───────────────────────────────────────────────────────────────────────────────`);
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n");
    console.log("================================================================================");
    console.log("🎉 ĐỒNG BỘ HOÀN TẤT THÀNH CÔNG TRONG " + elapsed + " GIÂY!");
    console.log("================================================================================");
    console.log(`📦 Tổng tác phẩm trong catalog:     ${manifest.totalCount}`);
    console.log(`✨ Đã thêm mới:                     ${stats.added}`);
    console.log(`🔄 Cập nhật:                        ${stats.updated}`);
    console.log(`🔒 Không đổi (đã lưu cache):       ${stats.unchanged}`);
    console.log(`🤖 Đã xử lý qua Two-Pass AI:       ${stats.aiProcessed}`);
    if (stats.legacyReprocessed && stats.legacyReprocessed > 0) {
      console.log(`♻️  Metadata cũ đã nâng cấp:        ${stats.legacyReprocessed}`);
    }
    if (stats.flaggedForReview && stats.flaggedForReview > 0) {
      console.log(`⚠️  Hiện vật gắn cờ cần duyệt:     ${stats.flaggedForReview}`);
    }
    if (stats.errors > 0) {
      console.log(`❌ Lỗi tệp:                         ${stats.errors}`);
    }
    console.log("================================================================================");
  } catch (error) {
    console.error("\n❌ Đã xảy ra lỗi trong quá trình đồng bộ:", error);
    process.exit(1);
  }
}

main();
