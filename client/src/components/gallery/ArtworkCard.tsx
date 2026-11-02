import React, { useRef, useCallback } from 'react';
import { Heart, Play, Sparkles, AlertTriangle, Eye } from 'lucide-react';
import { ArtworkMedia } from '@/types/artwork';
import { getThumbnailUrl, getMediaUrl } from '@/services/api';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { animateFavoritePulse } from '@/lib/animations';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import styles from './ArtworkCard.module.css';

interface ArtworkCardProps {
  artwork: ArtworkMedia;
  onClick: (artwork: ArtworkMedia) => void;
  style?: React.CSSProperties;
}

export const ArtworkCard = React.memo(function ArtworkCard({
  artwork,
  onClick,
  style,
}: ArtworkCardProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { motionLevel } = useSettingsStore();
  const heartRef = useRef<SVGSVGElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isFav = isFavorite(artwork.id);

  const thumbnailUrl = getThumbnailUrl(artwork.hash, artwork.safeUrl);
  const mediaUrl = getMediaUrl(artwork.safeUrl);

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleFavorite(artwork.id);
      if (heartRef.current && motionLevel !== 'off') {
        animateFavoritePulse(heartRef.current);
      }
    },
    [artwork.id, toggleFavorite, motionLevel]
  );

  const handleImgError = () => {
    if (imgRef.current && imgRef.current.src !== mediaUrl) {
      imgRef.current.src = mediaUrl;
    }
  };

  const aiStatusClass =
    artwork.aiStatus === 'success'
      ? styles.aiSuccess
      : artwork.aiStatus === 'error' || artwork.review_status === 'flagged'
      ? styles.aiError
      : artwork.aiStatus === 'needs_review'
      ? styles.aiReview
      : '';

  return (
    <div
      ref={cardRef}
      className={styles.card}
      onClick={() => onClick(artwork)}
      style={style}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(artwork)}
      aria-label={artwork.title}
    >
      {/* Media */}
      <div className={styles.mediaWrapper}>
        {artwork.type === 'video' ? (
          <div className={styles.videoThumb}>
            <img
              ref={imgRef}
              src={thumbnailUrl || mediaUrl}
              alt={artwork.title}
              className={styles.media}
              loading="lazy"
              onError={handleImgError}
            />
            <div className={styles.playOverlay}>
              <Play size={20} fill="white" className={styles.playIcon} />
            </div>
            <span className={styles.videoLabel}>VIDEO</span>
          </div>
        ) : (
          <img
            ref={imgRef}
            src={thumbnailUrl || mediaUrl}
            alt={artwork.title}
            className={styles.media}
            loading="lazy"
            onError={handleImgError}
          />
        )}

        {/* Hover overlay */}
        <div className={styles.hoverOverlay}>
          <Eye size={16} />
          <span>Chi tiết</span>
        </div>

        {/* AI status badge */}
        {artwork.aiGenerated && (
          <div className={cn(styles.aiBadge, aiStatusClass)}>
            {artwork.groundingWarning ? (
              <AlertTriangle size={10} />
            ) : (
              <Sparkles size={10} />
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <div className={styles.catalogId}>{artwork.id}</div>
        <h3 className={styles.title}>{artwork.title}</h3>
        {artwork.caption && (
          <p className={styles.caption}>{artwork.caption}</p>
        )}
        {artwork.tags && artwork.tags.length > 0 && (
          <div className={styles.tags}>
            {artwork.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Favorite button */}
      <button
        className={cn(styles.favBtn, isFav && styles.favBtnActive)}
        onClick={handleFavorite}
        aria-label={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
      >
        <Heart
          ref={heartRef}
          size={14}
          fill={isFav ? 'currentColor' : 'none'}
        />
      </button>
    </div>
  );
});
