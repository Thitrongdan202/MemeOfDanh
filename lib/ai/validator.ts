import {
  GroundedArtworkMetadata,
  Pass1FactualAnalysis,
  Pass2NamingResponse,
} from "./schemas";
import { isBannedTitlePattern } from "./prompts";

export interface GroundingValidationInput {
  assetId: string;
  contentHash: string;
  mediaType: "image" | "video";
  model: string;
  promptVersion: string;
  pass1: Pass1FactualAnalysis;
  pass2: Pass2NamingResponse;
  /** Existing titles in the library for anti-template deduplication check */
  existingTitles?: string[];
}

export interface GroundingValidationResult {
  metadata: GroundedArtworkMetadata;
  isValid: boolean;
  warning?: string;
}

const VIETNAMESE_STOP_WORDS = new Set([
  "của", "và", "như", "là", "trong", "đang", "đã", "vừa", "thì", "ở", "với",
  "cho", "được", "bị", "một", "những", "các", "có", "không", "này", "đó",
  "ra", "vào", "lại", "qua", "vẫn", "còn", "rồi", "khi", "để", "làm", "thế",
  "ai", "sao", "gì", "nào", "hết", "chưa", "tới", "lên", "xuống",
]);

/**
 * Detects if a new title reuses the same opening phrase as many existing titles.
 * Returns the detected pattern prefix if above threshold, otherwise null.
 */
export function detectTemplateDuplication(
  newTitle: string,
  existingTitles: string[],
  thresholdCount = 4
): string | null {
  if (!newTitle || existingTitles.length === 0) return null;

  const normalizedNew = newTitle.trim().toLowerCase();
  const words = normalizedNew.split(/\s+/);
  if (words.length < 2) return null;

  // Check 1-word, 2-word, and 3-word prefixes
  for (let prefixLen = 3; prefixLen >= 1; prefixLen--) {
    if (words.length <= prefixLen) continue;
    const prefix = words.slice(0, prefixLen).join(" ");
    if (prefix.length < 3) continue; // skip trivially short prefixes

    const count = existingTitles.filter((t) =>
      t.trim().toLowerCase().startsWith(prefix)
    ).length;

    if (count >= thresholdCount) {
      return prefix;
    }
  }

  return null;
}

/**
 * Validates that the creative naming output is properly grounded in the factual visual analysis.
 * Flags discrepancies or generic clichés for human review rather than fabricating certainty.
 */
