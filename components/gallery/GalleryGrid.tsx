"use client";

import React from "react";
import { ArtworkMedia } from "@/lib/memes/types";
import { ArtworkCard } from "../artwork/ArtworkCard";
import { ImageOff } from "lucide-react";
import { useSettings } from "@/lib/settings/SettingsContext";

interface GalleryGridProps {
  artworks: ArtworkMedia[];
  favorites: Set<string>;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectArtwork: (artwork: ArtworkMedia) => void;
  onResetFilters: () => void;
}

export function GalleryGrid({
  artworks,
  favorites,
  onToggleFavorite,
  onSelectArtwork,
  onResetFilters,
}: GalleryGridProps) {
  const { settings, playSound } = useSettings();

  if (artworks.length === 0) {
    return (
      <div className="w-full py-20 px-6 text-center space-y-4 rounded-xl border border-museum-border bg-museum-surface my-6 shadow-sm">
        <div className="inline-flex p-3 rounded-full bg-museum-muted text-museum-subtle">
          <ImageOff className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-xl font-bold text-museum-text">
          Chưa tìm thấy tác phẩm phù hợp
        </h3>
        <p className="text-sm text-museum-secondary max-w-md mx-auto leading-relaxed">
          Không có kết quả nào trùng với từ khóa tìm kiếm hoặc bộ lọc hiện tại. Bạn có thể thử tìm bằng từ khóa khác hoặc đặt lại bộ lọc.
        </p>
        <div className="pt-2">
          <button
            onClick={() => {
              playSound("pop");
              onResetFilters();
            }}
            className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-sm active:scale-95"
          >
            Đặt lại tất cả bộ lọc
          </button>
        </div>
      </div>
    );
  }

  const isMasonry = settings.galleryLayout === "masonry";

  return (
    <div className="w-full transition-all duration-300">
      {isMasonry ? (
        /* Masonry Multi-column Layout */
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {artworks.map((artwork, idx) => (
            <div key={artwork.id} className="break-inside-avoid">
              <ArtworkCard
                artwork={artwork}
                isFavorite={favorites.has(artwork.id)}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelectArtwork}
                index={idx}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Uniform Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {artworks.map((artwork, idx) => (
            <div key={artwork.id}>
              <ArtworkCard
                artwork={artwork}
                isFavorite={favorites.has(artwork.id)}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelectArtwork}
                index={idx}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
