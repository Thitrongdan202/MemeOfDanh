import { z } from "zod";

export const NamingCandidateSchema = z.object({
  approach: z.enum([
    "A_direct_punchline",
    "B_short_meme",
    "C_creative_unexpected",
  ]),
  title: z
    .string()
    .min(2)
    .max(80)
    .describe("Tiêu đề ứng viên bằng tiếng Việt tự nhiên, ngắn gọn (3-8 từ)"),
  reason: z
    .string()
    .max(250)
    .describe("Lý do tạo ra hoặc góc nhìn hài hước của ứng viên này"),
});

export const AICurationResponseSchema = z.object({
  candidates: z
    .array(NamingCandidateSchema)
    .length(3)
    .describe("3 tiêu đề ứng viên theo 3 phong cách A, B, C khác biệt"),
  selected_candidate: z
    .enum(["A", "B", "C"])
    .describe("Ứng viên được AI tự đánh giá là xuất sắc nhất"),
  selection_reason: z
    .string()
    .min(5)
    .max(300)
    .describe("Lý do lựa chọn ứng viên này (dựa trên tính cụ thể, hài hước, tiếng Việt tự nhiên)"),
  title: z
    .string()
    .min(2)
    .max(80)
    .describe("Tiêu đề chính thức được chọn (ngắn, độc đáo, 3-8 từ)"),
  caption: z
    .string()
    .min(5)
    .max(300)
    .describe("Bình luận hài hước / roast 1-2 câu có punchline bất ngờ"),
  description: z
    .string()
    .min(5)
    .max(500)
    .describe("Mô tả trung tính về chi tiết thực tế nhìn thấy trong ảnh/video"),
  tags: z
    .array(z.string())
    .min(2)
    .max(10)
    .describe("Các nhãn phân loại phục vụ tìm kiếm thư viện"),
  humor_style: z
    .string()
    .min(2)
    .max(60)
    .describe("Phong cách hài (ví dụ: Deadpan, Cà khịa thân thiện, Bất lực học đường, Vô tri thực thụ)"),
  needs_review: z
    .boolean()
    .optional()
    .default(false)
    .describe("Đánh dấu true nếu ảnh quá mờ hoặc chi tiết chưa đủ rõ ràng"),
});

export type NamingCandidate = z.infer<typeof NamingCandidateSchema>;
export type AICurationResponse = z.infer<typeof AICurationResponseSchema>;
