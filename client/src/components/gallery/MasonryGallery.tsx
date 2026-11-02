import React, { useEffect, useRef, useMemo } from 'react';
import { ArtworkMedia, GalleryFilters } from '@/types/artwork';
import { ArtworkCard } from './ArtworkCard';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { animateGalleryEnter } from '@/lib/animations';
import { useDebouncedValue } from '@/hooks/useDebounce';
import styles from './MasonryGallery.module.css';

interface MasonryGalleryProps {
  artworks: ArtworkMedia[];
  filters: GalleryFilters;
  onArtworkClick: (artwork: ArtworkMedia) => void;
}

function filterAndSort(artworks: ArtworkMedia[], filters: GalleryFilters, favIds: Set<string>): ArtworkMedia[] {
  let result = [...artworks];

  // Type filter
  if (filters.type !== 'all') result = result.filter((a) => a.type === filters.type);

  // AI filter
  if (filters.ai !== 'all') {
    if (filters.ai === 'curated') result = result.filter((a) => a.aiGenerated && a.aiStatus === 'success');
    else if (filters.ai === 'pending') result = result.filter((a) => !a.aiGenerated || a.aiStatus === 'pending');
    else if (filters.ai === 'flagged') result = result.filter((a) => a.review_status === 'flagged');
  }

  // Favorites
  if (filters.favorites) result = result.filter((a) => favIds.has(a.id));

  // Search
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.caption?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.tags?.some((t) => t.toLowerCase().includes(q)) ||
        a.id.toLowerCase().includes(q)
    );
  }

  // Sort
  result.sort((a, b) => {
    if (filters.sort === 'newest') return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
    if (filters.sort === 'oldest') return new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
    if (filters.sort === 'title_asc') return a.title.localeCompare(b.title, 'vi');
    if (filters.sort === 'title_desc') return b.title.localeCompare(a.title, 'vi');
    if (filters.sort === 'ai_curated') {
      const aScore = a.aiGenerated && a.aiStatus === 'success' ? 1 : 0;
      const bScore = b.aiGenerated && b.aiStatus === 'success' ? 1 : 0;
      return bScore - aScore;
    }
    return 0;
  });

  return result;
}

export function MasonryGallery({ artworks, filters, onArtworkClick }: MasonryGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  const { favorites } = useFavoritesStore();
  const { motionLevel, galleryColumns } = useSettingsStore();

  const debouncedFilters = useDebouncedValue(filters, 200);
  const filtered = useMemo(
    () => filterAndSort(artworks, debouncedFilters, favorites),
    [artworks, debouncedFilters, favorites]
  );

  useEffect(() => {
    if (!galleryRef.current) return;
    const cards = Array.from(galleryRef.current.querySelectorAll('[data-card]'));
    if (cards.length === 0) return;

    if (cards.length > prevCountRef.current) {
      const newCards = cards.slice(prevCountRef.current);
      animateGalleryEnter(newCards, { level: motionLevel === 'off' ? 'off' : motionLevel });
    }
    prevCountRef.current = cards.length;
  }, [filtered.length, motionLevel]);

  const columnsStyle = galleryColumns > 0
    ? { columnCount: galleryColumns }
    : undefined;

  if (filtered.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🏛</div>
        <p className={styles.emptyTitle}>Không tìm thấy tác phẩm nào</p>
        <p className={styles.emptyDesc}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.count}>
        <span className={styles.countNum}>{filtered.length}</span>
        <span className={styles.countLabel}>tác phẩm</span>
        {filters.search && (
          <span className={styles.countQuery}>cho &ldquo;{filters.search}&rdquo;</span>
        )}
      </div>

      <div
        ref={galleryRef}
        className={styles.masonry}
        style={columnsStyle}
      >
        {filtered.map((artwork) => (
          <div key={artwork.id} data-card className={styles.cardWrapper}>
            <ArtworkCard
              artwork={artwork}
              onClick={onArtworkClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
