// Artwork types mirroring lib/memes/types.ts for client-side use

export type MediaType = 'image' | 'video';
export type AIStatus = 'pending' | 'success' | 'error' | 'needs_review' | 'skipped';
export type AnalysisStatus = 'success' | 'pending' | 'error' | 'skipped';
export type ReviewStatus = 'approved' | 'needs_review' | 'flagged';

export interface NamingCandidate {
  title: string;
  caption?: string;
  approach?: string;
  reasoning?: string;
  confidence?: number;
}

export interface ArtworkMedia {
  id: string;
  asset_id?: string;
  catalogNumber: number;
  filename: string;
  safeUrl: string;
  hash: string;
  contentHash?: string;
  type: MediaType;
  mediaType?: MediaType;
  format: string;
  sizeBytes: number;
  modifiedAt: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  title: string;
  curatorReview: string;
  caption: string;
  description: string;
  visual_summary?: string;
  funny_observation?: string;
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
  confidence?: number;
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

export type SortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'ai_curated';
export type FilterType = 'all' | 'image' | 'video';
export type FilterAI = 'all' | 'curated' | 'pending' | 'flagged';

export interface GalleryFilters {
  type: FilterType;
  ai: FilterAI;
  search: string;
  sort: SortOption;
  favorites: boolean;
  tags: string[];
}
