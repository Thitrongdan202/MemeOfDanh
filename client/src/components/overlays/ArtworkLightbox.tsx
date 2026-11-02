import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, Heart, Sparkles, AlertTriangle,
  Check, RefreshCw, Download, ExternalLink, Tag, Info, Cpu, Eye
} from 'lucide-react';
import { ArtworkMedia, NamingCandidate } from '@/types/artwork';
import { getMediaUrl, patchArtwork, roastArtwork, reviewAction } from '@/services/api';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { animateLightboxOpen, animateLightboxClose, animateFavoritePulse } from '@/lib/animations';
import { formatFileSize, formatDate, cn } from '@/lib/utils';
import styles from './ArtworkLightbox.module.css';

interface ArtworkLightboxProps {
  artwork: ArtworkMedia | null;
  artworks: ArtworkMedia[];
  onClose: () => void;
  onSelectArtwork: (artwork: ArtworkMedia) => void;
  onArtworkUpdated?: (updated: ArtworkMedia) => void;
}

export function ArtworkLightbox({
  artwork,
  artworks,
  onClose,
  onSelectArtwork,
  onArtworkUpdated,
}: ArtworkLightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<SVGSVGElement>(null);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { motionLevel } = useSettingsStore();

  const [currentArtwork, setCurrentArtwork] = useState<ArtworkMedia | null>(artwork);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [isRoasting, setIsRoasting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentArtwork(artwork);
    if (artwork) {
      setTitleValue(artwork.title);
      setEditingTitle(false);
      setActionMessage(null);
    }
  }, [artwork]);

  // Entrance animation
  useEffect(() => {
    if (currentArtwork && overlayRef.current && modalRef.current) {
      animateLightboxOpen(overlayRef.current, modalRef.current, motionLevel);
    }
  }, [currentArtwork?.id, motionLevel]);

  const handleClose = useCallback(() => {
    if (overlayRef.current && modalRef.current && motionLevel !== 'off') {
      animateLightboxClose(overlayRef.current, modalRef.current, onClose, motionLevel);
    } else {
      onClose();
    }
  }, [onClose, motionLevel]);

  // Navigation prev / next
  const currentIndex = artworks.findIndex((a) => a.id === currentArtwork?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < artworks.length - 1 && currentIndex !== -1;

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      onSelectArtwork(artworks[currentIndex - 1]);
    }
  }, [hasPrev, currentIndex, artworks, onSelectArtwork]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      onSelectArtwork(artworks[currentIndex + 1]);
    }
  }, [hasNext, currentIndex, artworks, onSelectArtwork]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentArtwork) return;
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentArtwork, handleClose, handlePrev, handleNext]);

  if (!currentArtwork) return null;

  const isFav = isFavorite(currentArtwork.id);
  const mediaUrl = getMediaUrl(currentArtwork.safeUrl);

  const handleToggleFavorite = () => {
    toggleFavorite(currentArtwork.id);
    if (heartRef.current && motionLevel !== 'off') {
      animateFavoritePulse(heartRef.current);
    }
  };

  const handleSaveTitle = async () => {
    if (!titleValue.trim() || titleValue === currentArtwork.title) {
      setEditingTitle(false);
      return;
    }
    try {
      const updated = await patchArtwork(currentArtwork.id, { title: titleValue.trim() });
      setCurrentArtwork(updated);
      onArtworkUpdated?.(updated);
      setEditingTitle(false);
      setActionMessage('Đã cập nhật tiêu đề');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(`Lỗi khi lưu tiêu đề: ${err.message}`);
    }
  };

  const handleRegenerateAI = async () => {
    setIsRoasting(true);
    setActionMessage(null);
    try {
      const res = await roastArtwork(currentArtwork.id, true);
      if (res.artwork) {
        setCurrentArtwork(res.artwork);
        setTitleValue(res.artwork.title);
        onArtworkUpdated?.(res.artwork);
        setActionMessage('AI đã phân tích và đặt lại tên thành công!');
      }
    } catch (err: any) {
      alert(`Lỗi khi chạy AI: ${err.message}`);
    } finally {
      setIsRoasting(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleSelectCandidate = async (candidate: NamingCandidate, index: number) => {
    try {
      const res = await reviewAction('select_candidate', currentArtwork.id, { candidateIndex: index });
      if (res.artwork) {
        setCurrentArtwork(res.artwork);
        setTitleValue(res.artwork.title);
        onArtworkUpdated?.(res.artwork);
        setActionMessage(`Đã chọn phương án: "${candidate.title}"`);
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  return (
    <div ref={overlayRef} className={styles.overlay} onClick={handleClose}>
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Đóng">
          <X size={20} />
        </button>

        {/* Prev / Next buttons */}
        {hasPrev && (
          <button className={styles.navBtnPrev} onClick={handlePrev} aria-label="Tác phẩm trước">
            <ChevronLeft size={24} />
          </button>
        )}
        {hasNext && (
          <button className={styles.navBtnNext} onClick={handleNext} aria-label="Tác phẩm sau">
            <ChevronRight size={24} />
          </button>
        )}

        <div className={styles.body}>
          {/* Media stage */}
          <div className={styles.stage}>
            {currentArtwork.type === 'video' ? (
              <video
                src={mediaUrl}
                controls
                autoPlay
                loop
                playsInline
                className={styles.mediaVideo}
              />
            ) : (
              <img
                src={mediaUrl}
                alt={currentArtwork.title}
                className={styles.mediaImage}
              />
            )}
          </div>

          {/* Details sidebar */}
          <div className={styles.sidebar}>
            {/* Header info */}
            <div className={styles.header}>
              <div className={styles.badgeRow}>
                <span className={styles.catalogId}>{currentArtwork.id}</span>
                <span className={styles.typeTag}>
                  {currentArtwork.type === 'video' ? '🎬 Video' : '🖼 Ảnh'} • {currentArtwork.format?.toUpperCase()}
                </span>
                {currentArtwork.aiGenerated && (
                  <span className={cn(styles.aiTag, currentArtwork.groundingWarning && styles.aiTagWarning)}>
                    <Sparkles size={11} />
                    {currentArtwork.aiModel || 'AI Curated'}
                  </span>
                )}
              </div>

              {/* Title with edit */}
              {editingTitle ? (
                <div className={styles.titleEditGroup}>
                  <input
                    type="text"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    className={styles.titleInput}
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
                <h2 className={styles.title} onClick={() => setEditingTitle(true)} title="Bấm để sửa tiêu đề">
                  {currentArtwork.title}
                </h2>
              )}

              {/* Action message */}
              {actionMessage && <div className={styles.actionAlert}>{actionMessage}</div>}

              {/* Warning if grounding issue */}
              {currentArtwork.groundingWarning && (
                <div className={styles.warningBox}>
                  <AlertTriangle size={15} className={styles.warningIcon} />
                  <span>{currentArtwork.groundingWarning}</span>
                </div>
              )}
            </div>

            {/* Content description */}
            <div className={styles.section}>
              {currentArtwork.caption && (
                <div className={styles.captionBlock}>
                  <div className={styles.sectionLabel}>Bình luận / Roast</div>
                  <p className={styles.captionText}>{currentArtwork.caption}</p>
                </div>
              )}

              {currentArtwork.visual_summary && (
                <div className={styles.visualSummaryBlock}>
                  <div className={styles.sectionLabel}>
                    <Eye size={12} /> Quan sát thị giác (Pass 1)
                  </div>
                  <p className={styles.visualSummaryText}>{currentArtwork.visual_summary}</p>
                </div>
              )}

              {currentArtwork.funny_observation && (
                <div className={styles.funnyObservationBlock}>
                  <div className={styles.sectionLabel}>
                    <Sparkles size={12} /> Chi tiết hài hước
                  </div>
                  <p className={styles.funnyObservationText}>{currentArtwork.funny_observation}</p>
                </div>
              )}

              {currentArtwork.description && !currentArtwork.visual_summary && (
                <div className={styles.descriptionBlock}>
                  <div className={styles.sectionLabel}>Mô tả</div>
                  <p className={styles.descriptionText}>{currentArtwork.description}</p>
                </div>
              )}
            </div>

            {/* Candidates */}
            {currentArtwork.candidates && currentArtwork.candidates.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionLabel}>Phương án đặt tên gợi ý (AI Candidates)</div>
                <div className={styles.candidateList}>
                  {currentArtwork.candidates.map((cand, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        styles.candidateCard,
                        cand.title === currentArtwork.title && styles.candidateSelected
                      )}
                      onClick={() => handleSelectCandidate(cand, idx)}
                    >
                      <div className={styles.candidateHeader}>
                        <span className={styles.candidateTitle}>{cand.title}</span>
                        {cand.title === currentArtwork.title && (
                          <span className={styles.selectedBadge}>Đang dùng</span>
                        )}
                      </div>
                      {cand.caption && <p className={styles.candidateCaption}>{cand.caption}</p>}
                      {cand.approach && <span className={styles.candidateApproach}>{cand.approach}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {currentArtwork.tags && currentArtwork.tags.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionLabel}>
                  <Tag size={12} /> Nhãn liên quan
                </div>
                <div className={styles.tagWrap}>
                  {currentArtwork.tags.map((t) => (
                    <span key={t} className={styles.tagPill}>
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Metadata */}
            <div className={styles.section}>
              <div className={styles.sectionLabel}>
                <Info size={12} /> Thông số kỹ thuật
              </div>
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Kích thước:</span>
                  <span className={styles.metaVal}>
                    {currentArtwork.width && currentArtwork.height
                      ? `${currentArtwork.width} × ${currentArtwork.height} px`
                      : 'N/A'}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Dung lượng:</span>
                  <span className={styles.metaVal}>{formatFileSize(currentArtwork.sizeBytes)}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Ngày thêm:</span>
                  <span className={styles.metaVal}>{formatDate(currentArtwork.modifiedAt)}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Tệp gốc:</span>
                  <span className={styles.metaVal}>{currentArtwork.filename}</span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className={styles.actionsBar}>
              <button
                className={cn(styles.actionBtn, isFav && styles.favActive)}
                onClick={handleToggleFavorite}
                title={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
              >
                <Heart ref={heartRef} size={16} fill={isFav ? 'currentColor' : 'none'} />
                <span>{isFav ? 'Đã thích' : 'Thích'}</span>
              </button>

              <button
                className={cn(styles.actionBtn, isRoasting && styles.roasting)}
                onClick={handleRegenerateAI}
                disabled={isRoasting}
                title="Chạy lại Two-Pass AI để phân tích lại và đặt tên mới"
              >
                <RefreshCw size={15} className={isRoasting ? styles.spinning : ''} />
                <span>{isRoasting ? 'Đang phân tích...' : 'AI Phân Tích Lại'}</span>
              </button>

              <a
                href={mediaUrl}
                download={currentArtwork.filename}
                className={styles.actionBtn}
                title="Tải tệp về máy"
              >
                <Download size={15} />
                <span>Tải về</span>
              </a>

              <a
                href={mediaUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.actionBtn}
                title="Mở tệp trực tiếp trong tab mới"
              >
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
