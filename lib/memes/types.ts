export type MediaType = "image" | "video";

export type AIStatus = "pending" | "success" | "error" | "skipped";

export interface ArtworkMedia {
  id: string; // e.g., "DANH-001"
  catalogNumber: number; // e.g., 1
  filename: string; // relative path from memes dir, e.g., "1756799144192.jpg"
  safeUrl: string; // url-safe identifier or path for web access
  hash: string; // SHA-256 hash of content
  type: MediaType;
  format: string; // e.g., "jpg", "png", "mp4"
  sizeBytes: number;
  modifiedAt: string; // ISO date string
  width?: number;
  height?: number;
  aspectRatio?: number;
  title: string;
  curatorReview: string;
  description: string;
  tags: string[];
  humorStyle: string;
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
