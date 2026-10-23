import { AICurationResponse } from "../schemas";
import { executeTwoPassPipeline } from "../twoPass";
import { computeFileHash } from "../../memes/scanner";
import * as path from "path";

export interface GeminiCurateParams {
  apiKey: string;
  modelName?: string;
  filePath: string;
  filename: string;
  mediaType: "image" | "video";
  catalogNumber?: number;
  hash?: string;
}

export async function curateWithGemini(
  params: GeminiCurateParams
): Promise<AICurationResponse> {
  const hash = params.hash || (await computeFileHash(params.filePath));
  const catalogNumber = params.catalogNumber || 1;
  const assetId = `DANH-${catalogNumber.toString().padStart(3, "0")}`;
  const format = path.extname(params.filename).replace(".", "").toLowerCase();

  const grounded = await executeTwoPassPipeline({
    assetId,
    filename: params.filename,
    filePath: params.filePath,
    mediaType: params.mediaType,
    contentHash: hash,
    format,
    apiKey: params.apiKey,
    modelName: params.modelName,
    provider: "gemini",
  });

  return {
    candidates: grounded.candidates || [],
    selected_candidate: (grounded.selectedCandidate === "2"
      ? "B"
      : grounded.selectedCandidate === "3"
      ? "C"
      : "A") as "A" | "B" | "C",
    selection_reason: grounded.selectionReason || "Được lựa chọn qua 6 tiêu chí",
    title: grounded.title,
    caption: grounded.caption,
    description: grounded.visual_summary,
    tags: grounded.tags,
    humor_style: "Quan sát hài hước",
    needs_review: grounded.review_status === "needs_review",
  };
}
