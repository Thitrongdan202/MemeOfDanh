import MiniSearch from 'minisearch';
import { ArtworkMedia } from '@/types/artwork';

let searchEngine: MiniSearch<ArtworkMedia> | null = null;
let lastIndexedCount = -1;

export function initSearchIndex(artworks: ArtworkMedia[]): MiniSearch<ArtworkMedia> {
  if (searchEngine && lastIndexedCount === artworks.length) {
    return searchEngine;
  }

  searchEngine = new MiniSearch<ArtworkMedia>({
    fields: ['title', 'caption', 'description', 'visual_summary', 'funny_observation', 'tags', 'id', 'filename'],
    storeFields: ['id'],
    searchOptions: {
      boost: { title: 4, tags: 3, id: 3, caption: 2, funny_observation: 2 },
      fuzzy: 0.2,
      prefix: true,
    },
    extractField: (document, fieldName) => {
      if (fieldName === 'tags' && Array.isArray(document.tags)) {
        return document.tags.join(' ');
      }
      return (document as any)[fieldName] || '';
    },
  });

  searchEngine.addAll(artworks);
  lastIndexedCount = artworks.length;
  return searchEngine;
}

export function searchArtworks(query: string, artworks: ArtworkMedia[]): ArtworkMedia[] {
  if (!query || !query.trim()) {
    return artworks;
  }

  const engine = initSearchIndex(artworks);
  const results = engine.search(query.trim());
  
  if (results.length === 0) {
    // Fallback to simple lowercase substring check
    const q = query.toLowerCase().trim();
    return artworks.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.caption?.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  const idMap = new Map(artworks.map((a) => [a.id, a]));
  return results
    .map((r) => idMap.get(r.id))
    .filter((a): a is ArtworkMedia => a !== undefined);
}
