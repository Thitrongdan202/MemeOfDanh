import { GoogleGenerativeAI } from "@google/generative-ai";
import { AICurationResponse, AICurationResponseSchema } from "../schemas";
import { MUSEUM_CURATOR_SYSTEM_PROMPT, buildCurationUserPrompt } from "../prompts";
import * as fs from "fs";

export async function curateWithGemini(params: {
  apiKey: string;
  modelName?: string;
  filePath: string;
  filename: string;
  mediaType: "image" | "video";
}): Promise<AICurationResponse> {
  const genAI = new GoogleGenerativeAI(params.apiKey);
  const model = genAI.getGenerativeModel({
    model: params.modelName || "gemini-1.5-flash",
    systemInstruction: MUSEUM_CURATOR_SYSTEM_PROMPT,
  });

  const promptText = buildCurationUserPrompt(params.filename, params.mediaType);
  const contents: any[] = [promptText];

  // If image, attach image buffer as inline data
  if (params.mediaType === "image" && fs.existsSync(params.filePath)) {
    try {
      const fileBuffer = fs.readFileSync(params.filePath);
      const ext = params.filename.split(".").pop()?.toLowerCase() || "jpeg";
      const mimeMap: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        gif: "image/gif",
      };
      const mimeType = mimeMap[ext] || "image/jpeg";

      contents.push({
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType,
        },
      });
    } catch (e) {
      console.warn(`[GeminiProvider] Could not load image buffer for ${params.filename}:`, e);
    }
  }

  const result = await model.generateContent(contents);
  const text = result.response.text();

  // Clean JSON string if wrapped in markdown code fence
  let jsonString = text.trim();
  if (jsonString.startsWith("```json")) {
    jsonString = jsonString.slice(7);
  } else if (jsonString.startsWith("```")) {
    jsonString = jsonString.slice(3);
  }
  if (jsonString.endsWith("```")) {
    jsonString = jsonString.slice(0, -3);
  }
  jsonString = jsonString.trim();

  const parsed = JSON.parse(jsonString);
  return AICurationResponseSchema.parse(parsed);
}
