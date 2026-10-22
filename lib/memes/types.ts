import { NamingCandidate } from "../ai/schemas";

export type MediaType = "image" | "video";

export type AIStatus = "pending" | "success" | "error" | "needs_review" | "skipped";

export interface ArtworkMedia {
  id: string; // e.g., "DANH-001"
  catalogNumber: number; // e.g., 1
  filename: string; // relative path from memes dir, e.g., "1756799144192.jpg"
  safeUrl: string; // url-safe identifier or path for web access
  hash: string; // SHA-256 hash of content
  contentHash?: string; // SHA-256 alias for Task 5
  type: MediaType;
  mediaType?: MediaType; // alias for Task 5
  format: string; // e.g., "jpg", "png", "mp4"
  sizeBytes: number;
  modifiedAt: string; // ISO date string
  width?: number;
  height?: number;
  aspectRatio?: number;
  title: string;
  curatorReview: string; // legacy / UI display roast
  caption: string; // Task 5 distinct field
  description: string; // Task 5 neutral factual description
  tags: string[];
  humorStyle?: string;
  candidates?: NamingCandidate[];
  selectedCandidate?: "A" | "B" | "C";
  selectionReason?: string;
  promptVersion?: string;
  needsReview?: boolean;
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
}
