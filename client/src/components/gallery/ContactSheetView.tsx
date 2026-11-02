import React from 'react';
import { Play, Heart } from 'lucide-react';
import { ArtworkMedia } from '@/types/artwork';
import { getThumbnailUrl } from '@/services/api';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { cn } from '@/lib/utils';
import styles from './ContactSheetView.module.css';

interface ContactSheetViewProps {
  artworks: ArtworkMedia[];
  onArtworkClick: (artwork: ArtworkMedia) => void;
}

export function ContactSheetView({ artworks, onArtworkClick }: ContactSheetViewProps) {
  const { isFavorite } = useFavoritesStore();

  return (
    <div className={styles.grid}>
      {artworks.map((art) => {
        const thumb = getThumbnailUrl(art.hash, art.safeUrl);
        const isFav = isFavorite(art.id);

        return (
          <div
            key={art.id}
            className={styles.cell}
            onClick={() => onArtworkClick(art)}
            title={`${art.id}: ${art.title}`}
          >
            <div className={styles.thumbWrapper}>
              <img
                src={thumb}
                alt={art.title}
                className={styles.thumb}
                loading="lazy"
                decoding="async"
              />

              {art.type === 'video' && (
                <div className={styles.videoBadge}>
                  <Play size={10} fill="white" />
                </div>
              )}

              {isFav && (
                <div className={styles.favBadge}>
                  <Heart size={10} fill="#EF4444" color="#EF4444" />
                </div>
              )}
            </div>

            <div className={styles.metaRow}>
              <span className={styles.id}>{art.id}</span>
              <span className={styles.title}>{art.title}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
