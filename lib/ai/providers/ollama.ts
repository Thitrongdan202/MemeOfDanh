import { AICurationResponse, NamingCandidate } from "../schemas";
import {
  PASS1_FACTUAL_SYSTEM_PROMPT,
  PASS2_CREATIVE_SYSTEM_PROMPT,
  buildPass1UserPrompt,
  buildPass2UserPrompt,
  isBannedTitlePattern,
} from "../prompts";
import * as fs from "fs";
import sharp from "sharp";

export interface OllamaCurateParams {
  host?: string;
  modelName?: string;
  filePath: string;
  filename: string;
  mediaType: "image" | "video";
}

/**
 * Checks if Ollama is running and whether the required vision model is installed.
 */
export async function checkOllamaAvailability(
  host: string,
  modelName: string
): Promise<{ available: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${host}/api/tags`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        available: false,
        error: `Ollama trả về mã lỗi HTTP ${res.status}. Vui lòng kiểm tra lại dịch vụ Ollama.`,
      };
    }

    const data = (await res.json()) as { models?: Array<{ name: string }> };
    const installedModels = (data.models || []).map((m) => m.name.toLowerCase());

    const target = modelName.toLowerCase();
    const hasModel = installedModels.some(
      (name) => name === target || name.startsWith(target + ":")
    );

    if (!hasModel) {
      return {
        available: false,
        error: `Model local "${modelName}" chưa được cài đặt trong Ollama (hiện có: ${
          installedModels.length ? installedModels.join(", ") : "chưa có model nào"
        }).\nVui lòng mở terminal và chạy lệnh: ollama run ${modelName}`,
      };
    }

    return { available: true };
  } catch (err: any) {
    if (err.name === "AbortError") {
      return {
        available: false,
        error: `Kết nối tới Ollama tại ${host} bị quá hạn (timeout). Vui lòng kiểm tra ứng dụng Ollama đã được mở chưa.`,
      };
    }
    return {
      available: false,
      error: `Không thể kết nối tới dịch vụ Ollama tại ${host}: ${err?.message || err}`,
    };
  }
}

export async function curateWithOllama(
  params: OllamaCurateParams
): Promise<AICurationResponse> {
  const host = params.host || process.env.OLLAMA_HOST || "http://localhost:11434";
  const modelName = params.modelName || process.env.AI_MODEL || "qwen3-vl";

  // Check Ollama status & model availability
  const check = await checkOllamaAvailability(host, modelName);
  if (!check.available) {
    throw new Error(check.error);
  }

  // Prepare image buffer
  let base64Image = "";
  if (params.mediaType === "image" && fs.existsSync(params.filePath)) {
    const resizedBuffer = await sharp(params.filePath)
      .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    base64Image = resizedBuffer.toString("base64");
  }

  // Pass 1: Factual
  const pass1Prompt = `${PASS1_FACTUAL_SYSTEM_PROMPT}\n\n${buildPass1UserPrompt(params.mediaType)}`;
  const pass1Res = await fetch(`${host}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: "user",
          content: pass1Prompt,
          ...(base64Image ? { images: [base64Image] } : {}),
        },
      ],
      format: "json",
      stream: false,
      options: { temperature: 0.2 },
    }),
  });

  if (!pass1Res.ok) {
    throw new Error(`Lỗi Ollama Pass 1 (${pass1Res.status})`);
  }

  const pass1Json = (await pass1Res.json()) as { message?: { content?: string } };
  let pass1Data = { visual_summary: "Quan sát thực tế", observed_subjects: [], observed_actions: [], setting: "" };
  try {
    pass1Data = JSON.parse(pass1Json.message?.content || "{}");
  } catch {}

  // Pass 2: Creative Naming
  const pass2Prompt = `${PASS2_CREATIVE_SYSTEM_PROMPT}\n\n${buildPass2UserPrompt({
    visualSummary: pass1Data.visual_summary,
    observedSubjects: pass1Data.observed_subjects,
    observedActions: pass1Data.observed_actions,
    setting: pass1Data.setting,
    mediaType: params.mediaType,
  })}`;

  const pass2Res = await fetch(`${host}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: "user",
          content: pass2Prompt,
          ...(base64Image ? { images: [base64Image] } : {}),
        },
      ],
      format: "json",
      stream: false,
      options: { temperature: 0.7 },
    }),
  });

  if (!pass2Res.ok) {
    throw new Error(`Lỗi Ollama Pass 2 (${pass2Res.status})`);
  }

  const pass2Json = (await pass2Res.json()) as { message?: { content?: string } };
  const pass2Data = JSON.parse(pass2Json.message?.content || "{}");

  const candidates: NamingCandidate[] = (pass2Data.candidates || []).map((c: any) => ({
    approach:
      c.approach === "situational"
        ? "situational"
        : c.approach === "unexpected"
        ? "unexpected"
        : "observational",
    title: c.title || "Tác phẩm",
    grounding: c.grounding || "",
    rationale: c.rationale || c.reason || "",
  }));

  const selectedTitle = pass2Data.title || candidates[0]?.title || "Tác phẩm";

  return {
    candidates,
    selected_candidate: "A",
    selection_reason: "Lựa chọn qua Ollama",
    title: selectedTitle,
    caption: pass2Data.caption || pass1Data.visual_summary,
    description: pass1Data.visual_summary,
    tags: pass2Data.tags || ["Ollama"],
    humor_style: "Quan sát",
    needs_review: isBannedTitlePattern(selectedTitle),
  };
}
