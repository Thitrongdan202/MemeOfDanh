import { AICurationResponse } from "./schemas";
import { getOfflineCuration } from "./providers/offline";
import { curateWithGemini } from "./providers/gemini";

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
  error?: string;
}

export async function curateArtwork(params: CurateArtworkParams): Promise<CurateArtworkResult> {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const apiKey = process.env.AI_API_KEY?.trim();
  const modelName = process.env.AI_MODEL || "gemini-1.5-flash";

  // If no API key or explicit offline provider, use the sophisticated deterministic offline curator
  if (!apiKey || provider === "offline") {
    const offlineData = getOfflineCuration({
      filename: params.filename,
      mediaType: params.mediaType,
      catalogNumber: params.catalogNumber,
      hash: params.hash,
    });

    return {
      success: true,
      data: offlineData,
      model: "Museum Offline Curator v2.0",
      isAiGenerated: false,
    };
  }

  // If provider is Gemini and API key is present
  if (provider === "gemini") {
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
      };
    } catch (err: any) {
      console.warn(`[AI Curator] Failed for ${params.filename}, falling back to offline:`, err?.message || err);
      const fallback = getOfflineCuration({
        filename: params.filename,
        mediaType: params.mediaType,
        catalogNumber: params.catalogNumber,
        hash: params.hash,
      });

      return {
        success: true,
        data: fallback,
        model: "Museum Offline Curator (AI Fallback)",
        isAiGenerated: false,
        error: err?.message || String(err),
      };
    }
  }

  // Default fallback
  const fallback = getOfflineCuration({
    filename: params.filename,
    mediaType: params.mediaType,
    catalogNumber: params.catalogNumber,
    hash: params.hash,
  });

  return {
    success: true,
    data: fallback,
    model: "Museum Offline Curator",
    isAiGenerated: false,
  };
}
