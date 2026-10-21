"use client";

import React, { useState } from "react";
import { ArtworkMedia } from "@/lib/memes/types";
import { Play, Heart, Eye } from "lucide-react";
import { useSettings } from "@/lib/settings/SettingsContext";
import { useTilt } from "@/lib/motion/useTilt";

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
  const [heartPopping, setHeartPopping] = useState(false);
  const { settings, playSound } = useSettings();

  const tiltRef = useTilt<HTMLDivElement>(settings.cardTilt ? 5 : 0);

  const isVideo = artwork.type === "video";
  const thumbnailSrc = !isVideo && artwork.hash
    ? `/thumbnails/${artwork.hash}.webp`
    : `/api/media/${artwork.safeUrl}`;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartPopping(true);
    playSound("heart");
    onToggleFavorite(artwork.id, e);
    setTimeout(() => setHeartPopping(false), 500);
  };

  const handleCardClick = () => {
    playSound("click");
    onSelect(artwork);
  };

  return (
    <div
      ref={tiltRef}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-cursor={isVideo ? "PLAY" : "XEM"}
      className="group cursor-pointer rounded-xl overflow-hidden bg-museum-surface border border-museum-border hover:border-accent shadow-card hover:shadow-cardHover transition-all duration-300 flex flex-col justify-between"
    >
      {/* Media Image Container */}
      <div className="relative w-full overflow-hidden bg-museum-muted flex items-center justify-center min-h-[180px]">
        {isVideo ? (
          <div className="relative w-full aspect-[4/3] flex items-center justify-center bg-museum-muted">
            <video
              src={`/api/media/${artwork.safeUrl}`}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                settings.hoverZoom ? "group-hover:scale-105" : ""
              }`}
              muted
              playsInline
              loop
              autoPlay={isHovered}
            />
            {/* Video Play Badge */}
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-museum-surface/90 backdrop-blur-sm border border-museum-border text-[10px] font-semibold text-coral flex items-center space-x-1 shadow-sm">
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>VIDEO</span>
            </div>
          </div>
        ) : (
          <img
            src={thumbnailSrc}
            alt={artwork.title}
            loading="lazy"
            className={`w-full h-auto object-contain max-h-[480px] transition-transform duration-500 ${
              settings.hoverZoom ? "group-hover:scale-105" : ""
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `/api/media/${artwork.safeUrl}`;
            }}
          />
        )}

        {/* Catalog Number Badge (Top Left) */}
        {settings.showArtworkIndex && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-museum-surface/90 backdrop-blur-sm border border-museum-border text-[10px] font-mono font-medium text-museum-secondary shadow-sm">
            {artwork.id}
          </div>
        )}

        {/* Favorite Button with Pop Animation */}
        <button
          onClick={handleFavoriteClick}
          data-cursor="THÍCH"
          title={isFavorite ? "Bỏ khỏi mục yêu thích" : "Lưu vào mục yêu thích"}
          className={`absolute ${isVideo ? "bottom-2.5 right-2.5" : "top-2.5 right-2.5"} p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 shadow-sm ${
            isFavorite
              ? "bg-coral text-white scale-110 shadow-coral/30"
              : "bg-museum-surface/85 border border-museum-border text-museum-subtle hover:text-coral hover:bg-museum-surface"
          } ${heartPopping ? "scale-125" : ""}`}
        >
          <Heart className={`w-3.5 h-3.5 transition-transform duration-200 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        {/* Hover Overlay with Eye Icon */}
        {settings.showHoverOverlay && (
          <div className="absolute inset-0 bg-museum-text/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center">
            <span className="p-2 rounded-full bg-museum-surface/90 text-museum-text shadow-md scale-75 group-hover:scale-100 transition-transform duration-200">
              <Eye className="w-4 h-4 text-accent" />
            </span>
          </div>
        )}
      </div>

      {/* Card Content Footer */}
      <div className="p-3.5 space-y-2 border-t border-museum-border/60 bg-museum-surface">
        {settings.showMetadata && (
          <div className="flex items-center justify-between text-[11px] text-museum-subtle font-mono">
            <span className="truncate max-w-[170px]" title={artwork.filename}>
              {artwork.filename}
            </span>
            <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-museum-muted text-museum-secondary">
              {artwork.format}
            </span>
          </div>
        )}

        <h4 className="text-sm font-semibold text-museum-text line-clamp-1 group-hover:text-accent transition-colors">
          {artwork.title}
        </h4>

        {/* Curator Quote Snippet */}
        {settings.showCaptions && (
          <p className="font-serif italic text-xs text-museum-secondary line-clamp-2 leading-relaxed">
            "{artwork.curatorReview}"
          </p>
        )}

        {/* Tag pills */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {artwork.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] px-1.5 py-0.5 rounded bg-museum-muted text-museum-secondary"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
