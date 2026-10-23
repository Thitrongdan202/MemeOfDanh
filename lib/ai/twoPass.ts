import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Pass1FactualAnalysis,
  Pass1FactualAnalysisSchema,
  Pass2NamingResponse,
  Pass2NamingResponseSchema,
  GroundedArtworkMetadata,
} from "./schemas";
import {
  PASS1_FACTUAL_SYSTEM_PROMPT,
  PASS2_CREATIVE_SYSTEM_PROMPT,
  buildPass1UserPrompt,
  buildPass2UserPrompt,
  PROMPT_VERSION,
} from "./prompts";
import { logAIPipeline } from "./logger";
import { validateGrounding, createNeutralFallback } from "./validator";
import { extractVideoKeyframes, VideoKeyframe } from "./video";
import * as fs from "fs";
import sharp from "sharp";

export interface TwoPassExecutionParams {
  assetId: string;
  filename: string;
  filePath: string;
  mediaType: "image" | "video";
  contentHash: string;
  format: string;
  width?: number;
  height?: number;
  apiKey?: string;
  modelName?: string;
  provider?: "gemini" | "ollama" | "offline";
  /** Optional: existing titles from manifest for anti-template deduplication */
  existingTitles?: string[];
}

/**
 * Prepares image buffers safely in memory for vision inference.
 * Never modifies the source file on disk.
 */
async function prepareImagePayload(
  filePath: string
): Promise<{ inlineData: { data: string; mimeType: string } }> {
  const ext = filePath.split(".").pop()?.toLowerCase() || "jpeg";
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  const mimeType = mimeMap[ext] || "image/jpeg";
  const stat = fs.statSync(filePath);

  // If already reasonable size and standard web format, read buffer directly
  if (stat.size <= 2.5 * 1024 * 1024 && (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp")) {
    const buffer = fs.readFileSync(filePath);
    return {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType,
      },
    };
  }

  // Otherwise, safely resize down in memory using sharp
  const resizedBuffer = await sharp(filePath)
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  return {
    inlineData: {
      data: resizedBuffer.toString("base64"),
      mimeType: "image/jpeg",
    },
  };
}

/**
 * Executes Pass 1: Factual Visual Analysis with Gemini.
 */
async function runPass1Gemini(params: {
  genAI: GoogleGenerativeAI;
  modelName: string;
  visualContents: any[];
  mediaType: "image" | "video";
  assetId: string;
  contentHash: string;
}): Promise<Pass1FactualAnalysis> {
  const startTime = Date.now();
  logAIPipeline({
    asset_id: params.assetId,
    content_hash: params.contentHash,
    model: params.modelName,
    stage: "PASS1_FACTUAL_ANALYSIS",
    status: "STARTED",
    message: "Bắt đầu phân tích thị giác khách quan (Pass 1)",
  });

  const model = params.genAI.getGenerativeModel({
    model: params.modelName,
    systemInstruction: PASS1_FACTUAL_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2, // Low temperature for high factual precision
    },
  });

  const userPrompt = buildPass1UserPrompt(params.mediaType);
  const response = await model.generateContent([userPrompt, ...params.visualContents]);
  const text = response.response.text();

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(`Pass 1 trả về JSON không hợp lệ: ${text.slice(0, 200)}`);
  }

  const validated = Pass1FactualAnalysisSchema.parse(parsed);

  logAIPipeline({
    asset_id: params.assetId,
    content_hash: params.contentHash,
    model: params.modelName,
    stage: "PASS1_FACTUAL_ANALYSIS",
    status: "SUCCESS",
    duration_ms: Date.now() - startTime,
    message: "Hoàn tất phân tích thị giác khách quan (Pass 1)",
    details: {
      subjects: validated.observed_subjects,
      actions: validated.observed_actions,
      setting: validated.setting,
    },
  });

  return validated;
}

/**
 * Executes Pass 2: Creative Vietnamese Naming with Gemini.
 */
