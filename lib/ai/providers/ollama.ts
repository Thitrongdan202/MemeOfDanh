import { AICurationResponse, AICurationResponseSchema } from "../schemas";
import {
  WITTY_MEME_CURATOR_SYSTEM_PROMPT,
  buildCurationUserPrompt,
  isGenericOrBannedTitle,
} from "../prompts";
import * as fs from "fs";
import sharp from "sharp";

export interface OllamaCurateParams {
  host?: string;
  modelName?: string;
  filePath: string;
  filename: string;
  mediaType: "image" | "video";
}

/**
 * Checks if Ollama is running and whether the required vision model is installed.
 */
export async function checkOllamaAvailability(
  host: string,
  modelName: string
): Promise<{ available: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${host}/api/tags`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        available: false,
        error: `Ollama trả về mã lỗi HTTP ${res.status}. Vui lòng kiểm tra lại dịch vụ Ollama.`,
      };
    }

    const data = (await res.json()) as { models?: Array<{ name: string }> };
    const installedModels = (data.models || []).map((m) => m.name.toLowerCase());

    const target = modelName.toLowerCase();
    const hasModel = installedModels.some(
      (name) => name === target || name.startsWith(target + ":")
    );

    if (!hasModel) {
      return {
        available: false,
        error: `Model local "${modelName}" chưa được cài đặt trong Ollama (hiện có: ${
          installedModels.length ? installedModels.join(", ") : "chưa có model nào"
        }).\nVui lòng mở terminal và chạy lệnh sau để tải model:\n  ollama run ${modelName}\n(Hệ thống tuân thủ nguyên tắc không tự động tải model nhiều GB khi chưa có chỉ định của bạn).`,
      };
    }

    return { available: true };
  } catch (err: any) {
    if (err.name === "AbortError") {
      return {
        available: false,
        error: `Kết nối tới Ollama tại ${host} bị quá hạn (timeout). Vui lòng kiểm tra ứng dụng Ollama đã được mở chưa.`,
      };
    }
    return {
      available: false,
      error: `Không thể kết nối tới dịch vụ Ollama tại ${host}. Vui lòng khởi động Ollama trên máy của bạn trước khi chọn provider local. Chi tiết lỗi: ${err?.message || err}`,
    };
  }
}

export async function curateWithOllama(
  params: OllamaCurateParams
): Promise<AICurationResponse> {
  const host = params.host || process.env.OLLAMA_HOST || "http://localhost:11434";
  const modelName = params.modelName || process.env.AI_MODEL || "qwen3-vl";

  // Check Ollama status & model availability
  const check = await checkOllamaAvailability(host, modelName);
  if (!check.available) {
    throw new Error(check.error);
  }

  // Prepare image buffer
  let base64Image = "";
  if (params.mediaType === "image" && fs.existsSync(params.filePath)) {
    const resizedBuffer = await sharp(params.filePath)
      .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    base64Image = resizedBuffer.toString("base64");
  }

  const promptText = buildCurationUserPrompt({ mediaType: params.mediaType });
  const fullPrompt = `${WITTY_MEME_CURATOR_SYSTEM_PROMPT}\n\n${promptText}\n\nTRẢ VỀ DUY NHẤT ĐỊNH DẠNG JSON HỢP LỆ VỚI CÁC TRƯỜNG: candidates (mảng 3 phần tử), selected_candidate, selection_reason, title, caption, description, tags, humor_style.`;

  const requestBody: any = {
    model: modelName,
    messages: [
      {
        role: "user",
        content: fullPrompt,
        ...(base64Image ? { images: [base64Image] } : {}),
      },
    ],
    format: "json",
    stream: false,
    options: {
      temperature: 0.8,
    },
  };

  const response = await fetch(`${host}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Lỗi từ Ollama API (${response.status}): ${errorBody}`);
  }

  const result = (await response.json()) as { message?: { content?: string } };
  const rawText = result.message?.content?.trim() || "";

  let jsonStr = rawText;
  if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
  if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
  if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);

  const parsed = JSON.parse(jsonStr.trim());
  const validated = AICurationResponseSchema.parse(parsed);

  if (isGenericOrBannedTitle(validated.title)) {
    validated.needs_review = true;
  }

  return validated;
}
