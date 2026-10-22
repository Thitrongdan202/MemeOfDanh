import { scanAndSyncMemes } from "../lib/memes/scanner";
import { loadManifest } from "../lib/memes/manifest";
import * as fs from "fs";
import * as path from "path";
import { getMemesDir } from "../lib/memes/scanner";

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run") || args.includes("-d");
  const forceAi = args.includes("--ai") || args.includes("-a") || args.includes("--force-ai");
  const retryFailed = args.includes("--retry-failed") || args.includes("-r");

  let previewOnly: number | undefined;
  const previewIdx = args.findIndex((arg) => arg === "--preview" || arg === "-p");
  if (previewIdx !== -1) {
    const nextArg = args[previewIdx + 1];
    const parsed = parseInt(nextArg, 10);
    previewOnly = !isNaN(parsed) && parsed > 0 ? parsed : 3;
  }

  console.log("=========================================================");
  console.log(" 🏛️  MEMEOF DANH — BẢO TÀNG KIỆT TÁC ĐẦY NGHI VẤN");
  console.log(" 🤖 AI MEME CURATOR V3.0 (GEMINI 3.8-FLASH & QWEN3-VL)");
  console.log("=========================================================");

  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const modelName = process.env.AI_MODEL || (provider === "gemini" ? "gemini-3.8-flash" : "qwen3-vl");
  const hasKey = Boolean(process.env.AI_API_KEY || process.env.GEMINI_API_KEY);

  console.log(`📡 Provider:    ${provider.toUpperCase()}`);
  console.log(`🧠 Model ID:    ${modelName}`);
  console.log(`🔑 API Key:     ${hasKey ? "Đã cấu hình ✓" : "Chưa có (Chạy chế độ Offline Smart Curator)"}`);

  // Pre-run analysis & cost control (Task 7)
  const existingManifest = loadManifest();
  const memesDir = getMemesDir();

  let diskCount = 0;
  if (fs.existsSync(memesDir)) {
    const files = fs.readdirSync(memesDir);
    diskCount = files.filter((f) => /\.(jpe?g|png|webp|gif|mp4|webm|mov)$/i.test(f)).length;
  }

  const existingValid = existingManifest.artworks.filter(
    (a) => a.aiStatus === "success" && !a.needsReview
  ).length;

  const estimatedAiCalls = forceAi ? diskCount : Math.max(0, diskCount - existingValid);

  console.log("---------------------------------------------------------");
  console.log(`📊 BÁO CÁO THƯ VIỆN & DỰ TOÁN CHI PHÍ / QUOTA:`);
  console.log(`   - Tổng file trên ổ đĩa:      ${diskCount}`);
  console.log(`   - Đã có metadata hợp lệ:     ${existingValid} (sẽ bỏ qua để tiết kiệm chi phí)`);
  console.log(`   - Dự kiến cần gọi AI:        ${estimatedAiCalls} file`);

  if (estimatedAiCalls > 50 && !previewOnly && !dryRun) {
    console.log(`\n⚠️  CẢNH BÁO CHI PHÍ / RATE LIMIT:`);
    console.log(`   Số lượng file cần phân tích (${estimatedAiCalls}) khá lớn.`);
    console.log(`   Mẹo: Bạn có thể chạy 'npm run sync:memes -- --preview 3' để xem trước phong cách đặt tên!`);
  }

  if (dryRun) {
    console.log("\n⚠️  CHẾ ĐỘ DRY-RUN: Không ghi đè manifest hay gọi AI thật.");
  }
  if (previewOnly) {
    console.log(`\n👀 CHẾ ĐỘ PREVIEW: Chỉ thử nghiệm trên ${previewOnly} file đầu tiên.`);
  }

  console.log("---------------------------------------------------------");

  const startTime = Date.now();

  try {
    const { manifest, stats } = await scanAndSyncMemes({
      dryRun,
      forceAi,
      previewOnly,
      retryFailedOnly: retryFailed,
      onProgress: (curr, total, file) => {
        const percent = Math.round((curr / total) * 100);
        process.stdout.write(
          `\r[${percent.toString().padStart(3, " ")}%] [${curr}/${total}] Xử lý: ${file.slice(0, 45).padEnd(45, " ")}`
        );
      },
      onPreviewItem: (artwork) => {
        console.log(`\n\n🎯 [PREVIEW KIỆT TÁC: ${artwork.id} - ${artwork.filename}]`);
        console.log(`   ✦ Tiêu đề chọn: "${artwork.title}"`);
        if (artwork.candidates && artwork.candidates.length > 0) {
          console.log(`   ✦ Ứng viên A (Punchline): "${artwork.candidates[0]?.title}"`);
          console.log(`   ✦ Ứng viên B (Meme):      "${artwork.candidates[1]?.title}"`);
          console.log(`   ✦ Ứng viên C (Sáng tạo):  "${artwork.candidates[2]?.title}"`);
        }
        console.log(`   ✦ Lời bình:     "${artwork.curatorReview}"`);
        console.log(`   ✦ Mô tả thật:   "${artwork.description}"`);
        console.log(`   ✦ Thẻ tìm kiếm: [${artwork.tags.join(", ")}]`);
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n");
    console.log("---------------------------------------------------------");
    console.log("🎉 ĐỒNG BỘ HOÀN TẤT TRONG " + elapsed + " GIÂY!");
    console.log("---------------------------------------------------------");
    console.log(`📦 Tổng tác phẩm trong catalog:     ${manifest.totalCount}`);
    console.log(`🖼️  Hình ảnh:                       ${manifest.imageCount}`);
    console.log(`🎬 Video chuyển động:               ${manifest.videoCount}`);
    console.log(`✨ Đã thêm mới:                     ${stats.added}`);
    console.log(`🔄 Cập nhật:                        ${stats.updated}`);
    console.log(`🔒 Không đổi (đã lưu cache):       ${stats.unchanged}`);
    console.log(`🗑️  Đã gỡ khỏi thư mục:             ${stats.removed}`);
    console.log(`🤖 Đã xử lý qua AI:                ${stats.aiProcessed}`);
    if (stats.errors > 0) {
      console.log(`❌ Lỗi file:                        ${stats.errors}`);
    }
    console.log("---------------------------------------------------------");
    console.log("🚀 Chạy 'npm run dev' để chiêm ngưỡng các kiệt tác!");
    console.log("=========================================================");
  } catch (error) {
    console.error("\n❌ Đã xảy ra lỗi trong quá trình đồng bộ:", error);
    process.exit(1);
  }
}

main();
