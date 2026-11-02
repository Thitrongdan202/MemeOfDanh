import React from 'react';
import {
  Sparkles, Search, Sun, Moon, LayoutGrid, Grid3X3, Film,
  Heart, Settings, SlidersHorizontal, RefreshCw
} from 'lucide-react';
import { useGalleryStore } from '@/stores/galleryStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import styles from './OmniBar.module.css';

export type ViewMode = 'curator' | 'contact' | 'cinema';

interface OmniBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenSearch: () => void;
  onOpenAIStudio: () => void;
  onOpenSettings: () => void;
  totalCount: number;
  filteredCount: number;
}

export function OmniBar({
  viewMode,
  onViewModeChange,
  onOpenSearch,
  onOpenAIStudio,
  onOpenSettings,
  totalCount,
  filteredCount,
}: OmniBarProps) {
  const { theme, setTheme } = useTheme();
  const { type, setType, favorites, setFavorites } = useGalleryStore();
  const { favorites: favSet } = useFavoritesStore();

  return (
    <header className={styles.omniContainer}>
      <div className={styles.bar}>
        {/* Brand Pavilion */}
        <div className={styles.brand}>
          <span className={styles.monogram}>DM</span>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>DANH'MUS</span>
            <span className={styles.brandBadge}>
              {filteredCount === totalCount ? `${totalCount} TÁC PHẨM` : `${filteredCount}/${totalCount}`}
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        {/* View Mode Switcher */}
        <div className={styles.pillGroup} role="tablist" aria-label="Chế độ xem">
          <button
            className={cn(styles.pill, viewMode === 'curator' && styles.pillActive)}
            onClick={() => onViewModeChange('curator')}
            title="Chế độ Giám Tuyển (Curator Grid)"
          >
            <LayoutGrid size={14} />
            <span className={styles.pillLabel}>Curator</span>
          </button>

          <button
            className={cn(styles.pill, viewMode === 'contact' && styles.pillActive)}
            onClick={() => onViewModeChange('contact')}
            title="Chế độ Tiếp Xúc Nhanh (Contact Sheet)"
          >
            <Grid3X3 size={14} />
            <span className={styles.pillLabel}>Contact Sheet</span>
          </button>

          <button
            className={cn(styles.pill, viewMode === 'cinema' && styles.pillActive)}
            onClick={() => onViewModeChange('cinema')}
            title="Chế độ Điện Ảnh (Cinema Stage)"
          >
            <Film size={14} />
            <span className={styles.pillLabel}>Cinema</span>
          </button>
        </div>

        <div className={styles.divider} />

        {/* Media Filters */}
        <div className={styles.filterGroup}>
          <button
            className={cn(styles.filterPill, type === 'all' && !favorites && styles.filterPillActive)}
            onClick={() => { setType('all'); setFavorites(false); }}
          >
            Tất Cả
          </button>
          <button
            className={cn(styles.filterPill, type === 'image' && !favorites && styles.filterPillActive)}
            onClick={() => { setType('image'); setFavorites(false); }}
          >
            Ảnh
          </button>
          <button
            className={cn(styles.filterPill, type === 'video' && !favorites && styles.filterPillActive)}
            onClick={() => { setType('video'); setFavorites(false); }}
          >
            Video
          </button>
          <button
            className={cn(styles.filterPill, favorites && styles.filterPillActive)}
            onClick={() => setFavorites(!favorites)}
            title="Xem danh sách yêu thích"
          >
            <Heart size={12} fill={favorites ? 'currentColor' : 'none'} />
            <span>Yêu Thích ({favSet.size})</span>
          </button>
        </div>

        <div className={styles.spacer} />

        {/* Quick Search Button */}
        <button className={styles.searchTrigger} onClick={onOpenSearch} title="Tìm kiếm tức thì (Ctrl+K)">
          <Search size={14} />
          <span className={styles.searchText}>Tìm kiếm tác phẩm...</span>
          <kbd className={styles.kbd}>Ctrl K</kbd>
        </button>

        {/* Action icons */}
        <div className={styles.toolGroup}>
          <button
            className={styles.toolBtn}
            onClick={onOpenAIStudio}
            title="AI Two-Pass Studio"
          >
            <Sparkles size={16} />
          </button>

          <button
            className={styles.toolBtn}
            onClick={onOpenSettings}
            title="Cài đặt & Cá nhân hóa"
          >
            <Settings size={16} />
          </button>

          <button
            className={styles.toolBtn}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={`Chuyển chế độ: Hiện tại là ${theme === 'dark' ? 'Tối' : 'Sáng'}`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
