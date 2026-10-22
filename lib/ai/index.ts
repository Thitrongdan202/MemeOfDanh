import { AICurationResponse } from "./schemas";
import { getOfflineCuration } from "./providers/offline";
import { curateWithGemini } from "./providers/gemini";
import { curateWithOllama } from "./providers/ollama";
import { PROMPT_VERSION } from "./prompts";

export interface CurateArtworkParams {
  filePath: string;
  filename: string;
  mediaType: "image" | "video";
  catalogNumber: number;
  hash: string;
  forceAi?: boolean;
}

export interface CurateArtworkResult {
  success: boolean;
  data: AICurationResponse;
  model: string;
  isAiGenerated: boolean;
  promptVersion: string;
  error?: string;
}

export async function curateArtwork(params: CurateArtworkParams): Promise<CurateArtworkResult> {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase().trim();
  const apiKey = (process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "").trim();
  const modelName = (process.env.AI_MODEL || "gemini-3.8-flash").trim();

  // 1. Explicit Offline Curator
  if (provider === "offline") {
    const offlineData = getOfflineCuration({
      filename: params.filename,
      mediaType: params.mediaType,
      catalogNumber: params.catalogNumber,
      hash: params.hash,
    });

    return {
      success: true,
      data: offlineData,
      model: "Offline Smart Curator v3.0",
      isAiGenerated: false,
      promptVersion: PROMPT_VERSION,
    };
  }

  // 2. Local Ollama Provider (Qwen3-VL / Qwen2.5-VL)
  if (provider === "ollama") {
    try {
      const ollamaData = await curateWithOllama({
        modelName: process.env.AI_MODEL || "qwen3-vl",
        filePath: params.filePath,
        filename: params.filename,
        mediaType: params.mediaType,
      });

      return {
        success: true,
        data: ollamaData,
        model: `ollama (${process.env.AI_MODEL || "qwen3-vl"})`,
        isAiGenerated: true,
        promptVersion: PROMPT_VERSION,
      };
    } catch (err: any) {
      console.warn(`[AI Curator: Ollama] Lỗi xử lý ${params.filename}:`, err?.message || err);
      const fallback = getOfflineCuration({
        filename: params.filename,
        mediaType: params.mediaType,
        catalogNumber: params.catalogNumber,
        hash: params.hash,
      });

      return {
        success: false,
        data: fallback,
        model: `ollama (${process.env.AI_MODEL || "qwen3-vl"}) [LỖI]`,
        isAiGenerated: false,
        promptVersion: PROMPT_VERSION,
        error: err?.message || String(err),
      };
    }
  }

  // 3. Google Gemini Developer API (Primary Provider: gemini-3.8-flash)
  if (provider === "gemini") {
    if (!apiKey) {
      // Missing API key: Provide clear instructions and fallback
      const offlineData = getOfflineCuration({
        filename: params.filename,
        mediaType: params.mediaType,
        catalogNumber: params.catalogNumber,
        hash: params.hash,
      });

      return {
        success: false,
        data: offlineData,
        model: `gemini (${modelName}) [THIẾU API KEY]`,
        isAiGenerated: false,
        promptVersion: PROMPT_VERSION,
        error: "Chưa cấu hình AI_API_KEY trong file .env.local. Vui lòng nhập API key Google Gemini để kích hoạt phân tích ảnh/video thực tế.",
      };
    }

    try {
      const aiData = await curateWithGemini({
        apiKey,
        modelName,
        filePath: params.filePath,
        filename: params.filename,
        mediaType: params.mediaType,
      });

      return {
        success: true,
        data: aiData,
        model: `gemini (${modelName})`,
        isAiGenerated: true,
        promptVersion: PROMPT_VERSION,
      };
    } catch (err: any) {
      console.warn(`[AI Curator: Gemini] Lỗi xử lý ${params.filename}:`, err?.message || err);
      const fallback = getOfflineCuration({
        filename: params.filename,
        mediaType: params.mediaType,
        catalogNumber: params.catalogNumber,
        hash: params.hash,
      });

      return {
        success: false,
        data: fallback,
        model: `gemini (${modelName}) [LỖI API]`,
        isAiGenerated: false,
        promptVersion: PROMPT_VERSION,
        error: err?.message || String(err),
      };
    }
  }

  // 4. Fallback for unrecognized provider
  const fallback = getOfflineCuration({
    filename: params.filename,
    mediaType: params.mediaType,
    catalogNumber: params.catalogNumber,
    hash: params.hash,
  });

  return {
    success: false,
    data: fallback,
    model: `Provider không xác định: ${provider}`,
    isAiGenerated: false,
    promptVersion: PROMPT_VERSION,
    error: `AI_PROVIDER="${provider}" không được hỗ trợ. Hãy chọn "gemini", "ollama", hoặc "offline".`,
  };
}