async function runPass2Gemini(params: {
  genAI: GoogleGenerativeAI;
  modelName: string;
  pass1: Pass1FactualAnalysis;
  visualContents: any[];
  mediaType: "image" | "video";
  assetId: string;
  contentHash: string;
}): Promise<Pass2NamingResponse> {
  const startTime = Date.now();
  logAIPipeline({
    asset_id: params.assetId,
    content_hash: params.contentHash,
    model: params.modelName,
    stage: "PASS2_CREATIVE_NAMING",
    status: "STARTED",
    message: "Bắt đầu đặt tên sáng tạo dựa trên dữ kiện quan sát (Pass 2)",
  });

  const model = params.genAI.getGenerativeModel({
    model: params.modelName,
    systemInstruction: PASS2_CREATIVE_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.8, // Creative exploration grounded in pass 1 evidence
    },
  });

  const userPrompt = buildPass2UserPrompt({
    visualSummary: params.pass1.visual_summary,
    observedSubjects: params.pass1.observed_subjects,
    observedActions: params.pass1.observed_actions,
    setting: params.pass1.setting,
    funnyObservation: params.pass1.funny_observation,
    uncertainties: params.pass1.uncertainties,
    mediaType: params.mediaType,
  });

  const response = await model.generateContent([userPrompt, ...params.visualContents]);
  const text = response.response.text();

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(`Pass 2 trả về JSON không hợp lệ: ${text.slice(0, 200)}`);
  }

  const validated = Pass2NamingResponseSchema.parse(parsed);

  logAIPipeline({
    asset_id: params.assetId,
    content_hash: params.contentHash,
    model: params.modelName,
    stage: "PASS2_CREATIVE_NAMING",
    status: "SUCCESS",
    duration_ms: Date.now() - startTime,
    message: `Đã chọn tiêu đề: "${validated.title}"`,
    details: {
      title: validated.title,
      selected_index: validated.selected_candidate_index,
      caption: validated.caption,
    },
  });

  return validated;
}

/**
 * Core Two-Pass Pipeline:
 * Ingests media -> Pass 1 (Factual) -> Pass 2 (Creative Naming) -> Validation & Grounding -> Output
 */
