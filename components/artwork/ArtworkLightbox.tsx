"use client";

import React, { useEffect, useState, useRef } from "react";
import { ArtworkMedia } from "@/lib/memes/types";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Download,
  Sparkles,
  RefreshCw,
  Film,
  Calendar,
  FileText,
  Maximize,
  Check,
} from "lucide-react";
import { formatBytes, formatDate, getAmbientGlow } from "@/lib/utils";

interface ArtworkLightboxProps {
  artwork: ArtworkMedia | null;
  allArtworks: ArtworkMedia[];
  onClose: () => void;
  onSelectArtwork: (artwork: ArtworkMedia) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onArtworkUpdated?: (updatedArtwork: ArtworkMedia) => void;
}

export function ArtworkLightbox({
  artwork,
  allArtworks,
  onClose,
  onSelectArtwork,
  isFavorite,
  onToggleFavorite,
  onArtworkUpdated,
}: ArtworkLightboxProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const glow = artwork ? getAmbientGlow(artwork.hash || artwork.id) : null;

  // Find index in allArtworks for Prev / Next
  const currentIndex = artwork
    ? allArtworks.findIndex((a) => a.id === artwork.id)
    : -1;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allArtworks.length - 1 && currentIndex !== -1;

  const handlePrev = () => {
    if (hasPrev) {
      onSelectArtwork(allArtworks[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onSelectArtwork(allArtworks[currentIndex + 1]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!artwork) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [artwork, currentIndex, hasPrev, hasNext]);

  // Prevent background scroll when lightbox is open
  useEffect(() => {
    if (artwork) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [artwork]);

  if (!artwork) return null;

  const isVideo = artwork.type === "video";
  const mediaSrc = `/api/media/${artwork.safeUrl}`;

  // Copy shareable link
  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("artwork", artwork.id);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Regenerate critique
  const handleRegenerateRoast = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/ai/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: artwork.id }),
      });
      const data = await res.json();
      if (data.success && data.artwork && onArtworkUpdated) {
        onArtworkUpdated(data.artwork);
      }
    } catch (e) {
      console.error("Error regenerating roast:", e);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Curated recommendations (same tag or adjacent items)
  const recommendations = allArtworks
    .filter((a) => a.id !== artwork.id)
    .slice(Math.max(0, currentIndex - 2), currentIndex + 3)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-museum-950/95 backdrop-blur-xl p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Close button (top right fixed) */}
      <button
        onClick={onClose}
        data-cursor="ĐÓNG"
        className="fixed top-4 right-4 z-[110] p-2.5 rounded-full bg-museum-900/80 border border-museum-700 text-museum-300 hover:text-ivory hover:border-lime-accent transition-all"
        title="Đóng triển lãm (Esc)"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main Exhibition Box */}
      <div className="relative w-full max-w-6xl my-auto rounded-2xl bg-museum-900 border border-museum-800 shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[92vh]">
        {/* Left: Media Display Area */}
        <div
          className="relative lg:w-3/5 bg-museum-950 flex items-center justify-center p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-museum-800 overflow-hidden"
          style={{
            background: glow
              ? `radial-gradient(circle at center, ${glow.glow} 0%, #07080a 75%)`
              : "#07080a",
          }}
        >
          {isVideo ? (
            <video
              src={mediaSrc}
              controls
              autoPlay
              loop
              playsInline
              className="max-h-[75vh] w-auto max-w-full rounded-lg shadow-2xl object-contain"
            />
          ) : (
            <img
              src={mediaSrc}
              alt={artwork.title}
              className="max-h-[75vh] w-auto max-w-full rounded-lg shadow-2xl object-contain select-none"
            />
          )}

          {/* Prev / Next floating overlay controls */}
          {hasPrev && (
            <button
              onClick={handlePrev}
              data-cursor="TRƯỚC"
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-museum-900/80 hover:bg-museum-800 border border-museum-700 text-ivory hover:text-lime-accent transition-all shadow-lg"
              title="Tác phẩm trước (←)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {hasNext && (
            <button
              onClick={handleNext}
              data-cursor="SAU"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-museum-900/80 hover:bg-museum-800 border border-museum-700 text-ivory hover:text-lime-accent transition-all shadow-lg"
              title="Tác phẩm tiếp theo (→)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Media Format Indicator */}
          <div className="absolute bottom-4 left-4 px-2.5 py-1 rounded-md bg-museum-950/80 border border-museum-800 text-[10px] font-mono text-museum-400">
            {artwork.format.toUpperCase()} • {formatBytes(artwork.sizeBytes)}
          </div>
        </div>

        {/* Right: Curatorial Dossier & Analysis Panel */}
        <div className="lg:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-5">
            {/* Catalog Number & Museum Classification */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-lime-accent font-bold tracking-widest uppercase">
                {artwork.id}
              </span>
              <span className="text-museum-400 uppercase text-[11px]">
                {artwork.humorStyle}
              </span>
            </div>

            {/* Artwork Exhibition Title */}
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ivory leading-snug">
              {artwork.title}
            </h2>

            {/* Curator Review / Roast Box */}
            <div className="relative p-4 rounded-xl bg-museum-850/80 border border-museum-750 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-lime-accent uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  LỜI BÌNH GIÁM TUYỂN
                </span>
                <span className="text-[10px] font-mono text-museum-500">
                  {artwork.aiModel || "Giám tuyển bảo tàng"}
                </span>
              </div>
              <blockquote className="font-serif italic text-base text-ivory leading-relaxed">
                "{artwork.curatorReview}"
              </blockquote>
            </div>

            {/* Visual Description / Analysis */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-museum-400 uppercase tracking-wider">
                PHÂN TÍCH THỊ GIÁC & BỐI CẢNH
              </span>
              <p className="text-xs text-museum-300 font-serif leading-relaxed">
                {artwork.description}
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-museum-400 uppercase tracking-wider">
                PHÂN LOẠI HIỆN VẬT
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {artwork.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-museum-800 text-museum-300 border border-museum-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Specifications Matrix */}
            <div className="pt-2 border-t border-museum-800 text-[11px] font-mono text-museum-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Tệp nguồn:</span>
                <span className="text-ivory truncate max-w-[200px]" title={artwork.filename}>
                  {artwork.filename}
                </span>
              </div>
              {artwork.width && artwork.height && (
                <div className="flex justify-between">
                  <span>Độ phân giải:</span>
                  <span className="text-ivory">
                    {artwork.width} × {artwork.height} px
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Thời điểm ghi nhận:</span>
                <span className="text-ivory">{formatDate(artwork.modifiedAt)}</span>
              </div>
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="pt-4 border-t border-museum-800 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleRegenerateRoast}
                disabled={isRegenerating}
                data-cursor="ROAST"
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-museum-800 hover:bg-museum-750 text-xs font-mono text-lime-accent border border-museum-700 hover:border-lime-accent/50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`}
                />
                <span>{isRegenerating ? "Đang bình phẩm..." : "Bình phẩm lại"}</span>
              </button>

              <button
                onClick={(e) => onToggleFavorite(artwork.id, e)}
                data-cursor="THÍCH"
                className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-mono border transition-colors ${
                  isFavorite
                    ? "bg-vermilion/20 border-vermilion text-vermilion"
                    : "bg-museum-800 hover:bg-museum-750 text-museum-300 border-museum-700"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-current" : ""}`} />
                <span>{isFavorite ? "Đã yêu thích" : "Yêu thích"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyLink}
                data-cursor="SHARE"
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-museum-850 hover:bg-museum-800 text-xs font-mono text-museum-300 border border-museum-800 transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-lime-accent" />
                    <span className="text-lime-accent">Đã chép link!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Sao chép link</span>
                  </>
                )}
              </button>

              <a
                href={mediaSrc}
                download={artwork.filename}
                data-cursor="TẢI"
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-museum-850 hover:bg-museum-800 text-xs font-mono text-museum-300 border border-museum-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải ảnh gốc</span>
              </a>
            </div>

            {/* Keyboard shortcut hints */}
            <div className="text-center pt-2 text-[10px] font-mono text-museum-500">
              Điều hướng phím: <kbd className="px-1 py-0.5 rounded bg-museum-800 text-museum-300">←</kbd> Trước • <kbd className="px-1 py-0.5 rounded bg-museum-800 text-museum-300">→</kbd> Sau • <kbd className="px-1 py-0.5 rounded bg-museum-800 text-museum-300">Esc</kbd> Đóng
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
