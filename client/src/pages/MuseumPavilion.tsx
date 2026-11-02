import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchManifest } from '@/services/api';
import { ArtworkMedia } from '@/types/artwork';
import { OmniBar, ViewMode } from '@/components/layout/OmniBar';
import { VirtualizedCuratorGrid } from '@/components/gallery/VirtualizedCuratorGrid';
import { ContactSheetView } from '@/components/gallery/ContactSheetView';
import { CinemaFocusView } from '@/components/gallery/CinemaFocusView';
import { QuickViewer } from '@/components/viewer/QuickViewer';
import { CommandPalette } from '@/components/search/CommandPalette';
import { AIStudioPage } from '@/pages/AIStudioPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useGalleryStore } from '@/stores/galleryStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { X } from 'lucide-react';
import styles from './MuseumPavilion.module.css';

export function MuseumPavilion() {
  const qc = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('curator');
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkMedia | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiStudioOpen, setAiStudioOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { type, favorites } = useGalleryStore();
  const { favorites: favSet } = useFavoritesStore();
  const { galleryColumns } = useSettingsStore();

  const { data: manifest, isLoading, error } = useQuery({
    queryKey: ['manifest'],
    queryFn: fetchManifest,
  });

  const allArtworks = useMemo(() => manifest?.artworks || [], [manifest?.artworks]);

  // Filtered artworks for current active filters
  const filteredArtworks = useMemo(() => {
    let result = allArtworks;
    if (type !== 'all') {
      result = result.filter((a) => a.type === type);
    }
    if (favorites) {
      result = result.filter((a) => favSet.has(a.id));
    }
    return result;
  }, [allArtworks, type, favorites, favSet]);

  const handleArtworkUpdated = useCallback((updated: ArtworkMedia) => {
    qc.setQueryData(['manifest'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        artworks: old.artworks.map((a: ArtworkMedia) => (a.id === updated.id ? updated : a)),
      };
    });
    setSelectedArtwork(updated);
  }, [qc]);

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.pulseLogo}>DM</div>
        <div className={styles.loadingBar}>
          <div className={styles.loadingProgress} />
        </div>
        <p className={styles.loadingText}>Đang nạp bộ sưu tập Danh'Mus...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorScreen}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>Không thể kết nối đến máy chủ</h2>
        <p>{(error as any).message}</p>
        <button onClick={() => qc.invalidateQueries({ queryKey: ['manifest'] })} className={styles.retryBtn}>
          Thử Lại
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pavilion}>
      {/* Omni-Navigation Bar */}
      <OmniBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAIStudio={() => setAiStudioOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        totalCount={allArtworks.length}
        filteredCount={filteredArtworks.length}
      />

      {/* Main Exhibition Stage */}
      <main className={styles.stageArea}>
        {viewMode === 'curator' && (
          <VirtualizedCuratorGrid
            artworks={filteredArtworks}
            onArtworkClick={setSelectedArtwork}
            preferredColumns={galleryColumns}
          />
        )}

        {viewMode === 'contact' && (
          <ContactSheetView
            artworks={filteredArtworks}
            onArtworkClick={setSelectedArtwork}
          />
        )}

        {viewMode === 'cinema' && (
          <CinemaFocusView
            artworks={filteredArtworks}
            onOpenViewer={setSelectedArtwork}
          />
        )}
      </main>

      {/* Quick Media Viewer */}
      <QuickViewer
        artwork={selectedArtwork}
        artworks={filteredArtworks}
        onClose={() => setSelectedArtwork(null)}
        onSelectArtwork={setSelectedArtwork}
        onArtworkUpdated={handleArtworkUpdated}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        artworks={allArtworks}
        onSelectArtwork={setSelectedArtwork}
      />

      {/* AI Studio Overlay Modal */}
      {aiStudioOpen && (
        <div className={styles.modalOverlay} onClick={() => setAiStudioOpen(false)}>
          <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>AI Two-Pass Curation Studio</span>
              <button className={styles.modalClose} onClick={() => setAiStudioOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <AIStudioPage />
            </div>
          </div>
        </div>
      )}

      {/* Settings & Personalization Overlay Modal */}
      {settingsOpen && (
        <div className={styles.modalOverlay} onClick={() => setSettingsOpen(false)}>
          <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Cài Đặt & Cá Nhân Hóa</span>
              <button className={styles.modalClose} onClick={() => setSettingsOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <SettingsPage />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
