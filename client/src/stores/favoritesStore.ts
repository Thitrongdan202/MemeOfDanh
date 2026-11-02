import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: new Set<string>(),
      toggleFavorite: (id) =>
        set((state) => {
          const next = new Set(state.favorites);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { favorites: next };
        }),
      isFavorite: (id) => get().favorites.has(id),
      clear: () => set({ favorites: new Set() }),
    }),
    {
      name: 'danhmus-favorites',
      storage: {
        getItem: (name) => {
          const s = localStorage.getItem(name);
          if (!s) return null;
          const parsed = JSON.parse(s);
          parsed.state.favorites = new Set(parsed.state.favorites);
          return parsed;
        },
        setItem: (name, value) => {
          const v = { ...value, state: { ...value.state, favorites: Array.from(value.state.favorites) } };
          localStorage.setItem(name, JSON.stringify(v));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
