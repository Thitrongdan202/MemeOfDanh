import { z } from "zod";

// --- PASS 1: FACTUAL VISUAL ANALYSIS ---
export const Pass1FactualAnalysisSchema = z.object({
  visual_summary: z
    .string()
    .min(10)
    .max(1200)
    .describe("Mô tả khách quan, trung tính về những gì thực sự nhìn thấy trong hình ảnh hoặc video."),
  observed_subjects: z
    .array(z.string())
    .min(1)
    .describe("Danh sách các đối tượng, người hoặc sinh vật thực tế quan sát được trong khung hình."),
  observed_actions: z
    .array(z.string())
    .default([])
    .describe("Các hành động, cử chỉ, tư thế thực tế quan sát được."),
  setting: z
    .string()
    .default("Không xác định rõ")
    .describe("Bối cảnh không gian thực tế nhìn thấy (trong nhà, ngoài trời, phòng tập, văn phòng...)."),
  uncertainties: z
    .string()
    .optional()
    .default("Không có chi tiết mơ hồ lớn")
    .describe("Những chi tiết không thể xác định chắc chắn (ảnh mờ, góc khuất, bối cảnh thiếu rõ ràng)."),
});

export type Pass1FactualAnalysis = z.infer<typeof Pass1FactualAnalysisSchema>;

// --- PASS 2: CREATIVE VIETNAMESE NAMING ---
export const NamingCandidateSchema = z.object({
  approach: z.enum([
    "direct_punchline",
    "short_meme",
    "unexpected_grounded",
  ]),
  title: z
    .string()
    .min(2)
    .max(80)
    .describe("Tiêu đề ngắn 3-8 từ bằng tiếng Việt tự nhiên, bám sát chi tiết thị giác."),
  rationale: z
    .string()
    .max(250)
    .describe("Căn cứ thị giác cụ thể giải thích cho tiêu đề này."),
});

export type NamingCandidate = z.infer<typeof NamingCandidateSchema>;

export const Pass2NamingResponseSchema = z.object({
  candidates: z
    .array(NamingCandidateSchema)
    .length(3)
    .describe("3 tiêu đề ứng viên (punchline, meme ngắn, liên tưởng bất ngờ bám sát ảnh)."),
  selected_candidate_index: z
    .number()
    .int()
    .min(0)
    .max(2)
    .describe("Chỉ số của ứng viên tốt nhất (0, 1 hoặc 2)."),
  title: z
    .string()
    .min(2)
    .max(80)
    .describe("Tiêu đề được chọn chính thức (3-8 từ, có tính nhịp điệu và bắt trọn hình ảnh)."),
  caption: z
    .string()
    .min(5)
    .max(300)
    .describe("Lời bình hóm hỉnh 1-2 câu phát triển từ dữ kiện thị giác đã quan sát."),
  tags: z
    .array(z.string())
    .min(2)
    .max(10)
    .describe("Các nhãn phân loại phục vụ tìm kiếm thư viện."),
  humor_style: z
    .string()
    .max(60)
    .default("Quan sát hài hước")
    .describe("Thể loại hài hước thể hiện."),
});

export type Pass2NamingResponse = z.infer<typeof Pass2NamingResponseSchema>;

// --- COMBINED GROUNDED METADATA SCHEMA ---
export const GroundedArtworkMetadataSchema = z.object({
  asset_id: z.string(),
  content_hash: z.string(),
  visual_summary: z.string(),
  title: z.string(),
  caption: z.string(),
  tags: z.array(z.string()),
  media_type: z.enum(["image", "video"]),
  model: z.string(),
  prompt_version: z.string(),
  analysis_status: z.enum(["success", "pending", "error", "skipped"]),
  review_status: z.enum(["approved", "needs_review", "flagged"]),
  generated_at: z.string(),
  candidates: z.array(NamingCandidateSchema).optional(),
  selectedCandidate: z.string().optional(),
  selectionReason: z.string().optional(),
  groundingWarning: z.string().optional(),
  error: z.string().optional(),
});

export type GroundedArtworkMetadata = z.infer<typeof GroundedArtworkMetadataSchema>;

// Legacy type compatibility alias
export type AICurationResponse = {
  candidates: NamingCandidate[];
  selected_candidate: "A" | "B" | "C";
  selection_reason: string;
  title: string;
  caption: string;
  description: string;
  tags: string[];
  humor_style: string;
  needs_review?: boolean;
};
