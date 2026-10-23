import { loadManifest } from "../lib/memes/manifest";
import { getMemesDir } from "../lib/memes/scanner";
import { executeTwoPassPipeline } from "../lib/ai/twoPass";
import { isBannedTitlePattern, PROMPT_VERSION } from "../lib/ai/prompts";
import { detectTemplateDuplication } from "../lib/ai/validator";
import * as path from "path";
import * as fs from "fs";

/**
 * Script: preview-comparison.ts
 *
 * Demonstrates BEFORE vs. AFTER comparison for diverse assets in MemeOfDanh.
 * Audits current library for generic clichés, banned templates, and offline metadata.
 * When AI_API_KEY is configured, it runs real Two-Pass vision analysis on sample assets.
 */
async function main() {
  console.log("================================================================================");
  console.log(" 🏛️  MEMEOF DANH — BEFORE/AFTER COMPARISON & CLICHÉ AUDIT REPORT");
  console.log("================================================================================");

  const manifest = loadManifest();
  const memesDir = getMemesDir();
  const apiKey = (process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "").trim();
  const hasApiKey = Boolean(apiKey);

  console.log(`📂 Tổng số hiện vật trong manifest:   ${manifest.artworks.length}`);
  console.log(`🔑 Khóa Gemini Vision:               ${hasApiKey ? "ĐÃ CẤU HÌNH ✓" : "CHƯA CẤU HÌNH (Chế độ Audit)"}`);
  console.log(`🔖 Phiên bản Prompt hệ thống:         ${PROMPT_VERSION}`);
  console.log("--------------------------------------------------------------------------------\n");

  // 1. Audit entire manifest for clichés and legacy templates
  const offlineTemplates = manifest.artworks.filter(
    (a) => a.aiModel?.includes("Offline") || a.title.includes("Hồ sơ #")
  );
  const bannedPatternItems = manifest.artworks.filter((a) => isBannedTitlePattern(a.title));
  const genericSpecsTitles = manifest.artworks.filter((a) =>
    /^(Hình ảnh|Video)\s+(JPG|PNG|MP4|WEBP)/i.test(a.title)
  );

  const existingTitles = manifest.artworks.map((a) => a.title).filter(Boolean);
  const duplicatedPrefixes: Record<string, number> = {};
  for (const t of existingTitles) {
    const dup = detectTemplateDuplication(t, existingTitles, 3);
    if (dup) {
      duplicatedPrefixes[dup] = (duplicatedPrefixes[dup] || 0) + 1;
    }
  }

  console.log("📊 KẾT QUẢ AUDIT THƯ VIỆN HIỆN TẠI (193 tác phẩm):");
  console.log(`   - Tiêu đề mang định dạng thông số kỹ thuật (JPG, PNG...):  ${genericSpecsTitles.length}`);
  console.log(`   - Tiêu đề dùng template Offline ("Hồ sơ #..."):            ${offlineTemplates.length}`);
  console.log(`   - Tiêu đề vi phạm danh sách mẫu sáo mòn (Banned):          ${bannedPatternItems.length}`);
  console.log(`   - Cụm từ mở đầu bị lặp lại nhiều lần (>=3 lần):`);
  for (const [prefix, count] of Object.entries(duplicatedPrefixes).slice(0, 5)) {
    console.log(`       • "${prefix}..." (${count} tác phẩm)`);
  }
  console.log("--------------------------------------------------------------------------------\n");

  // 2. Select 10 diverse representative assets
  const sampleIndices = [0, 5, 12, 25, 42, 68, 95, 120, 150, 180];
  const sampleArtworks = sampleIndices
    .map((idx) => manifest.artworks[idx])
    .filter(Boolean);

  console.log(`🎯 SO SÁNH TRỰC DIỆN: 10 HIỆN VẬT ĐẠI DIỆN TRONG CATALOG\n`);

  for (let i = 0; i < sampleArtworks.length; i++) {
    const item = sampleArtworks[i];
    const filePath = path.join(memesDir, item.filename);
    const fileExists = fs.existsSync(filePath);

    console.log(`┌───────────────────────────────────────────────────────────────────────────────`);
    console.log(`│ [${i + 1}/10] HIỆN VẬT: [${item.id}] ${item.filename}`);
    console.log(`├───────────────────────────────────────────────────────────────────────────────`);
    console.log(`│ 📁 Loại tệp:       ${item.type.toUpperCase()} (${item.format.toUpperCase()}) | Kích thước: ${item.width || '?'}×${item.height || '?'}px`);
    console.log(`│ 🔴 TIÊU ĐỀ CŨ:     "${item.title}"`);
    console.log(`│ 💬 CAPTION CŨ:     "${item.curatorReview || item.caption}"`);

    // Cliché assessment on old title
    const isBanned = isBannedTitlePattern(item.title);
    const isOffline = item.aiModel?.includes("Offline") || item.title.includes("Hồ sơ #");
    const isSpecs = /^(Hình ảnh|Video)\s+(JPG|PNG|MP4)/i.test(item.title);

    let oldIssue = "Không có lỗi lớn";
    if (isSpecs) oldIssue = "❌ Tiêu đề kỹ thuật trung tính (chưa phân tích thị giác)";
    else if (isOffline) oldIssue = "❌ Template Offline cũ (chưa qua Gemini Vision)";
    else if (isBanned) oldIssue = "❌ Mẫu từ sáo mòn (nằm trong danh sách cấm)";

    console.log(`│ ⚠️  ĐÁNH GIÁ CŨ:    ${oldIssue}`);
    console.log(`│`);

    // If API key is present and file exists, run live Two-Pass pipeline
    if (hasApiKey && fileExists) {
      console.log(`│ ⏳ Đang gọi Gemini Vision Two-Pass (Pass 1 Factual -> Pass 2 Creative)...`);
      try {
        const result = await executeTwoPassPipeline({
          assetId: item.id,
          filename: item.filename,
          filePath,
          mediaType: item.type,
          contentHash: item.hash,
          format: item.format,
          width: item.width,
          height: item.height,
          existingTitles,
        });

        console.log(`│ 🔍 PASS 1 THỰC TẾ: "${result.visual_summary}"`);
        if (result.funny_observation) {
          console.log(`│ 😂 GÓC HÀI HƯỚC:   "${result.funny_observation}"`);
        }
        if (result.candidates && result.candidates.length > 0) {
          console.log(`│ 💡 3 ỨNG VIÊN PASS 2:`);
          result.candidates.forEach((c, cIdx) => {
            const isWinner = String(cIdx + 1) === String(result.selectedCandidate) ? "🏆" : "  ";
            console.log(`│    ${isWinner} [${c.approach}]: "${c.title}"`);
            if (c.grounding) console.log(`│        └─ Trích: "${c.grounding}"`);
          });
        }
        console.log(`│ 🟢 TIÊU ĐỀ MỚI:    "${result.title}"`);
        console.log(`│ 💬 CAPTION MỚI:    "${result.caption}"`);
        if (result.groundingWarning) {
          console.log(`│ ⚠️  CẢNH BÁO:       ${result.groundingWarning}`);
        } else {
          console.log(`│ ✅ KIỂM CHỨNG:     Khớp chi tiết thị giác thật sự, không văn mẫu`);
        }
      } catch (err: any) {
        console.log(`│ ❌ Lỗi gọi AI:     ${err.message}`);
      }
    } else {
      // Explanation of what Two-Pass v5.0 guarantees
      console.log(`│ 💡 TIÊU CHUẨN TWO-PASS V5.0 SẼ ÁP DỤNG KHI CÓ API KEY:`);
      console.log(`│    1. Pass 1: Bóc tách khách quan khuôn mặt, tư thế, bối cảnh, vật thể.`);
      console.log(`│    2. Pass 2: Sinh 3 ứng viên (Quan sát, Tình huống đời thường, Bất ngờ).`);
      console.log(`│    3. Cấm tuyệt đối: "Nghi thức...", "Khi bạn...", "Hồ sơ #...", "Đỉnh cao...".`);
      console.log(`│    4. Tiêu đề gói gọn trong 3-8 từ tiếng Việt đời thường, dí dỏm, bám sát ảnh.`);
    }

    console.log(`└───────────────────────────────────────────────────────────────────────────────\n`);
  }

  console.log("================================================================================");
  console.log("✨ HƯỚNG DẪN BƯỚC TIẾP THEO CHO NGƯỜI DÙNG:");
  console.log(" 1. Thêm API key Gemini vào tệp `.env.local`: `AI_API_KEY=AIzaSy...`");
  console.log(" 2. Kiểm thử preview 10 hiện vật: `npm.cmd run sync:memes -- --preview 10`");
  console.log(" 3. Nâng cấp toàn bộ 193 hiện vật: `npm.cmd run sync:memes -- --reprocess-legacy`");
  console.log(" 4. Mở trình duyệt tại `http://localhost:3000/ai-review` để duyệt và chọn ứng viên");
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Lỗi kịch bản so sánh:", err);
  process.exit(1);
});
