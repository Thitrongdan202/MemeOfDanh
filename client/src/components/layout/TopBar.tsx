import React, { useRef, useState, useCallback } from 'react';
import { Search, X, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { useGalleryStore } from '@/stores/galleryStore';
import { useDebouncedValue } from '@/hooks/useDebounce';
import { syncLibrary } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import styles from './TopBar.module.css';

export function TopBar() {
  const { search, setSearch, type, setType, sort, setSort } = useGalleryStore();
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebouncedValue(localSearch, 300);
  const [syncing, setSyncing] = useState(false);
  const qc = useQueryClient();

  React.useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncLibrary();
      await qc.invalidateQueries({ queryKey: ['manifest'] });
    } catch (e) {
      console.error('Sync failed', e);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className={styles.topbar}>
      {/* Search */}
      <div className={styles.searchWrapper}>
        <Search size={14} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Tìm kiếm meme..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className={styles.searchInput}
        />
        {localSearch && (
          <button className={styles.searchClear} onClick={() => { setLocalSearch(''); setSearch(''); }}>
            <X size={12} />
          </button>
        )}
      </div>

      {/* Type filters */}
      <div className={styles.filters}>
        {(['all', 'image', 'video'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(styles.filterPill, type === t && styles.filterPillActive)}
          >
            {t === 'all' ? 'Tất cả' : t === 'image' ? '🖼 Ảnh' : '🎬 Video'}
          </button>
        ))}
      </div>

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as any)}
        className={styles.sortSelect}
      >
        <option value="newest">Mới nhất</option>
        <option value="oldest">Cũ nhất</option>
        <option value="title_asc">Tên A→Z</option>
        <option value="title_desc">Tên Z→A</option>
        <option value="ai_curated">AI đã phân tích</option>
      </select>

      {/* Sync button */}
      <button
        className={cn(styles.syncBtn, syncing && styles.syncBtnSyncing)}
        onClick={handleSync}
        disabled={syncing}
        title="Đồng bộ thư mục meme"
      >
        <RefreshCw size={14} className={syncing ? styles.spinning : ''} />
        <span>{syncing ? 'Đang đồng bộ...' : 'Đồng bộ'}</span>
      </button>
    </header>
  );
}
