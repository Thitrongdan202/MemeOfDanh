import { z } from "zod";

export const AICurationResponseSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(80)
    .describe("Tên tác phẩm nghệ thuật trào phúng, ngắn gọn và có chất bảo tàng"),
  caption: z
    .string()
    .min(5)
    .max(300)
    .describe("Lời bình luận giám tuyển dí dỏm bằng tiếng Việt, 1-3 câu có punchline bất ngờ"),
  description: z
    .string()
    .min(5)
    .max(400)
    .describe("Bối cảnh và phân tích thị giác theo phong cách giám tuyển nghệ thuật đương đại"),
  tags: z
    .array(z.string())
    .min(1)
    .max(8)
    .describe("Danh sách nhãn phân loại tác phẩm"),
  humor_style: z
    .string()
    .min(2)
    .max(50)
    .describe("Phong cách hài hước (ví dụ: Châm biếm nhẹ nhàng, Bác học vô tri, Tán dương bất lực)"),
});

export type AICurationResponse = z.infer<typeof AICurationResponseSchema>;
