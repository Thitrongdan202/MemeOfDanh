import React, { useRef, useCallback } from 'react';
import { Heart, Play, Sparkles, AlertCircle } from 'lucide-react';
import { ArtworkMedia } from '@/types/artwork';
import { getThumbnailUrl, getMediaUrl } from '@/services/api';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { animateFavoritePulse } from '@/lib/animations';
import { cn } from '@/lib/utils';
import styles from './CuratorCard.module.css';

interface CuratorCardProps {
  artwork: ArtworkMedia;
  onClick: (artwork: ArtworkMedia) => void;
  priority?: boolean;
}

export const CuratorCard = React.memo(function CuratorCard({
  artwork,
  onClick,
  priority = false,
}: CuratorCardProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { motionLevel } = useSettingsStore();
  const heartRef = useRef<SVGSVGElement>(null);
  const isFav = isFavorite(artwork.id);

  const thumbUrl = getThumbnailUrl(artwork.hash, artwork.safeUrl);
  const fallbackUrl = getMediaUrl(artwork.safeUrl);

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleFavorite(artwork.id);
      if (heartRef.current && motionLevel !== 'off') {
        animateFavoritePulse(heartRef.current);
      }
    },
    [artwork.id, toggleFavorite, motionLevel]
  );

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src !== fallbackUrl && artwork.type === 'image') {
      img.src = fallbackUrl;
    }
  };

  return (
    <article
      className={styles.card}
      onClick={() => onClick(artwork)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(artwork)}
      aria-label={artwork.title}
    >
      {/* Visual Canvas */}
      <div className={styles.mediaFrame}>
        <img
          src={thumbUrl}
          alt={artwork.title}
          className={styles.image}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={handleImgError}
        />

        {/* Video Keyframe Badge */}
        {artwork.type === 'video' && (
          <div className={styles.videoBadge} aria-label="Video">
            <Play size={11} fill="white" className={styles.playIcon} />
            <span className={styles.videoFormat}>MP4</span>
          </div>
        )}

        {/* Floating Quick Favorite */}
        <button
          className={cn(styles.favBtn, isFav && styles.favBtnActive)}
          onClick={handleFavoriteClick}
          aria-label={isFav ? 'Bỏ thích' : 'Thích'}
        >
          <Heart ref={heartRef} size={13} fill={isFav ? 'currentColor' : 'none'} />
        </button>

        {/* Grounding Status Pill */}
        {artwork.aiGenerated && (
          <div
            className={cn(
              styles.aiPill,
              artwork.groundingWarning ? styles.aiPillWarning : styles.aiPillCurated
            )}
            title={artwork.groundingWarning || 'Đã kiểm chứng khớp thực tế'}
          >
            {artwork.groundingWarning ? <AlertCircle size={10} /> : <Sparkles size={10} />}
          </div>
        )}
      </div>

      {/* Editorial Plaque */}
      <div className={styles.plaque}>
        <div className={styles.indexHeader}>
          <span className={styles.catalogId}>{artwork.id}</span>
          <span className={styles.mediaFormat}>{artwork.format?.toUpperCase()}</span>
        </div>

        <h3 className={styles.title}>{artwork.title}</h3>

        {artwork.caption && (
          <p className={styles.caption}>{artwork.caption}</p>
        )}

        {artwork.tags && artwork.tags.length > 0 && (
          <div className={styles.tagTray}>
            {artwork.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
});
