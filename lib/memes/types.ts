import { NamingCandidate } from "../ai/schemas";

export type MediaType = "image" | "video";

export type AIStatus = "pending" | "success" | "error" | "needs_review" | "skipped";
export type AnalysisStatus = "success" | "pending" | "error" | "skipped";
export type ReviewStatus = "approved" | "needs_review" | "flagged";

export interface ArtworkMedia {
  id: string; // e.g., "DANH-001"
  asset_id?: string; // alias for id
  catalogNumber: number; // e.g., 1
  filename: string; // relative path from memes dir, e.g., "1756799144192.jpg"
  safeUrl: string; // url-safe identifier or path for web access
  hash: string; // SHA-256 hash of content
  contentHash?: string; // SHA-256 alias
  type: MediaType;
  mediaType?: MediaType;
  format: string; // e.g., "jpg", "png", "mp4"
  sizeBytes: number;
  modifiedAt: string; // ISO date string
  width?: number;
  height?: number;
  aspectRatio?: number;
  title: string;
  curatorReview: string; // UI display roast
  caption: string; // Witty punchline / roast
  description: string; // Neutral description (or visual summary)
  visual_summary?: string; // Explicit Pass 1 factual visual analysis
  tags: string[];
  humorStyle?: string;
  candidates?: NamingCandidate[];
  selectedCandidate?: string;
  selectionReason?: string;
  promptVersion?: string;
  needsReview?: boolean;
  analysis_status?: AnalysisStatus;
  review_status?: ReviewStatus;
  groundingWarning?: string;
  aiGenerated: boolean;
  aiModel?: string;
  aiStatus: AIStatus;
  aiError?: string;
  aiGeneratedAt?: string;
  featured?: boolean;
}

export interface MuseumManifest {
  version: string;
  lastSyncedAt: string;
  totalCount: number;
  imageCount: number;
  videoCount: number;
  aiCuratedCount: number;
  artworks: ArtworkMedia[];
}

export interface SyncStats {
  added: number;
  updated: number;
  unchanged: number;
  removed: number;
  errors: number;
  aiProcessed: number;
  legacyReprocessed?: number;
  flaggedForReview?: number;
}
