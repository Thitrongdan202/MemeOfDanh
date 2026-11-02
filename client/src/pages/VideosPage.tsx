import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchManifest } from '@/services/api';
import { MasonryGallery } from '@/components/gallery/MasonryGallery';
import { ArtworkLightbox } from '@/components/overlays/ArtworkLightbox';
import { useGalleryStore } from '@/stores/galleryStore';
import { ArtworkMedia } from '@/types/artwork';
import { Film } from 'lucide-react';
import styles from './GalleryPage.module.css';

export function VideosPage() {
  const qc = useQueryClient();
  const filters = useGalleryStore();
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkMedia | null>(null);

  const { data: manifest, isLoading } = useQuery({
    queryKey: ['manifest'],
    queryFn: fetchManifest,
  });

  const videos = (manifest?.artworks || []).filter((a) => a.type === 'video');

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
        <p className={styles.loadingText}>Đang nạp video meme...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.heroBanner}>
        <h1 className={styles.heroTitle} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Film size={32} color="var(--accent-primary)" />
          Thư Viện Video
        </h1>
        <p className={styles.heroSubtitle}>
          Bộ sưu tập gồm {videos.length} video meme sinh động, hỗ trợ phát trực tiếp và trích xuất khung hình tự động bằng AI.
        </p>
      </div>

      <MasonryGallery
        artworks={videos}
        filters={{ ...filters, type: 'all' }}
        onArtworkClick={(art) => setSelectedArtwork(art)}
      />

      <ArtworkLightbox
        artwork={selectedArtwork}
        artworks={videos}
        onClose={() => setSelectedArtwork(null)}
        onSelectArtwork={(art) => setSelectedArtwork(art)}
        onArtworkUpdated={handleArtworkUpdated}
      />
    </div>
  );
}
