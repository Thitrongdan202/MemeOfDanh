import { scanAndSyncMemes } from "../lib/memes/scanner";
import { formatBytes } from "../lib/utils";

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run") || args.includes("-d");
  const forceAi = args.includes("--ai") || args.includes("-a");

  console.log("=========================================================");
  console.log(" 🏛️  MEMEOF DANH — BẢO TÀNG KIỆT TÁC ĐẦY NGHI VẤN");
  console.log(" 🔄 BẮT ĐẦU ĐỒNG BỘ THƯ VIỆN MEME & CATALOG GIÁM TUYỂN");
  console.log("=========================================================");

  if (dryRun) {
    console.log("⚠️  CHẾ ĐỘ DRY-RUN: Không ghi đè manifest hay tạo thumbnail thật.");
  }
  if (forceAi) {
    console.log("🤖 CHẾ ĐỘ FORCE AI: Tạo lại lời bình giám tuyển cho toàn bộ tác phẩm.");
  }

  const startTime = Date.now();

  try {
    const { manifest, stats } = await scanAndSyncMemes({
      dryRun,
      forceAi,
      onProgress: (curr, total, file) => {
        const percent = Math.round((curr / total) * 100);
        process.stdout.write(`\r[${percent.toString().padStart(3, " ")}%] [${curr}/${total}] Quét: ${file.slice(0, 45).padEnd(45, " ")}`);
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n");
    console.log("---------------------------------------------------------");
    console.log("🎉 ĐỒNG BỘ HOÀN TẤT THÀNH CÔNG TRONG " + elapsed + "s!");
    console.log("---------------------------------------------------------");
    console.log(`📦 Tổng số tác phẩm trong bảo tàng: ${manifest.totalCount}`);
    console.log(`🖼️  Hình ảnh:                       ${manifest.imageCount}`);
    console.log(`🎬 Video chuyển động:               ${manifest.videoCount}`);
    console.log(`✨ Đã thêm mới:                     ${stats.added}`);
    console.log(`🔄 Cập nhật:                        ${stats.updated}`);
    console.log(`🔒 Không đổi (giữ nguyên):          ${stats.unchanged}`);
    console.log(`🗑️  Đã gỡ (không còn trên ổ đĩa):   ${stats.removed}`);
    console.log(`🤖 Xử lý giám tuyển:               ${stats.aiProcessed}`);
    if (stats.errors > 0) {
      console.log(`❌ Lỗi file:                        ${stats.errors}`);
    }
    console.log("---------------------------------------------------------");
    console.log("🚀 Chạy 'npm run dev' để mở bảo tàng trên trình duyệt!");
    console.log("=========================================================");
  } catch (error) {
    console.error("\n❌ Đã xảy ra lỗi trong quá trình đồng bộ:", error);
    process.exit(1);
  }
}

main();
