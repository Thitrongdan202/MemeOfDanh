import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchManifest } from '@/services/api';
import { MasonryGallery } from '@/components/gallery/MasonryGallery';
import { ArtworkLightbox } from '@/components/overlays/ArtworkLightbox';
import { useGalleryStore } from '@/stores/galleryStore';
import { ArtworkMedia } from '@/types/artwork';
import { ImageIcon } from 'lucide-react';
import styles from './GalleryPage.module.css';

export function ImagesPage() {
  const qc = useQueryClient();
  const filters = useGalleryStore();
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkMedia | null>(null);

  const { data: manifest, isLoading } = useQuery({
    queryKey: ['manifest'],
    queryFn: fetchManifest,
  });

  const images = (manifest?.artworks || []).filter((a) => a.type === 'image');

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
        <p className={styles.loadingText}>Đang nạp thư viện ảnh meme...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.heroBanner}>
        <h1 className={styles.heroTitle} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ImageIcon size={32} color="var(--accent-primary)" />
          Thư Viện Ảnh
        </h1>
        <p className={styles.heroSubtitle}>
          Bộ sưu tập gồm {images.length} hình ảnh meme tĩnh, hiển thị tỉ lệ tự nhiên với độ phân giải cao.
        </p>
      </div>

      <MasonryGallery
        artworks={images}
        filters={{ ...filters, type: 'all' }}
        onArtworkClick={(art) => setSelectedArtwork(art)}
      />

      <ArtworkLightbox
        artwork={selectedArtwork}
        artworks={images}
        onClose={() => setSelectedArtwork(null)}
        onSelectArtwork={(art) => setSelectedArtwork(art)}
        onArtworkUpdated={handleArtworkUpdated}
      />
    </div>
  );
}
