import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Film, ImageIcon, Sparkles, ArrowRight } from 'lucide-react';
import { ArtworkMedia } from '@/types/artwork';
import { searchArtworks } from '@/services/searchIndex';
import { getThumbnailUrl } from '@/services/api';
import { cn } from '@/lib/utils';
import styles from './CommandPalette.module.css';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  artworks: ArtworkMedia[];
  onSelectArtwork: (artwork: ArtworkMedia) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  artworks,
  onSelectArtwork,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via parent
          const searchBtn = document.querySelector('[title*="Ctrl K"]') as HTMLButtonElement;
          searchBtn?.click();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isOpen, onClose]);

  const searchResults = React.useMemo(() => {
    if (!query.trim()) return artworks.slice(0, 10);
    return searchArtworks(query, artworks).slice(0, 20);
  }, [query, artworks]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = searchResults[selectedIndex];
      if (selected) {
        onSelectArtwork(selected);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className={styles.inputBar}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Tìm theo tiêu đề, nhân vật, hành động, nhãn, mã DANH-xxx..."
            className={styles.input}
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery('')}>
              <X size={14} />
            </button>
          )}
          <kbd className={styles.escBadge} onClick={onClose}>ESC</kbd>
        </div>

        {/* Results List */}
        <div className={styles.resultsList}>
          {searchResults.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Không tìm thấy meme nào phù hợp với &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const thumb = getThumbnailUrl(item.hash, item.safeUrl);

              return (
                <div
                  key={item.id}
                  className={cn(styles.resultItem, isSelected && styles.resultItemActive)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    onSelectArtwork(item);
                    onClose();
                  }}
                >
                  <img src={thumb} alt="" className={styles.itemThumb} />
                  <div className={styles.itemInfo}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemId}>{item.id}</span>
                      <span className={styles.itemType}>
                        {item.type === 'video' ? <Film size={10} /> : <ImageIcon size={10} />}
                        {item.type.toUpperCase()}
                      </span>
                      {item.aiGenerated && (
                        <span className={styles.aiGroundedTag}>
                          <Sparkles size={9} /> AI
                        </span>
                      )}
                    </div>
                    <div className={styles.itemTitle}>{item.title}</div>
                    {item.caption && <div className={styles.itemCaption}>{item.caption}</div>}
                  </div>
                  <ArrowRight size={14} className={styles.arrowIcon} />
                </div>
              );
            })
          )}
        </div>

        {/* Command Footer */}
        <div className={styles.footer}>
          <span><kbd>↑</kbd> <kbd>↓</kbd> để di chuyển</span>
          <span><kbd>Enter</kbd> để mở tác phẩm</span>
          <span><kbd>ESC</kbd> để thoát</span>
        </div>
      </div>
    </div>
  );
}
