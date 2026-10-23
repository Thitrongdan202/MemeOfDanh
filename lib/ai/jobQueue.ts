import { GroundedArtworkMetadata } from "./schemas";
import { executeTwoPassPipeline } from "./twoPass";
import { logAIPipeline } from "./logger";
import { loadManifest, saveManifest } from "../memes/manifest";
import { ArtworkMedia, MuseumManifest } from "../memes/types";

export interface AssetJob {
  assetId: string;
  catalogNumber: number;
  filename: string;
  filePath: string;
  mediaType: "image" | "video";
  format: string;
  contentHash: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  aspectRatio?: number;
  modifiedAt: string;
  existingArtwork?: ArtworkMedia;
}

export interface JobQueueOptions {
  concurrency?: number;
  onJobStarted?: (job: AssetJob, activeCount: number) => void;
  onJobCompleted?: (job: AssetJob, result: GroundedArtworkMetadata) => void;
  onProgress?: (completed: number, total: number, currentAssetId: string) => void;
}

export interface JobQueueSummary {
  total: number;
  processed: number;
  succeeded: number;
  flaggedForReview: number;
  failed: number;
}

/**
 * Queue-level mutex to guarantee atomic writes to manifest.json.
 * Avoids race conditions where concurrent workers overwrite unrelated records.
 */
let manifestWriteLock = Promise.resolve();

export function updateManifestRecordAtomically(
  assetId: string,
  updater: (existingList: ArtworkMedia[]) => ArtworkMedia[]
): Promise<void> {
  const nextLock = manifestWriteLock.then(async () => {
    try {
      const currentManifest = loadManifest();
      const updatedArtworks = updater(currentManifest.artworks);

      const newManifest: MuseumManifest = {
        ...currentManifest,
        lastSyncedAt: new Date().toISOString(),
        totalCount: updatedArtworks.length,
        imageCount: updatedArtworks.filter((a) => a.type === "image").length,
        videoCount: updatedArtworks.filter((a) => a.type === "video").length,
        aiCuratedCount: updatedArtworks.filter((a) => a.aiGenerated).length,
        artworks: updatedArtworks,
      };

      saveManifest(newManifest, false);
    } catch (err) {
      console.error(`[JobQueue] Lỗi cập nhật manifest cho ${assetId}:`, err);
    }
  });

  manifestWriteLock = nextLock;
  return nextLock;
}

/**
 * Processes assets independently with bounded concurrency.
 * Strictly guarantees 1 asset per inference request and maps metadata explicitly by asset ID.
 */
export async function processAssetJobQueue(
  jobs: AssetJob[],
  options: JobQueueOptions = {}
): Promise<JobQueueSummary> {
  const concurrency = Math.max(1, options.concurrency || 1);
  const total = jobs.length;
  let currentIndex = 0;
  let completedCount = 0;

  const summary: JobQueueSummary = {
    total,
    processed: 0,
    succeeded: 0,
    flaggedForReview: 0,
    failed: 0,
  };

  if (total === 0) return summary;

  async function worker(workerId: number): Promise<void> {
    while (currentIndex < total) {
      const jobIndex = currentIndex++;
      if (jobIndex >= total) break;

      const job = jobs[jobIndex];
      options.onJobStarted?.(job, workerId);

      const startTime = Date.now();
      logAIPipeline({
        asset_id: job.assetId,
        content_hash: job.contentHash,
        model: process.env.AI_MODEL || "gemini-3.8-flash",
        stage: "INGESTION",
        status: "STARTED",
        message: `Bắt đầu xử lý Job độc lập (Worker #${workerId}): ${job.filename}`,
      });

      let result: GroundedArtworkMetadata;
      try {
        const currentManifest = loadManifest();
        const existingTitles = currentManifest.artworks.map((a) => a.title).filter(Boolean);

        result = await executeTwoPassPipeline({
          assetId: job.assetId,
          filename: job.filename,
          filePath: job.filePath,
          mediaType: job.mediaType,
          contentHash: job.contentHash,
          format: job.format,
          width: job.width,
          height: job.height,
          existingTitles,
        });
      } catch (err: any) {
        summary.failed++;
        logAIPipeline({
          asset_id: job.assetId,
          content_hash: job.contentHash,
          model: process.env.AI_MODEL || "gemini-3.8-flash",
          stage: "VALIDATION",
          status: "FAILED",
          message: `Lỗi thực thi Job: ${err?.message || err}`,
        });
        continue;
      }

      // Update statistics
      if (result.analysis_status === "success") {
        if (result.review_status === "needs_review") {
          summary.flaggedForReview++;
        } else {
          summary.succeeded++;
        }
      } else {
        summary.failed++;
      }
      summary.processed++;

      // Construct verified artwork entity
      const safeUrl = encodeURIComponent(job.filename).replace(/%2F/g, "/");
      const updatedArtwork: ArtworkMedia = {
        id: job.assetId,
        asset_id: job.assetId,
        catalogNumber: job.catalogNumber,
        filename: job.filename,
        safeUrl,
        hash: job.contentHash,
        contentHash: job.contentHash,
        type: job.mediaType,
        mediaType: job.mediaType,
        format: job.format,
        sizeBytes: job.sizeBytes,
        modifiedAt: job.modifiedAt,
        width: job.width,
        height: job.height,
        aspectRatio: job.aspectRatio,
        title: result.title,
        curatorReview: result.caption,
        caption: result.caption,
        description: result.visual_summary,
        visual_summary: result.visual_summary,
        funny_observation: result.funny_observation,
        tags: result.tags,
        humorStyle: (result as any).humor_style || "Quan sát hài hước",
        candidates: result.candidates,
        selectedCandidate: result.selectedCandidate,
        selectionReason: result.selectionReason,
        promptVersion: result.prompt_version,
        needsReview: result.review_status === "needs_review",
        analysis_status: result.analysis_status,
        review_status: result.review_status,
        groundingWarning: result.groundingWarning,
        confidence: result.confidence,
        aiGenerated: result.analysis_status === "success",
        aiModel: result.model,
        aiStatus: result.analysis_status,
        aiError: result.error,
        aiGeneratedAt: result.generated_at,
        featured: job.catalogNumber === 1 || job.catalogNumber === 15 || job.catalogNumber === 42,
      };

      // Atomic persistence by explicit Asset ID
      await updateManifestRecordAtomically(job.assetId, (artworks) => {
        const idx = artworks.findIndex((a) => a.id === job.assetId || a.filename === job.filename);
        if (idx !== -1) {
          const clone = [...artworks];
          clone[idx] = updatedArtwork;
          return clone;
        } else {
          return [...artworks, updatedArtwork];
        }
      });

      completedCount++;
      options.onJobCompleted?.(job, result);
      options.onProgress?.(completedCount, total, job.assetId);

      logAIPipeline({
        asset_id: job.assetId,
        content_hash: job.contentHash,
        model: result.model,
        stage: "PERSISTENCE",
        status: "SUCCESS",
        duration_ms: Date.now() - startTime,
        message: `Đã lưu metadata xác thực cho ${job.assetId}: "${result.title}"`,
      });
    }
  }

  // Launch workers up to bounded concurrency
  const workerPromises = Array.from({ length: concurrency }, (_, i) => worker(i + 1));
  await Promise.all(workerPromises);

  return summary;
}