export async function executeTwoPassPipeline(
  params: TwoPassExecutionParams
): Promise<GroundedArtworkMetadata> {
  const provider = params.provider || (process.env.AI_PROVIDER as any) || "gemini";
  const apiKey = (params.apiKey || process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "").trim();
  const modelName = (params.modelName || process.env.AI_MODEL || "gemini-3.8-flash").trim();

  // Validate file exists
  if (!fs.existsSync(params.filePath)) {
    logAIPipeline({
      asset_id: params.assetId,
      content_hash: params.contentHash,
      model: modelName,
      stage: "INGESTION",
      status: "FAILED",
      message: `Tệp không tồn tại: ${params.filePath}`,
    });
    return createNeutralFallback({
      assetId: params.assetId,
      contentHash: params.contentHash,
      mediaType: params.mediaType,
      model: modelName,
      promptVersion: PROMPT_VERSION,
      filename: params.filename,
      format: params.format,
      width: params.width,
      height: params.height,
      errorReason: "Tệp phương tiện không tồn tại trên đĩa",
      status: "error",
    });
  }

  // Validate that file can be decoded (Section B & H requirement)
  try {
    if (params.mediaType === "image") {
      const meta = await sharp(params.filePath).metadata();
      if (!meta.format) {
        throw new Error("Không thể xác định định dạng hình ảnh");
      }
    }
  } catch (decodeErr: any) {
    const errorMsg = `Tệp hỏng hoặc không thể giải mã: ${decodeErr?.message || decodeErr}`;
    logAIPipeline({
      asset_id: params.assetId,
      content_hash: params.contentHash,
      model: modelName,
      stage: "INGESTION",
      status: "FAILED",
      message: errorMsg,
    });
    return createNeutralFallback({
      assetId: params.assetId,
      contentHash: params.contentHash,
      mediaType: params.mediaType,
      model: modelName,
      promptVersion: PROMPT_VERSION,
      filename: params.filename,
      format: params.format,
      errorReason: errorMsg,
      status: "error",
    });
  }

  // If no API key configured or explicit offline mode, do NOT fabricate fake successes!
  if (!apiKey || provider === "offline") {
    logAIPipeline({
      asset_id: params.assetId,
      content_hash: params.contentHash,
      model: "offline-fallback",
      stage: "INGESTION",
      status: "SKIPPED",
      message: !apiKey
        ? "Thiếu API key. Lưu trữ metadata trung tính, không bịa đặt suy luận."
        : "Chế độ offline kích hoạt. Lưu trữ metadata trung tính có kiểm chứng.",
    });

    return createNeutralFallback({
      assetId: params.assetId,
      contentHash: params.contentHash,
      mediaType: params.mediaType,
      model: !apiKey ? "None (Missing API Key)" : "Offline (No Inference)",
      promptVersion: PROMPT_VERSION,
      filename: params.filename,
      format: params.format,
      width: params.width,
      height: params.height,
      errorReason: !apiKey
        ? "Chưa cấu hình AI_API_KEY. Vui lòng cấu hình khóa Google Gemini trong .env.local để kích hoạt Two-Pass Vision."
        : "Chế độ ngoại tuyến.",
      status: "pending",
    });
  }

  // Prepare visual payloads
  let visualContents: any[] = [];
  try {
    if (params.mediaType === "video") {
      // Extract distributed keyframes using FFmpeg across timeline
      const keyframes = await extractVideoKeyframes(params.filePath, 4);
      for (const kf of keyframes) {
        visualContents.push({
          inlineData: {
            data: kf.buffer.toString("base64"),
            mimeType: kf.mimeType,
          },
        });
      }
    } else {
      const imgPayload = await prepareImagePayload(params.filePath);
      visualContents.push(imgPayload);
    }
  } catch (err: any) {
    logAIPipeline({
      asset_id: params.assetId,
      content_hash: params.contentHash,
      model: modelName,
      stage: "INGESTION",
      status: "FAILED",
      message: `Lỗi nạp phương tiện thị giác: ${err?.message || err}`,
    });

    return createNeutralFallback({
      assetId: params.assetId,
      contentHash: params.contentHash,
      mediaType: params.mediaType,
      model: modelName,
      promptVersion: PROMPT_VERSION,
      filename: params.filename,
      format: params.format,
      width: params.width,
      height: params.height,
      errorReason: `Không thể giải mã phương tiện: ${err?.message || err}`,
      status: "error",
    });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // PASS 1: Factual Visual Analysis
    const pass1 = await runPass1Gemini({
      genAI,
      modelName,
      visualContents,
      mediaType: params.mediaType,
      assetId: params.assetId,
      contentHash: params.contentHash,
    });

    // PASS 2: Creative Vietnamese Naming
    const pass2 = await runPass2Gemini({
      genAI,
      modelName,
      pass1,
      visualContents,
      mediaType: params.mediaType,
      assetId: params.assetId,
      contentHash: params.contentHash,
    });

    // VALIDATION: Ensure grounding and schema conformance
    const validation = validateGrounding({
      assetId: params.assetId,
      contentHash: params.contentHash,
      mediaType: params.mediaType,
      model: modelName,
      promptVersion: PROMPT_VERSION,
      pass1,
      pass2,
      existingTitles: params.existingTitles,
    });

    logAIPipeline({
      asset_id: params.assetId,
      content_hash: params.contentHash,
      model: modelName,
      stage: "VALIDATION",
      status: validation.isValid ? "SUCCESS" : "FLAGGED_REVIEW",
      message: validation.isValid
        ? "Tiêu đề đã được kiểm chứng khớp với quan sát thị giác"
        : `Cảnh báo đối soát: ${validation.warning}`,
      details: {
        title: validation.metadata.title,
        review_status: validation.metadata.review_status,
      },
    });

    return validation.metadata;
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    logAIPipeline({
      asset_id: params.assetId,
      content_hash: params.contentHash,
      model: modelName,
      stage: "PASS1_FACTUAL_ANALYSIS",
      status: "FAILED",
      message: `Lỗi suy luận Two-Pass: ${errorMsg}`,
    });

    return createNeutralFallback({
      assetId: params.assetId,
      contentHash: params.contentHash,
      mediaType: params.mediaType,
      model: modelName,
      promptVersion: PROMPT_VERSION,
      filename: params.filename,
      format: params.format,
      width: params.width,
      height: params.height,
      errorReason: errorMsg,
      status: "error",
    });
  }
}
