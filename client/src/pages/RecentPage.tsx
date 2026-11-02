import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchManifest } from '@/services/api';
import { MasonryGallery } from '@/components/gallery/MasonryGallery';
import { ArtworkLightbox } from '@/components/overlays/ArtworkLightbox';
import { useGalleryStore } from '@/stores/galleryStore';
import { ArtworkMedia } from '@/types/artwork';
import { Clock } from 'lucide-react';
import styles from './GalleryPage.module.css';

export function RecentPage() {
  const qc = useQueryClient();
  const filters = useGalleryStore();
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkMedia | null>(null);

  const { data: manifest, isLoading } = useQuery({
    queryKey: ['manifest'],
    queryFn: fetchManifest,
  });

  const artworks = manifest?.artworks || [];

  const handleArtworkUpdated = (updated: ArtworkMedia) => {
    qc.setQueryData(['manifest'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        artworks: old.artworks.map((a: ArtworkMedia) => (a.id === updated.id ? updated : a)),
      };
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Đang nạp tác phẩm mới...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.heroBanner}>
        <h1 className={styles.heroTitle} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Clock size={32} color="var(--accent-primary)" />
          Tác Phẩm Mới Nhất
        </h1>
        <p className={styles.heroSubtitle}>
          Sắp xếp theo thời gian tệp được thêm hoặc cập nhật gần đây nhất.
        </p>
      </div>

      <MasonryGallery
        artworks={artworks}
        filters={{ ...filters, sort: 'newest' }}
        onArtworkClick={(art) => setSelectedArtwork(art)}
      />

      <ArtworkLightbox
        artwork={selectedArtwork}
        artworks={artworks}
        onClose={() => setSelectedArtwork(null)}
        onSelectArtwork={(art) => setSelectedArtwork(art)}
        onArtworkUpdated={handleArtworkUpdated}
      />
    </div>
  );
}
