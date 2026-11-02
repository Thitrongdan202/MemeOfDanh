import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, Heart, Sparkles, AlertCircle,
  Download, ExternalLink, Check, RefreshCw, Tag, Edit3
} from 'lucide-react';
import { ArtworkMedia, NamingCandidate } from '@/types/artwork';
import { getMediaUrl, getThumbnailUrl, patchArtwork, roastArtwork, reviewAction } from '@/services/api';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { formatFileSize, formatDate, cn } from '@/lib/utils';
import styles from './QuickViewer.module.css';

interface QuickViewerProps {
  artwork: ArtworkMedia | null;
  artworks: ArtworkMedia[];
  onClose: () => void;
  onSelectArtwork: (artwork: ArtworkMedia) => void;
  onArtworkUpdated?: (updated: ArtworkMedia) => void;
}

export function QuickViewer({
  artwork,
  artworks,
  onClose,
  onSelectArtwork,
  onArtworkUpdated,
}: QuickViewerProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [isRoasting, setIsRoasting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const currentIndex = artworks.findIndex((a) => a.id === artwork?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < artworks.length - 1 && currentIndex !== -1;

  useEffect(() => {
    if (artwork) {
      setTitleInput(artwork.title);
      setEditingTitle(false);
      setStatusMsg(null);

      // Preload next image if exists
      if (hasNext) {
        const nextItem = artworks[currentIndex + 1];
        if (nextItem.type === 'image') {
          const img = new Image();
          img.src = getMediaUrl(nextItem.safeUrl);
        }
      }
    }
  }, [artwork?.id]);

  const handlePrev = useCallback(() => {
    if (hasPrev) onSelectArtwork(artworks[currentIndex - 1]);
  }, [hasPrev, currentIndex, artworks, onSelectArtwork]);

  const handleNext = useCallback(() => {
    if (hasNext) onSelectArtwork(artworks[currentIndex + 1]);
  }, [hasNext, currentIndex, artworks, onSelectArtwork]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!artwork) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFavorite(artwork.id);
      } else if (e.key === ' ' && artwork.type === 'video' && videoRef.current) {
        e.preventDefault();
        if (videoRef.current.paused) videoRef.current.play();
        else videoRef.current.pause();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [artwork, handlePrev, handleNext, onClose, toggleFavorite]);

  if (!artwork) return null;

  const isFav = isFavorite(artwork.id);
  const mediaUrl = getMediaUrl(artwork.safeUrl);
  const posterUrl = getThumbnailUrl(artwork.hash, artwork.safeUrl);

  const handleSaveTitle = async () => {
    if (!titleInput.trim() || titleInput === artwork.title) {
      setEditingTitle(false);
      return;
    }
    try {
      const updated = await patchArtwork(artwork.id, { title: titleInput.trim() });
      onArtworkUpdated?.(updated);
      setEditingTitle(false);
      setStatusMsg('Đã cập nhật tiêu đề!');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert(`Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleReanalyzeAI = async () => {
    setIsRoasting(true);
    setStatusMsg(null);
    try {
      const res = await roastArtwork(artwork.id, true);
      if (res.artwork) {
        onArtworkUpdated?.(res.artwork);
        setTitleInput(res.artwork.title);
        setStatusMsg('AI Two-Pass đã phân tích lại thành công!');
      }
    } catch (err: any) {
      alert(`Lỗi AI: ${err.message}`);
    } finally {
      setIsRoasting(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleSelectCandidate = async (candidate: NamingCandidate, index: number) => {
    try {
      const res = await reviewAction('select_candidate', artwork.id, { candidateIndex: index });
      if (res.artwork) {
        onArtworkUpdated?.(res.artwork);
        setTitleInput(res.artwork.title);
        setStatusMsg(`Đã đổi sang: "${candidate.title}"`);
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      {/* Top Bar Controls */}
      <div className={styles.topControlBar} onClick={(e) => e.stopPropagation()}>
        <div className={styles.counter}>
          <span className={styles.counterCurrent}>{currentIndex + 1}</span>
          <span className={styles.counterTotal}>/ {artworks.length}</span>
        </div>

        <div className={styles.topActions}>
          <button
            className={cn(styles.topBtn, isFav && styles.favActive)}
            onClick={() => toggleFavorite(artwork.id)}
            title="Thích (Phím F)"
          >
            <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
          </button>

          <a
            href={mediaUrl}
            download={artwork.filename}
            className={styles.topBtn}
            title="Tải tệp về máy"
          >
            <Download size={16} />
          </a>

          <a
            href={mediaUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.topBtn}
            title="Mở tab mới"
          >
            <ExternalLink size={16} />
          </a>

          <button className={styles.closeBtn} onClick={onClose} title="Đóng (ESC)">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Stage */}
      <div className={styles.stage} onClick={(e) => e.stopPropagation()}>
        {hasPrev && (
          <button className={styles.navArrowLeft} onClick={handlePrev} title="Trước (←)">
            <ChevronLeft size={32} />
          </button>
        )}

        <div className={styles.mediaContainer}>
          {artwork.type === 'video' ? (
            <video
              ref={videoRef}
              key={artwork.id}
              src={mediaUrl}
              poster={posterUrl}
              controls
              autoPlay
              loop
              playsInline
              className={styles.activeMedia}
            />
          ) : (
            <img
              key={artwork.id}
              src={mediaUrl || posterUrl}
              alt={artwork.title}
              className={styles.activeMedia}
            />
          )}
        </div>

        {hasNext && (
          <button className={styles.navArrowRight} onClick={handleNext} title="Sau (→)">
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      {/* Floating Bottom Drawer */}
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerContent}>
          <div className={styles.drawerHeader}>
            <div className={styles.metaRow}>
              <span className={styles.catalogId}>{artwork.id}</span>
              <span className={styles.metaType}>{artwork.type.toUpperCase()} • {artwork.format?.toUpperCase()}</span>
              {artwork.width && artwork.height && (
                <span className={styles.metaDim}>{artwork.width}×{artwork.height}px</span>
              )}
              <span className={styles.metaSize}>{formatFileSize(artwork.sizeBytes)}</span>
              {artwork.aiGenerated && (
                <span className={cn(styles.aiPill, artwork.groundingWarning && styles.aiPillWarn)}>
                  <Sparkles size={11} /> {artwork.aiModel || 'Two-Pass v5.0'}
                </span>
              )}
            </div>

            {/* Editable Title */}
            {editingTitle ? (
              <div className={styles.editTitleGroup}>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className={styles.editInput}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') setEditingTitle(false);
                  }}
                />
                <button className={styles.btnSave} onClick={handleSaveTitle}>
                  <Check size={14} /> Lưu
                </button>
                <button className={styles.btnCancel} onClick={() => setEditingTitle(false)}>
                  Hủy
                </button>
              </div>
            ) : (
              <div className={styles.titleLine}>
                <h2 className={styles.title}>{artwork.title}</h2>
                <button
                  className={styles.btnEdit}
                  onClick={() => setEditingTitle(true)}
                  title="Chỉnh sửa tiêu đề (Phím E)"
                >
                  <Edit3 size={13} />
                </button>
              </div>
            )}

            {statusMsg && <div className={styles.statusAlert}>{statusMsg}</div>}

            {artwork.caption && <p className={styles.caption}>{artwork.caption}</p>}
          </div>

          {/* AI Candidates Switcher */}
          {artwork.candidates && artwork.candidates.length > 0 && (
            <div className={styles.candidatesBlock}>
              <span className={styles.candidateLabel}>Phương án đề xuất (AI Two-Pass):</span>
              <div className={styles.candidateChips}>
                {artwork.candidates.map((cand, idx) => {
                  const isCurrent = cand.title === artwork.title;
                  return (
                    <button
                      key={idx}
                      className={cn(styles.candChip, isCurrent && styles.candChipActive)}
                      onClick={() => handleSelectCandidate(cand, idx)}
                      title={cand.reasoning || cand.approach}
                    >
                      <span className={styles.candApproach}>[{cand.approach || `PA ${idx + 1}`}]</span>
                      <span className={styles.candTitle}>{cand.title}</span>
                      {isCurrent && <Check size={12} className={styles.checkIcon} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Visual Grounding Facts */}
          {artwork.visual_summary && (
            <div className={styles.groundingSummary}>
              <div className={styles.groundingHead}>
                <Sparkles size={12} /> Dữ kiện thị giác quan sát thực tế (Pass 1):
              </div>
              <p className={styles.groundingBody}>{artwork.visual_summary}</p>
            </div>
          )}

          {/* Action Row */}
          <div className={styles.drawerActions}>
            <button
              className={cn(styles.actionBtn, isRoasting && styles.roasting)}
              onClick={handleReanalyzeAI}
              disabled={isRoasting}
            >
              <RefreshCw size={13} className={isRoasting ? styles.spinning : ''} />
              <span>{isRoasting ? 'Đang phân tích...' : 'AI Phân Tích Lại'}</span>
            </button>

            {artwork.tags && artwork.tags.length > 0 && (
              <div className={styles.tagTray}>
                {artwork.tags.map((t) => (
                  <span key={t} className={styles.tag}>
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
