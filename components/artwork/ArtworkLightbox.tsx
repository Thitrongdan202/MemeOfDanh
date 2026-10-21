"use client";

import React, { useEffect, useState } from "react";
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
  Check,
  Calendar,
  FileText,
} from "lucide-react";
import { formatBytes, formatDate } from "@/lib/utils";

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

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("artwork", artwork.id);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

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
      console.error("Lỗi khi tạo lại bình luận:", e);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-museum-text/60 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-museum-surface/90 border border-museum-border text-museum-secondary hover:text-museum-text hover:bg-museum-surface transition-all shadow-md"
        title="Đóng (Esc)"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main Lightbox Exhibition Card */}
      <div className="relative w-full max-w-5xl my-auto rounded-xl bg-museum-surface border border-museum-border shadow-modal overflow-hidden flex flex-col lg:flex-row max-h-[90vh]">
        {/* Left: Media Viewport */}
        <div className="relative lg:w-3/5 bg-museum-muted/50 p-4 sm:p-6 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-museum-border overflow-hidden">
          {isVideo ? (
            <video
              src={mediaSrc}
              controls
              autoPlay
              loop
              playsInline
              className="max-h-[70vh] w-auto max-w-full rounded-lg shadow-sm object-contain"
            />
          ) : (
            <img
              src={mediaSrc}
              alt={artwork.title}
              className="max-h-[70vh] w-auto max-w-full rounded-lg shadow-sm object-contain select-none"
            />
          )}

          {/* Navigation Arrows */}
          {hasPrev && (
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-museum-surface/90 hover:bg-museum-surface border border-museum-border text-museum-text hover:text-cobalt transition-all shadow-md"
              title="Tác phẩm trước (←)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {hasNext && (
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-museum-surface/90 hover:bg-museum-surface border border-museum-border text-museum-text hover:text-cobalt transition-all shadow-md"
              title="Tác phẩm tiếp theo (→)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-museum-surface/90 border border-museum-border text-[10px] font-mono text-museum-secondary">
            {artwork.format.toUpperCase()} • {formatBytes(artwork.sizeBytes)}
          </div>
        </div>

        {/* Right: Curatorial Dossier & Analysis Panel */}
        <div className="lg:w-2/5 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto space-y-5 bg-museum-surface">
          <div className="space-y-4 text-left">
            {/* Header info */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-cobalt">
                {artwork.id}
              </span>
              <span className="text-museum-subtle text-[11px]">
                {artwork.humorStyle}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-2xl font-bold tracking-tight text-museum-text leading-snug">
              {artwork.title}
            </h2>

            {/* AI Curator Review Box */}
            <div className="p-4 rounded-xl bg-museum-muted/70 border border-museum-border space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-cobalt flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Bình luận của giám tuyển
                </span>
                <span className="text-museum-subtle text-[10px]">
                  {artwork.aiModel || "Giám tuyển tự động"}
                </span>
              </div>
              <blockquote className="font-serif italic text-sm text-museum-text leading-relaxed">
                "{artwork.curatorReview}"
              </blockquote>
            </div>

            {/* Description / Visual Analysis */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-museum-secondary uppercase tracking-wider block">
                Bối cảnh & quan sát
              </span>
              <p className="text-xs text-museum-secondary leading-relaxed">
                {artwork.description}
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-museum-secondary uppercase tracking-wider block">
                Phân loại
              </span>
              <div className="flex flex-wrap gap-1.5">
                {artwork.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-museum-muted text-museum-secondary border border-museum-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Technical Metadata */}
            <div className="pt-2 border-t border-museum-border text-[11px] text-museum-secondary space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Tên tệp gốc:</span>
                <span className="text-museum-text truncate max-w-[180px]" title={artwork.filename}>
                  {artwork.filename}
                </span>
              </div>
              {artwork.width && artwork.height && (
                <div className="flex justify-between">
                  <span>Kích thước:</span>
                  <span className="text-museum-text">
                    {artwork.width} × {artwork.height} px
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Ngày ghi nhận:</span>
                <span className="text-museum-text">{formatDate(artwork.modifiedAt)}</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-museum-border space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleRegenerateRoast}
                disabled={isRegenerating}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-museum-muted hover:bg-museum-border text-xs font-semibold text-cobalt border border-museum-border transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`}
                />
                <span>{isRegenerating ? "Đang tạo..." : "Bình phẩm lại"}</span>
              </button>

              <button
                onClick={(e) => onToggleFavorite(artwork.id, e)}
                className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                  isFavorite
                    ? "bg-coral-light border-coral text-coral"
                    : "bg-museum-surface hover:bg-museum-muted text-museum-secondary border-museum-border"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-current" : ""}`} />
                <span>{isFavorite ? "Đã lưu" : "Lưu yêu thích"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-museum-surface hover:bg-museum-muted text-xs font-medium text-museum-secondary border border-museum-border transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Đã chép link!</span>
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
                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-museum-surface hover:bg-museum-muted text-xs font-medium text-museum-secondary border border-museum-border transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải file gốc</span>
              </a>
            </div>

            <div className="text-center pt-1 text-[11px] text-museum-subtle">
              Phím tắt: <kbd className="px-1 py-0.5 rounded bg-museum-muted text-museum-text font-mono">←</kbd> Trước • <kbd className="px-1 py-0.5 rounded bg-museum-muted text-museum-text font-mono">→</kbd> Sau • <kbd className="px-1 py-0.5 rounded bg-museum-muted text-museum-text font-mono">Esc</kbd> Đóng
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
