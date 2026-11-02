import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchManifest, roastArtwork, reviewAction, getThumbnailUrl } from '@/services/api';
import { Sparkles, RefreshCw, CheckCircle, AlertTriangle, HelpCircle, Layers, Check, X } from 'lucide-react';
import { ArtworkMedia, NamingCandidate } from '@/types/artwork';
import { cn } from '@/lib/utils';
import styles from './AIStudioPage.module.css';

export function AIStudioPage() {
  const qc = useQueryClient();
  const [filterTab, setFilterTab] = useState<'all' | 'flagged' | 'curated' | 'pending'>('all');
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkMedia | null>(null);
  const [roastingId, setRoastingId] = useState<string | null>(null);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  const { data: manifest, isLoading } = useQuery({
    queryKey: ['manifest'],
    queryFn: fetchManifest,
  });

  const artworks = manifest?.artworks || [];
  const totalCount = artworks.length;
  const curatedCount = artworks.filter((a) => a.aiGenerated && a.aiStatus === 'success').length;
  const flaggedCount = artworks.filter((a) => a.review_status === 'flagged' || a.groundingWarning).length;
  const pendingCount = artworks.filter((a) => !a.aiGenerated || a.aiStatus === 'pending').length;

  const filteredList = artworks.filter((a) => {
    if (filterTab === 'flagged') return a.review_status === 'flagged' || a.groundingWarning;
    if (filterTab === 'curated') return a.aiGenerated && a.aiStatus === 'success';
    if (filterTab === 'pending') return !a.aiGenerated || a.aiStatus === 'pending';
    return true;
  });

  const addLog = (msg: string) => {
    setLogMessages((prev) => [msg, ...prev.slice(0, 50)]);
  };

  const handleRoastSingle = async (artwork: ArtworkMedia, force = true) => {
    setRoastingId(artwork.id);
    addLog(`Đang gửi yêu cầu phân tích Two-Pass cho [${artwork.id} - ${artwork.filename}]...`);
    try {
      const res = await roastArtwork(artwork.id, force);
      if (res.artwork) {
        addLog(`Hoàn thành: "${res.artwork.title}"`);
        setSelectedArtwork(res.artwork);
        qc.setQueryData(['manifest'], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            artworks: old.artworks.map((a: ArtworkMedia) => (a.id === res.artwork.id ? res.artwork : a)),
          };
        });
      }
    } catch (err: any) {
      addLog(`Lỗi khi xử lý ${artwork.id}: ${err.message}`);
    } finally {
      setRoastingId(null);
    }
  };

  const handleApprove = async (artwork: ArtworkMedia) => {
    try {
      const res = await reviewAction('approve', artwork.id);
      if (res.artwork) {
        addLog(`Đã duyệt: ${artwork.id}`);
        setSelectedArtwork(res.artwork);
        qc.setQueryData(['manifest'], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            artworks: old.artworks.map((a: ArtworkMedia) => (a.id === res.artwork.id ? res.artwork : a)),
          };
        });
      }
    } catch (err: any) {
      addLog(`Lỗi duyệt: ${err.message}`);
    }
  };

  const handleFlag = async (artwork: ArtworkMedia) => {
    try {
      const res = await reviewAction('flag', artwork.id);
      if (res.artwork) {
        addLog(`Đã gắn cờ xem xét: ${artwork.id}`);
        setSelectedArtwork(res.artwork);
        qc.setQueryData(['manifest'], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            artworks: old.artworks.map((a: ArtworkMedia) => (a.id === res.artwork.id ? res.artwork : a)),
          };
        });
      }
    } catch (err: any) {
      addLog(`Lỗi gắn cờ: ${err.message}`);
    }
  };

  const handleSelectCandidate = async (artwork: ArtworkMedia, candidate: NamingCandidate, index: number) => {
    try {
      const res = await reviewAction('select_candidate', artwork.id, { candidateIndex: index });
      if (res.artwork) {
        addLog(`Đã chọn phương án "${candidate.title}" cho [${artwork.id}]`);
        setSelectedArtwork(res.artwork);
        qc.setQueryData(['manifest'], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            artworks: old.artworks.map((a: ArtworkMedia) => (a.id === res.artwork.id ? res.artwork : a)),
          };
        });
      }
    } catch (err: any) {
      addLog(`Lỗi chọn candidate: ${err.message}`);
    }
  };

  const handleBatchProcessPending = async () => {
    const pendingList = artworks.filter((a) => !a.aiGenerated || a.aiStatus === 'pending');
    if (pendingList.length === 0) {
      alert('Không có tác phẩm nào đang chờ xử lý!');
      return;
    }

    setBatchRunning(true);
    setBatchProgress({ current: 0, total: pendingList.length });
    addLog(`Bắt đầu chạy batch ${pendingList.length} tác phẩm...`);

    for (let i = 0; i < pendingList.length; i++) {
      const item = pendingList[i];
      setBatchProgress({ current: i + 1, total: pendingList.length });
      addLog(`[${i + 1}/${pendingList.length}] Xử lý ${item.id}...`);
      try {
        await roastArtwork(item.id, false);
      } catch (e: any) {
        addLog(`Lỗi tại ${item.id}: ${e.message}`);
      }
    }

    setBatchRunning(false);
    setBatchProgress(null);
    addLog('Đã hoàn tất batch processing!');
    qc.invalidateQueries({ queryKey: ['manifest'] });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconCircle}>
            <Sparkles size={24} color="var(--accent-primary)" />
          </div>
          <div>
            <h1 className={styles.pageTitle}>AI Naming & Curation Studio</h1>
            <p className={styles.pageSubtitle}>
              Two-Pass Vision Pipeline v5.0 — Phân tích chi tiết thị giác thực tế, loại bỏ đặt tên chung chung và chế giễu phiến diện.
            </p>
          </div>
        </div>

        <button
          className={styles.batchBtn}
          onClick={handleBatchProcessPending}
          disabled={batchRunning || pendingCount === 0}
        >
          <RefreshCw size={15} className={batchRunning ? styles.spinning : ''} />
          <span>
            {batchRunning
              ? `Đang chạy (${batchProgress?.current}/${batchProgress?.total})...`
              : `Phân Tích ${pendingCount} Tác Phẩm Chờ`}
          </span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Tổng Tác Phẩm</div>
          <div className={styles.metricValue}>{totalCount}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Đã Phân Tích (Two-Pass)</div>
          <div className={cn(styles.metricValue, styles.successVal)}>{curatedCount}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Cần Kiểm Tra / Cảnh Báo</div>
          <div className={cn(styles.metricValue, styles.warningVal)}>{flaggedCount}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Chưa Phân Tích</div>
          <div className={cn(styles.metricValue, styles.mutedVal)}>{pendingCount}</div>
        </div>
      </div>

      {/* Workspace */}
      <div className={styles.workspace}>
        {/* Left Column: Artwork List */}
        <div className={styles.listCol}>
          <div className={styles.tabs}>
            <button
              className={cn(styles.tab, filterTab === 'all' && styles.tabActive)}
              onClick={() => setFilterTab('all')}
            >
              Tất cả ({totalCount})
            </button>
            <button
              className={cn(styles.tab, filterTab === 'flagged' && styles.tabActive)}
              onClick={() => setFilterTab('flagged')}
            >
              Cần duyệt ({flaggedCount})
            </button>
            <button
              className={cn(styles.tab, filterTab === 'curated' && styles.tabActive)}
              onClick={() => setFilterTab('curated')}
            >
              Đã phân tích ({curatedCount})
            </button>
            <button
              className={cn(styles.tab, filterTab === 'pending' && styles.tabActive)}
              onClick={() => setFilterTab('pending')}
            >
              Chờ ({pendingCount})
            </button>
          </div>

          <div className={styles.itemsList}>
            {filteredList.map((art) => {
              const isSelected = selectedArtwork?.id === art.id;
              const isRoasting = roastingId === art.id;
              const thumb = getThumbnailUrl(art.hash, art.safeUrl);

              return (
                <div
                  key={art.id}
                  className={cn(styles.itemRow, isSelected && styles.itemRowActive)}
                  onClick={() => setSelectedArtwork(art)}
                >
                  <img src={thumb} alt="" className={styles.itemThumb} />
                  <div className={styles.itemMeta}>
                    <div className={styles.itemTop}>
                      <span className={styles.itemId}>{art.id}</span>
                      <span className={styles.itemType}>{art.type}</span>
                      {art.groundingWarning && (
                        <span className={styles.warnBadge}>Cảnh báo</span>
                      )}
                    </div>
                    <div className={styles.itemTitle}>{art.title}</div>
                  </div>
                  <button
                    className={styles.miniRoastBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoastSingle(art);
                    }}
                    disabled={isRoasting}
                    title="Phân tích lại"
                  >
                    <RefreshCw size={13} className={isRoasting ? styles.spinning : ''} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detail Inspector & Candidate Chooser */}
        <div className={styles.inspectCol}>
          {selectedArtwork ? (
            <div className={styles.inspector}>
              <div className={styles.inspectHeader}>
                <div>
                  <div className={styles.inspectId}>{selectedArtwork.id} • {selectedArtwork.filename}</div>
                  <h2 className={styles.inspectTitle}>{selectedArtwork.title}</h2>
                </div>
                <div className={styles.inspectActions}>
                  <button
                    className={styles.btnApprove}
                    onClick={() => handleApprove(selectedArtwork)}
                    title="Đánh dấu đã duyệt"
                  >
                    <Check size={14} /> Duyệt
                  </button>
                  <button
                    className={styles.btnFlag}
                    onClick={() => handleFlag(selectedArtwork)}
                    title="Gắn cờ xem xét lại"
                  >
                    <AlertTriangle size={14} /> Gắn cờ
                  </button>
                  <button
                    className={styles.btnReanalyze}
                    onClick={() => handleRoastSingle(selectedArtwork)}
                    disabled={roastingId === selectedArtwork.id}
                  >
                    <RefreshCw size={14} className={roastingId === selectedArtwork.id ? styles.spinning : ''} />
                    Phân tích lại
                  </button>
                </div>
              </div>

              {selectedArtwork.groundingWarning && (
                <div className={styles.inspectWarning}>
                  <AlertTriangle size={16} />
                  <span>{selectedArtwork.groundingWarning}</span>
                </div>
              )}

              {/* Pass 1 Data */}
              <div className={styles.inspectSection}>
                <div className={styles.sectionHeader}>
                  <Sparkles size={14} /> Pass 1: Quan Sát Thị Giác Khách Quan (Grounding)
                </div>
                <div className={styles.sectionBody}>
                  <p className={styles.sectionDesc}>
                    {selectedArtwork.visual_summary || 'Chưa có quan sát thị giác chi tiết.'}
                  </p>
                  {selectedArtwork.funny_observation && (
                    <div className={styles.observationHighlight}>
                      <strong>Góc nhìn hài hước:</strong> {selectedArtwork.funny_observation}
                    </div>
                  )}
                </div>
              </div>

              {/* Pass 2 Candidates */}
              <div className={styles.inspectSection}>
                <div className={styles.sectionHeader}>
                  <Layers size={14} /> Pass 2: Các Phương Án Tiêu Đề Đã Đề Xuất
                </div>
                <div className={styles.candidateGrid}>
                  {selectedArtwork.candidates && selectedArtwork.candidates.length > 0 ? (
                    selectedArtwork.candidates.map((cand, idx) => {
                      const isCurrent = cand.title === selectedArtwork.title;
                      return (
                        <div
                          key={idx}
                          className={cn(styles.candBox, isCurrent && styles.candBoxActive)}
                          onClick={() => handleSelectCandidate(selectedArtwork, cand, idx)}
                        >
                          <div className={styles.candHeader}>
                            <span className={styles.candTitle}>{cand.title}</span>
                            {isCurrent ? (
                              <span className={styles.activeTag}><Check size={12} /> Đang chọn</span>
                            ) : (
                              <button className={styles.selectBtn}>Chọn</button>
                            )}
                          </div>
                          {cand.caption && <p className={styles.candCap}>{cand.caption}</p>}
                          {cand.reasoning && <p className={styles.candReason}>{cand.reasoning}</p>}
                          {cand.approach && <span className={styles.candApproach}>{cand.approach}</span>}
                        </div>
                      );
                    })
                  ) : (
                    <p className={styles.emptyCandidates}>
                      Chưa có danh sách candidates. Chạy phân tích Two-Pass để tạo 3 phương án đặt tên.
                    </p>
                  )}
                </div>
              </div>

              {/* Pipeline Activity Log */}
              {logMessages.length > 0 && (
                <div className={styles.inspectSection}>
                  <div className={styles.sectionHeader}>Nhật Ký Xử Lý AI</div>
                  <div className={styles.logConsole}>
                    {logMessages.map((m, i) => (
                      <div key={i} className={styles.logLine}>
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.inspectEmpty}>
              <HelpCircle size={40} className={styles.emptyIcon} />
              <p>Chọn một tác phẩm bên trái để xem kết quả phân tích Two-Pass và chọn phương án đặt tên.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
