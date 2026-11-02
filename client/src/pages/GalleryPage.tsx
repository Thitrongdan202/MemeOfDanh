import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchManifest } from '@/services/api';
import { MasonryGallery } from '@/components/gallery/MasonryGallery';
import { ArtworkLightbox } from '@/components/overlays/ArtworkLightbox';
import { useGalleryStore } from '@/stores/galleryStore';
import { ArtworkMedia } from '@/types/artwork';
import styles from './GalleryPage.module.css';

export function GalleryPage() {
  const qc = useQueryClient();
  const filters = useGalleryStore();
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkMedia | null>(null);

  const { data: manifest, isLoading, error } = useQuery({
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
        <p className={styles.loadingText}>Đang nạp bộ sưu tập Danh'Mus...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorWrap}>
        <div className={styles.errorIcon}>⚠️</div>
        <p className={styles.errorTitle}>Không thể kết nối đến máy chủ</p>
        <p className={styles.errorText}>{(error as any).message}</p>
        <button className={styles.retryBtn} onClick={() => qc.invalidateQueries({ queryKey: ['manifest'] })}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.heroBanner}>
        <h1 className={styles.heroTitle}>Bảo Tàng Danh'Mus</h1>
        <p className={styles.heroSubtitle}>
          Kho lưu trữ kỹ thuật số gồm {manifest?.totalCount || 0} tác phẩm nghệ thuật meme với phân tích thị giác AI Two-Pass.
        </p>
      </div>

      <MasonryGallery
        artworks={artworks}
        filters={filters}
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
