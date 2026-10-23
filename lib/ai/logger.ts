export type ProcessingStage =
  | "INGESTION"
  | "PASS1_FACTUAL_ANALYSIS"
  | "PASS2_CREATIVE_NAMING"
  | "VALIDATION"
  | "PERSISTENCE"
  | "REGENERATION";

export type StageStatus =
  | "STARTED"
  | "SUCCESS"
  | "FAILED"
  | "FLAGGED_REVIEW"
  | "SKIPPED";

export interface StructuredLogEntry {
  timestamp: string;
  asset_id: string;
  content_hash: string;
  model: string;
  stage: ProcessingStage;
  status: StageStatus;
  duration_ms?: number;
  message: string;
  details?: Record<string, any>;
}

/**
 * Structured logger for media ingestion, model inference, and metadata mapping.
 * Strictly avoids logging private image contents, base64 data, or API keys.
 */
export function logAIPipeline(entry: Omit<StructuredLogEntry, "timestamp">): void {
  const logObj: StructuredLogEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };

  // Sanitize details to guarantee no secrets or huge buffers leak into logs
  if (logObj.details) {
    const sanitized: Record<string, any> = {};
    for (const [k, v] of Object.entries(logObj.details)) {
      if (/key|secret|token|password|auth/i.test(k)) {
        sanitized[k] = "[REDACTED]";
      } else if (typeof v === "string" && v.length > 500) {
        sanitized[k] = `${v.slice(0, 100)}... [truncated, length: ${v.length}]`;
      } else {
        sanitized[k] = v;
      }
    }
    logObj.details = sanitized;
  }

  const tag = `[AI:${entry.stage}:${entry.status}]`;
  const timeInfo = entry.duration_ms !== undefined ? ` (${entry.duration_ms}ms)` : "";
  console.log(
    `${logObj.timestamp} ${tag} Asset: ${entry.asset_id} [Hash: ${entry.content_hash.slice(0, 8)}] Model: ${entry.model}${timeInfo} - ${entry.message}`
  );
}
