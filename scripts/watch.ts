import * as path from "path";
import chokidar from "chokidar";
import { scanAndSyncMemes, getMemesDir } from "../lib/memes/scanner";

const memesDir = getMemesDir();

console.log("=========================================================");
console.log(" 👁️  MEMEOF DANH — CHẾ ĐỘ GIÁM SÁT THƯ VIỆN THỜI GIAN THỰC");
console.log(` 📂 Đang theo dõi thư mục: ${memesDir}`);
console.log(" Thả ảnh hoặc video mới vào thư mục để tự động đồng bộ!");
console.log(" Nhấn Ctrl+C để dừng.");
console.log("=========================================================");

let debounceTimer: NodeJS.Timeout | null = null;

function triggerSync() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(async () => {
    console.log("\n⚡ Phát hiện thay đổi trong thư viện! Đang cập nhật catalog...");
    try {
      const { manifest, stats } = await scanAndSyncMemes();
      console.log(`✅ Đồng bộ xong! Tổng số: ${manifest.totalCount} (+${stats.added} mới, ~${stats.updated} cập nhật)`);
    } catch (e) {
      console.error("❌ Lỗi khi tự động đồng bộ:", e);
    }
  }, 1500); // 1.5s debounce for copy completion
}

const watcher = chokidar.watch(memesDir, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 1000,
    pollInterval: 200,
  },
});

watcher
  .on("add", (filePath) => {
    console.log(`📥 Phát hiện file mới: ${path.basename(filePath)}`);
    triggerSync();
  })
  .on("change", (filePath) => {
    console.log(`📝 File thay đổi: ${path.basename(filePath)}`);
    triggerSync();
  })
  .on("unlink", (filePath) => {
    console.log(`🗑️ File đã xóa: ${path.basename(filePath)}`);
    triggerSync();
  });
