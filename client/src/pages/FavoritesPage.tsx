import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchManifest } from '@/services/api';
import { MasonryGallery } from '@/components/gallery/MasonryGallery';
import { ArtworkLightbox } from '@/components/overlays/ArtworkLightbox';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useGalleryStore } from '@/stores/galleryStore';
import { ArtworkMedia } from '@/types/artwork';
import { Heart } from 'lucide-react';
import styles from './GalleryPage.module.css';

export function FavoritesPage() {
  const qc = useQueryClient();
  const filters = useGalleryStore();
  const { favorites } = useFavoritesStore();
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkMedia | null>(null);

  const { data: manifest, isLoading } = useQuery({
    queryKey: ['manifest'],
    queryFn: fetchManifest,
  });

  const allArtworks = manifest?.artworks || [];
  const favoriteArtworks = allArtworks.filter((a) => favorites.has(a.id));

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
        <p className={styles.loadingText}>Đang nạp danh sách yêu thích...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.heroBanner}>
        <h1 className={styles.heroTitle} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Heart size={32} color="#ef4444" fill="#ef4444" />
          Tác Phẩm Yêu Thích
        </h1>
        <p className={styles.heroSubtitle}>
          Những khoảnh khắc meme được bạn lưu lại riêng. Hiện có {favoriteArtworks.length} tác phẩm yêu thích.
        </p>
      </div>

      <MasonryGallery
        artworks={favoriteArtworks}
        filters={{ ...filters, favorites: false }}
        onArtworkClick={(art) => setSelectedArtwork(art)}
      />

      <ArtworkLightbox
        artwork={selectedArtwork}
        artworks={favoriteArtworks}
        onClose={() => setSelectedArtwork(null)}
        onSelectArtwork={(art) => setSelectedArtwork(art)}
        onArtworkUpdated={handleArtworkUpdated}
      />
    </div>
  );
}
