import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { AICurationResponse, AICurationResponseSchema } from "../schemas";
import {
  WITTY_MEME_CURATOR_SYSTEM_PROMPT,
  buildCurationUserPrompt,
  isGenericOrBannedTitle,
} from "../prompts";
import * as fs from "fs";
import sharp from "sharp";

export interface GeminiCurateParams {
  apiKey: string;
  modelName?: string;
  filePath: string;
  filename: string;
  mediaType: "image" | "video";
}

/**
 * Prepares an optimized image buffer for Gemini vision analysis.
 * Downscales oversized images in memory WITHOUT touching the original file on disk.
 */
async function prepareImagePayload(
  filePath: string,
  filename: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  const ext = filename.split(".").pop()?.toLowerCase() || "jpeg";
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  const originalMime = mimeMap[ext] || "image/jpeg";

  const stat = fs.statSync(filePath);
  // If file is under 3MB and standard web format, read directly
  if (stat.size <= 3 * 1024 * 1024 && (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp")) {
    const buffer = fs.readFileSync(filePath);
    return { buffer, mimeType: originalMime };
  }

  // Otherwise, safely resize down in memory with sharp
  try {
    const resizedBuffer = await sharp(filePath)
      .resize({
        width: 1920,
        height: 1920,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    return { buffer: resizedBuffer, mimeType: "image/jpeg" };
  } catch {
    // Fallback to raw buffer if sharp fails (e.g. animation or unsupported codec)
    const rawBuffer = fs.readFileSync(filePath);
    return { buffer: rawBuffer, mimeType: originalMime };
  }
}

/**
 * Formats API errors with clear, actionable diagnostics as required by Task 2.
 */
function formatGeminiError(error: any, modelName: string): Error {
  const msg = error?.message || String(error);

  if (msg.includes("404") || msg.includes("not found") || msg.includes("is not found")) {
    return new Error(
      `Model "${modelName}" không khả dụng hoặc chưa hỗ trợ trong tài khoản API của bạn. Vui lòng kiểm tra quyền truy cập trên Google AI Studio hoặc chỉ định model vision khác qua biến môi trường AI_MODEL (ví dụ: AI_MODEL=gemini-2.5-flash hoặc AI_MODEL=gemini-2.0-flash). Chi tiết: ${msg}`
    );
  }

  if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
    return new Error(
      `Hạn mức API (Rate Limit hoặc Quota) của Google Gemini đã vượt ngưỡng. Vui lòng đợi giây lát hoặc nâng cấp hạn mức trên Google AI Studio. Chi tiết: ${msg}`
    );
  }

  if (msg.includes("401") || msg.includes("403") || msg.includes("API key not valid")) {
    return new Error(
      `Khóa API Google Gemini (AI_API_KEY) không hợp lệ hoặc thiếu quyền hạn. Chi tiết: ${msg}`
    );
  }

  return new Error(`Lỗi Google Gemini API (${modelName}): ${msg}`);
}

export async function curateWithGemini(
  params: GeminiCurateParams
): Promise<AICurationResponse> {
  const modelName = params.modelName || process.env.AI_MODEL || "gemini-3.8-flash";
  const genAI = new GoogleGenerativeAI(params.apiKey);
  const fileManager = new GoogleAIFileManager(params.apiKey);

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: WITTY_MEME_CURATOR_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.85,
    },
  });

  const promptText = buildCurationUserPrompt({ mediaType: params.mediaType });
  const contents: any[] = [promptText];
  let uploadedFileUri: string | null = null;
  let uploadedFileName: string | null = null;

  try {
    if (params.mediaType === "video") {
      // Direct video understanding using Google AI File API
      console.log(`[GeminiVision] Đang tải video lên Google AI File API: ${params.filename}...`);
      const uploadResult = await fileManager.uploadFile(params.filePath, {
        mimeType: "video/mp4",
        displayName: `MemeOfDanh_${params.filename.slice(0, 30)}`,
      });

      uploadedFileName = uploadResult.file.name;
      uploadedFileUri = uploadResult.file.uri;

      // Poll until video processing is ACTIVE (max 90 seconds)
      let fileState = uploadResult.file.state;
      let attempts = 0;
      while (fileState === FileState.PROCESSING && attempts < 30) {
        attempts++;
        await new Promise((r) => setTimeout(r, 3000));
        const fileInfo = await fileManager.getFile(uploadedFileName);
        fileState = fileInfo.state;
      }

      if (fileState === FileState.FAILED) {
        throw new Error("Google AI File API xử lý video thất bại.");
      }

      contents.push({
        fileData: {
          mimeType: uploadResult.file.mimeType,
          fileUri: uploadResult.file.uri,
        },
      });
    } else {
      // Image analysis via base64 buffer
      const { buffer, mimeType } = await prepareImagePayload(params.filePath, params.filename);
      contents.push({
        inlineData: {
          data: buffer.toString("base64"),
          mimeType,
        },
      });
    }

    // Call Gemini API
    const response = await model.generateContent(contents);
    const text = response.response.text();

    let parsed = JSON.parse(text);

    // Validate with Zod
    let validated = AICurationResponseSchema.parse(parsed);

    // TASK 4: Check if selected title is generic or banned. If so, retry once.
    if (isGenericOrBannedTitle(validated.title)) {
      console.warn(
        `[GeminiVision] Tiêu đề "${validated.title}" có dấu hiệu sáo mòn. Đang thử lại một lần với góc nhìn quan sát trực tiếp...`
      );

      const retryPrompt = `Tiêu đề vừa rồi hơi chung chung. Hãy quan sát thật kỹ một chi tiết cụ thể, biểu cảm hoặc hành động phi lý nhất trong khung hình và đặt lại 3 ứng viên ngắn (3-8 từ), punchline sắc bén, không dùng từ sáo mòn như 'Nghi thức', 'Hồ sơ', 'Kiệt tác'.`;
      const retryResponse = await model.generateContent([...contents, retryPrompt]);
      const retryText = retryResponse.response.text();
      try {
        const retryParsed = JSON.parse(retryText);
        validated = AICurationResponseSchema.parse(retryParsed);
      } catch {
        // Keep previous validated if retry parsing fails
      }

      // If still generic after retry, flag as needs_review (Task 9)
      if (isGenericOrBannedTitle(validated.title)) {
        validated.needs_review = true;
      }
    }

    return validated;
  } catch (error: any) {
    throw formatGeminiError(error, modelName);
  } finally {
    // Always clean up uploaded video from Google AI File API
    if (uploadedFileName) {
      fileManager.deleteFile(uploadedFileName).catch(() => {
        // Silently ignore cleanup errors
      });
    }
  }
}
