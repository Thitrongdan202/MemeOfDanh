"use client";

import React from "react";
import { ArtworkMedia } from "@/lib/memes/types";
import { ArtworkCard } from "../artwork/ArtworkCard";
import { ImageOff, Sparkles } from "lucide-react";

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
  if (artworks.length === 0) {
    return (
      <div className="w-full py-24 px-4 text-center space-y-4 rounded-2xl border border-museum-800 bg-museum-900/40 my-8">
        <div className="inline-flex p-4 rounded-full bg-museum-850 text-museum-500 mb-2">
          <ImageOff className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-ivory">
          Không tìm thấy kiệt tác nào
        </h3>
        <p className="text-sm font-serif italic text-museum-400 max-w-md mx-auto">
          "Không có tác phẩm nào phù hợp với tiêu chí tìm kiếm. Hãy kiểm tra lại từ khóa hoặc danh mục yêu thích."
        </p>
        <div className="pt-2">
          <button
            onClick={onResetFilters}
            className="px-4 py-2 rounded-md bg-lime-accent text-museum-950 font-mono text-xs font-semibold hover:bg-lime-dim transition-colors"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Editorial Masonry Columns Grid */}
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
    </div>
  );
}
