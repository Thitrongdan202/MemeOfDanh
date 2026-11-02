import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Heart, Play, Sparkles, AlertTriangle, Maximize2
} from 'lucide-react';
import { ArtworkMedia } from '@/types/artwork';
import { getMediaUrl, getThumbnailUrl } from '@/services/api';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { cn } from '@/lib/utils';
import styles from './CinemaFocusView.module.css';

interface CinemaFocusViewProps {
  artworks: ArtworkMedia[];
  onOpenViewer: (artwork: ArtworkMedia) => void;
}

export function CinemaFocusView({ artworks, onOpenViewer }: CinemaFocusViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const current = artworks[activeIndex] || artworks[0];

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : artworks.length - 1));
  }, [artworks.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < artworks.length - 1 ? prev + 1 : 0));
  }, [artworks.length]);

  // Keyboard navigation for cinema mode
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'f' || e.key === 'F') {
        if (current) toggleFavorite(current.id);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handlePrev, handleNext, current, toggleFavorite]);

  // Center active item in filmstrip
  useEffect(() => {
    if (filmstripRef.current) {
      const activeEl = filmstripRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeIndex]);

  if (!current) return null;

  const isFav = isFavorite(current.id);
  const mediaUrl = getMediaUrl(current.safeUrl);
  const thumbUrl = getThumbnailUrl(current.hash, current.safeUrl);

  return (
    <div className={styles.cinemaStage}>
      {/* Main Focal Display */}
      <div className={styles.viewport}>
        {/* Navigation Arrows */}
        <button className={styles.arrowPrev} onClick={handlePrev} aria-label="Tác phẩm trước">
          <ChevronLeft size={28} />
        </button>

        <div className={styles.mediaContainer} onClick={() => onOpenViewer(current)}>
          {current.type === 'video' ? (
            <video
              key={current.id}
              src={mediaUrl}
              controls
              autoPlay
              loop
              playsInline
              className={styles.focalMedia}
            />
          ) : (
            <img
              key={current.id}
              src={mediaUrl || thumbUrl}
              alt={current.title}
              className={styles.focalMedia}
            />
          )}

          <div className={styles.expandHint}>
            <Maximize2 size={16} />
            <span>Mở toàn màn hình</span>
          </div>
        </div>

        <button className={styles.arrowNext} onClick={handleNext} aria-label="Tác phẩm sau">
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Info Plaque */}
      <div className={styles.infoPlaque}>
        <div className={styles.infoLeft}>
          <div className={styles.metaBadgeRow}>
            <span className={styles.catalogTag}>{current.id}</span>
            <span className={styles.formatTag}>{current.type.toUpperCase()} • {current.format?.toUpperCase()}</span>
            {current.aiGenerated && (
              <span className={styles.aiTag}>
                <Sparkles size={11} /> {current.aiModel || 'AI Grounded'}
              </span>
            )}
          </div>
          <h2 className={styles.focalTitle}>{current.title}</h2>
          {current.caption && <p className={styles.focalCaption}>{current.caption}</p>}
        </div>

        <div className={styles.infoRight}>
          <button
            className={cn(styles.favBtn, isFav && styles.favBtnActive)}
            onClick={() => toggleFavorite(current.id)}
            title="Yêu thích (Phím F)"
          >
            <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
            <span>{isFav ? 'Đã thích' : 'Yêu thích'}</span>
          </button>
        </div>
      </div>

      {/* Scrubber Filmstrip */}
      <div ref={filmstripRef} className={styles.filmstrip}>
        {artworks.map((art, idx) => {
          const isActive = idx === activeIndex;
          const thumb = getThumbnailUrl(art.hash, art.safeUrl);
          return (
            <div
              key={art.id}
              className={cn(styles.stripItem, isActive && styles.stripItemActive)}
              onClick={() => setActiveIndex(idx)}
            >
              <img src={thumb} alt="" className={styles.stripThumb} loading="lazy" />
              {art.type === 'video' && (
                <div className={styles.stripVideoIcon}>
                  <Play size={8} fill="white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
