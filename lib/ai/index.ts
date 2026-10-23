import { AICurationResponse, GroundedArtworkMetadata } from "./schemas";
import { executeTwoPassPipeline } from "./twoPass";
import { PROMPT_VERSION } from "./prompts";
import * as path from "path";

export interface CurateArtworkParams {
  filePath: string;
  filename: string;
  mediaType: "image" | "video";
  catalogNumber: number;
  hash: string;
  assetId?: string;
  forceAi?: boolean;
  format?: string;
  width?: number;
  height?: number;
}

export interface CurateArtworkResult {
  success: boolean;
  data: AICurationResponse;
  metadata: GroundedArtworkMetadata;
  model: string;
  isAiGenerated: boolean;
  promptVersion: string;
  error?: string;
}

export async function curateArtwork(params: CurateArtworkParams): Promise<CurateArtworkResult> {
  const assetId =
    params.assetId || `DANH-${params.catalogNumber.toString().padStart(3, "0")}`;
  const format =
    params.format || path.extname(params.filename).replace(".", "").toLowerCase();

  const metadata = await executeTwoPassPipeline({
    assetId,
    filename: params.filename,
    filePath: params.filePath,
    mediaType: params.mediaType,
    contentHash: params.hash,
    format,
    width: params.width,
    height: params.height,
  });

  const success = metadata.analysis_status === "success";

  // Map to legacy AICurationResponse for backward compatibility
  const legacyResponse: AICurationResponse = {
    candidates: metadata.candidates || [],
    selected_candidate: (metadata.selectedCandidate === "2"
      ? "B"
      : metadata.selectedCandidate === "3"
      ? "C"
      : "A") as "A" | "B" | "C",
    selection_reason: metadata.selectionReason || "Phân tích 6 tiêu chí",
    title: metadata.title,
    caption: metadata.caption,
    description: metadata.visual_summary,
    tags: metadata.tags,
    humor_style: "Quan sát hài hước",
    needs_review: metadata.review_status === "needs_review",
  };

  return {
    success,
    data: legacyResponse,
    metadata,
    model: metadata.model,
    isAiGenerated: success,
    promptVersion: metadata.prompt_version || PROMPT_VERSION,
    error: metadata.error,
  };
}
