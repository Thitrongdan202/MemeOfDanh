import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { ArtworkMedia } from '@/types/artwork';
import { CuratorCard } from '@/components/cards/CuratorCard';
import styles from './VirtualizedCuratorGrid.module.css';

interface VirtualizedCuratorGridProps {
  artworks: ArtworkMedia[];
  onArtworkClick: (artwork: ArtworkMedia) => void;
  preferredColumns?: number; // 0 = auto
}

export function VirtualizedCuratorGrid({
  artworks,
  onArtworkClick,
  preferredColumns = 0,
}: VirtualizedCuratorGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // Resize listener for adaptive columns
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine column count
  const columnCount = useMemo(() => {
    if (preferredColumns > 0) return preferredColumns;
    if (containerWidth < 500) return 1;
    if (containerWidth < 820) return 2;
    if (containerWidth < 1200) return 3;
    if (containerWidth < 1600) return 4;
    return 5;
  }, [containerWidth, preferredColumns]);

  // Group artworks into rows
  const rows = useMemo(() => {
    const r: ArtworkMedia[][] = [];
    for (let i = 0; i < artworks.length; i += columnCount) {
      r.push(artworks.slice(i, i + columnCount));
    }
    return r;
  }, [artworks, columnCount]);

  // Virtualizer attached to window scroll
  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 440, // Estimated card height
    overscan: 2, // 2 rows buffer
  });

  if (artworks.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <div className={styles.emptyIcon}>🏛</div>
        <h3 className={styles.emptyTitle}>Không tìm thấy tác phẩm</h3>
        <p className={styles.emptyText}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <div
        className={styles.virtualStage}
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowItems = rows[virtualRow.index];
          if (!rowItems) return null;

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className={styles.row}
              style={{
                transform: `translate3d(0, ${virtualRow.start}px, 0)`,
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
              }}
            >
              {rowItems.map((artwork, colIdx) => (
                <div key={artwork.id} className={styles.cell}>
                  <CuratorCard
                    artwork={artwork}
                    onClick={onArtworkClick}
                    priority={virtualRow.index === 0 && colIdx < 4}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
