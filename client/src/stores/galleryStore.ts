import { create } from 'zustand';
import { GalleryFilters } from '@/types/artwork';

interface GalleryState extends GalleryFilters {
  setSearch: (s: string) => void;
  setType: (t: GalleryFilters['type']) => void;
  setAI: (a: GalleryFilters['ai']) => void;
  setSort: (s: GalleryFilters['sort']) => void;
  setFavorites: (f: boolean) => void;
  setTags: (tags: string[]) => void;
  reset: () => void;
}

const DEFAULTS: GalleryFilters = {
  type: 'all',
  ai: 'all',
  search: '',
  sort: 'newest',
  favorites: false,
  tags: [],
};

export const useGalleryStore = create<GalleryState>()((set) => ({
  ...DEFAULTS,
  setSearch: (search) => set({ search }),
  setType: (type) => set({ type }),
  setAI: (ai) => set({ ai }),
  setSort: (sort) => set({ sort }),
  setFavorites: (favorites) => set({ favorites }),
  setTags: (tags) => set({ tags }),
  reset: () => set(DEFAULTS),
}));
