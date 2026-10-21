"use client";

import React, { useState } from "react";
import { ArtworkMedia } from "@/lib/memes/types";
import { Play, Heart, Maximize2, Sparkles } from "lucide-react";
import { getAmbientGlow } from "@/lib/utils";

interface ArtworkCardProps {
  artwork: ArtworkMedia;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelect: (artwork: ArtworkMedia) => void;
  index: number;
}

export function ArtworkCard({
  artwork,
  isFavorite,
  onToggleFavorite,
  onSelect,
  index,
}: ArtworkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const glow = getAmbientGlow(artwork.hash || artwork.id);

  // Determine media source
  const isVideo = artwork.type === "video";
  const thumbnailSrc = !isVideo && artwork.hash
    ? `/thumbnails/${artwork.hash}.webp`
    : `/api/media/${artwork.safeUrl}`;

  return (
    <div
      onClick={() => onSelect(artwork)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-cursor={isVideo ? "PLAY" : "XEM"}
      className="group relative cursor-pointer rounded-xl overflow-hidden bg-museum-900 border border-museum-800/80 hover:border-lime-accent/50 transition-all duration-300 flex flex-col justify-between"
      style={{
        boxShadow: isHovered
          ? `0 16px 32px -8px rgba(0, 0, 0, 0.8), 0 0 20px -6px ${glow.glow}`
          : "none",
      }}
    >
      {/* Media Container */}
      <div className="relative w-full overflow-hidden bg-museum-950 flex items-center justify-center min-h-[220px]">
        {isVideo ? (
          <div className="relative w-full aspect-[4/3] flex items-center justify-center bg-museum-950">
            <video
              src={`/api/media/${artwork.safeUrl}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              muted
              playsInline
              loop
              autoPlay={isHovered}
            />
            {/* Video Play Badge Indicator */}
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-museum-950/80 backdrop-blur-md border border-museum-700 text-[10px] font-mono text-lime-accent flex items-center space-x-1">
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>CLIP</span>
            </div>
          </div>
        ) : (
          <img
            src={thumbnailSrc}
            alt={artwork.title}
            loading="lazy"
            className="w-full h-auto object-contain max-h-[500px] transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // fallback to raw media api if thumbnail failed
              (e.target as HTMLImageElement).src = `/api/media/${artwork.safeUrl}`;
            }}
          />
        )}

        {/* Catalog ID Tag (Top Left) */}
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-museum-950/80 backdrop-blur-md border border-museum-700 text-[10px] font-mono text-museum-300">
          {artwork.id}
        </div>

        {/* Favorite Button (Top Right / below badge) */}
        <button
          onClick={(e) => onToggleFavorite(artwork.id, e)}
          data-cursor="THÍCH"
          title={isFavorite ? "Bỏ khỏi mục yêu thích" : "Lưu vào mục yêu thích"}
          className={`absolute ${isVideo ? "bottom-3 right-3" : "top-3 right-3"} p-1.5 rounded-full backdrop-blur-md transition-all ${
            isFavorite
              ? "bg-vermilion text-white scale-110 shadow-lg shadow-vermilion/40"
              : "bg-museum-950/70 border border-museum-700 text-museum-400 hover:text-vermilion hover:scale-105 opacity-80 group-hover:opacity-100"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        {/* Subtle Hover Overlay with Punchline Preview */}
        <div className="absolute inset-0 bg-gradient-to-t from-museum-950 via-museum-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
          <p className="font-serif italic text-xs text-lime-accent line-clamp-2">
            "{artwork.curatorReview}"
          </p>
        </div>
      </div>

      {/* Card Metadata Footer */}
      <div className="p-3.5 space-y-2 border-t border-museum-850 bg-museum-900/90">
        <div className="flex items-center justify-between text-[11px] font-mono text-museum-400">
          <span className="truncate max-w-[170px]" title={artwork.filename}>
            {artwork.filename}
          </span>
          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-museum-800 text-museum-300">
            {artwork.format}
          </span>
        </div>

        <h4 className="font-serif text-sm font-semibold text-ivory line-clamp-1 group-hover:text-lime-accent transition-colors">
          {artwork.title}
        </h4>

        {/* Tag pills */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {artwork.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-museum-800/80 text-museum-400 border border-museum-750"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
