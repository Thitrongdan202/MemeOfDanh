import { ArtworkMedia, MuseumManifest, SyncStats } from '@/types/artwork';

const BASE = '';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ---- Manifest ----
export async function fetchManifest(): Promise<MuseumManifest> {
  return request<MuseumManifest>('/api/manifest');
}

export async function patchArtwork(id: string, patch: Partial<ArtworkMedia>): Promise<ArtworkMedia> {
  return request<ArtworkMedia>(`/api/manifest/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

// ---- Sync ----
export async function syncLibrary(options?: { dryRun?: boolean }): Promise<{ stats: SyncStats; manifest: MuseumManifest }> {
  return request('/api/sync', {
    method: 'POST',
    body: JSON.stringify(options || {}),
  });
}

// ---- Media URLs ----
export function getMediaUrl(safeUrl: string): string {
  if (!safeUrl) return '';
  const encoded = safeUrl.split('/').map(encodeURIComponent).join('/');
  return `/api/media/${encoded}`;
}

export function getThumbnailUrl(hash: string, fallbackSafeUrl?: string): string {
  if (hash) return `/thumbnails/${hash}.webp`;
  if (fallbackSafeUrl) return getMediaUrl(fallbackSafeUrl);
  return '';
}

// ---- AI ----
export async function roastArtwork(id: string, force = false): Promise<{ success: boolean; artwork: ArtworkMedia; skipped?: boolean }> {
  return request('/api/ai/roast', {
    method: 'POST',
    body: JSON.stringify({ id, force }),
  });
}

export async function reviewList(params?: {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<{ artworks: ArtworkMedia[]; total: number; page: number; limit: number; pages: number }> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.type) qs.set('type', params.type);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return request(`/api/ai/review?${qs}`);
}

export async function reviewAction(
  action: 'approve' | 'flag' | 'select_candidate' | 'regenerate',
  id: string,
  opts?: { candidateIndex?: number }
): Promise<{ success: boolean; artwork: ArtworkMedia }> {
  return request('/api/ai/review', {
    method: 'POST',
    body: JSON.stringify({ action, id, ...opts }),
  });
}