export function validateGrounding(input: GroundingValidationInput): GroundingValidationResult {
  const { pass1, pass2, assetId, contentHash, mediaType, model, promptVersion, existingTitles = [] } = input;
  const warnings: string[] = [];
  let reviewStatus: "approved" | "needs_review" | "flagged" = "approved";

  const title = (pass2.title || "").trim();
  const words = title.split(/\s+/).filter(Boolean);

  // 1. Validate title presence and length
  if (!title || words.length === 0) {
    warnings.push("Tiêu đề rỗng");
    reviewStatus = "needs_review";
  } else if (words.length > 12) {
    warnings.push(`Tiêu đề quá dài (${words.length} từ, khuyến nghị 3-8 từ)`);
    reviewStatus = "needs_review";
  }

  // 2. Validate banned template patterns
  if (isBannedTitlePattern(title)) {
    warnings.push(`Tiêu đề chứa mẫu từ sáo mòn ("${title}")`);
    reviewStatus = "needs_review";
  }

  // 3. Anti-template deduplication: check if this title's opening matches many existing titles
  const duplicatedPrefix = detectTemplateDuplication(title, existingTitles);
  if (duplicatedPrefix) {
    warnings.push(`Tiêu đề bắt đầu bằng cụm từ lặp lại trong thư viện ("${duplicatedPrefix}...")`);
    reviewStatus = "needs_review";
  }

  // 4. Validate visual grounding: Check for hallucinated entities
  const visualTextLower = (
    `${pass1.visual_summary} ${pass1.observed_subjects.join(" ")} ${pass1.observed_actions.join(" ")} ${pass1.setting}`
  ).toLowerCase();

  const suspiciousEntities = ["mèo", "chó", "ô tô", "xe máy", "máy bay", "em bé", "bãi biển", "thú cưng", "cá", "chim"];
  for (const entity of suspiciousEntities) {
    if (title.toLowerCase().includes(entity) && !visualTextLower.includes(entity)) {
      warnings.push(`Tiêu đề đề cập thực thể "${entity}" không có trong phân tích thị giác`);
      reviewStatus = "needs_review";
    }
  }

  // 5. Confidence check: low confidence warrants review
  const confidence = (pass2 as any).confidence as number | undefined;
  if (typeof confidence === "number" && confidence < 0.4) {
    warnings.push(`Độ tự tin thấp (${confidence.toFixed(2)}) — có thể tiêu đề chưa bám sát hình ảnh`);
    if (reviewStatus === "approved") reviewStatus = "needs_review";
  }

  const selectedCandidateObj =
    pass2.candidates[pass2.selected_candidate_index] || pass2.candidates[0];

  const groundingWarning = warnings.length > 0 ? warnings.join("; ") : undefined;

  const metadata: GroundedArtworkMetadata = {
    asset_id: assetId,
    content_hash: contentHash,
    visual_summary: pass1.visual_summary,
    funny_observation: pass1.funny_observation || "",
    title: title || `Tác phẩm ${assetId}`,
    caption: pass2.caption,
    tags: pass2.tags,
    media_type: mediaType,
    model,
    prompt_version: promptVersion,
    analysis_status: "success",
    review_status: reviewStatus,
    generated_at: new Date().toISOString(),
    candidates: pass2.candidates,
    selectedCandidate: String(pass2.selected_candidate_index + 1),
    selectionReason: selectedCandidateObj?.rationale || "Được lựa chọn qua 5 tiêu chí",
    confidence: typeof confidence === "number" ? confidence : undefined,
    groundingWarning,
  };

  return {
    metadata,
    isValid: reviewStatus === "approved",
    warning: groundingWarning,
  };
}

/**
 * Creates a verified neutral fallback when the model fails, quota is exhausted,
 * or API key is not configured. NEVER fabricates a fake success.
 */
export function createNeutralFallback(params: {
  assetId: string;
  contentHash: string;
  mediaType: "image" | "video";
  model: string;
  promptVersion: string;
  filename: string;
  format: string;
  width?: number;
  height?: number;
  errorReason: string;
  status?: "pending" | "error" | "skipped";
}): GroundedArtworkMetadata {
  const dims = params.width && params.height ? `${params.width}×${params.height}` : "";
  const formatUpper = params.format.toUpperCase();
  const neutralTitle = dims
    ? `${params.mediaType === "video" ? "Video" : "Hình ảnh"} ${formatUpper} (${dims})`
    : `${params.mediaType === "video" ? "Video" : "Hình ảnh"} ${formatUpper} #${params.assetId}`;

  const factualSummary = dims
    ? `Tệp ${params.mediaType} định dạng ${formatUpper}, độ phân giải ${dims}px, mã tệp: ${params.filename}. Hiện vật chưa qua phân tích AI sâu.`
    : `Tệp ${params.mediaType} định dạng ${formatUpper}, mã tệp: ${params.filename}. Hiện vật chưa qua phân tích AI sâu.`;

  return {
    asset_id: params.assetId,
    content_hash: params.contentHash,
    visual_summary: factualSummary,
    funny_observation: "",
    title: neutralTitle,
    caption: "Hiện vật đang lưu giữ trong bộ sưu tập, chờ phân tích thị giác xác thực.",
    tags: [formatUpper, params.mediaType === "video" ? "Video" : "Ảnh"],
    media_type: params.mediaType,
    model: params.model,
    prompt_version: params.promptVersion,
    analysis_status: params.status || "error",
    review_status: "needs_review",
    generated_at: new Date().toISOString(),
    error: params.errorReason,
    groundingWarning: `Chưa qua suy luận thị giác: ${params.errorReason}`,
  };
}
