"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Sparkles,
  Eye,
  Check,
  Search,
  SlidersHorizontal,
  Bot,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Play,
} from "lucide-react";
import { ArtworkMedia } from "@/lib/memes/types";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface ReviewStats {
  total: number;
  aiCurated: number;
  needsReview: number;
  approved: number;
  pending: number;
  withGroundingWarning: number;
}

export default function AIReviewPage() {
  const [artworks, setArtworks] = useState<ArtworkMedia[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [filter, setFilter] = useState<"all" | "needs_review" | "approved" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkMedia | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ai/review?filter=${filter}&limit=100`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setArtworks(data.artworks || []);
      setStats(data.stats || null);
      if (data.artworks?.length > 0 && !selectedArtwork) {
        setSelectedArtwork(data.artworks[0]);
      }
    } catch (err: any) {
      showToast(`Lỗi nạp danh sách: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [filter, selectedArtwork]);

  useEffect(() => {
    fetchArtworks();
  }, [filter]);

  // Handle Review Actions
  const handleAction = async (
    action: "approve" | "flag" | "select_candidate" | "regenerate",
    artworkId: string,
    candidateIndex?: number
  ) => {
    setActionLoadingId(artworkId);
    try {
      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id: artworkId, candidateIndex }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Thao tác không thành công");
      }

      // Update local state
      const updated = data.artwork as ArtworkMedia;
      setArtworks((prev) =>
        prev.map((item) => (item.id === artworkId ? updated : item))
      );
      if (selectedArtwork?.id === artworkId) {
        setSelectedArtwork(updated);
      }

      if (action === "approve") showToast(`Đã duyệt tiêu đề cho [${artworkId}]`);
      if (action === "flag") showToast(`Đã gắn cờ cần xem xét lại [${artworkId}]`);
      if (action === "select_candidate") showToast(`Đã chọn ứng viên #${(candidateIndex ?? 0) + 1} cho [${artworkId}]`);
      if (action === "regenerate") showToast(`Đã tạo lại phân tích & tiêu đề AI cho [${artworkId}]`);
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter by search query
  const filteredArtworks = useMemo(() => {
    if (!searchQuery.trim()) return artworks;
    const q = searchQuery.toLowerCase();
    return artworks.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.filename.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [artworks, searchQuery]);

  return (
    <div className="min-h-screen bg-museum-bg text-museum-text font-sans antialiased transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-museum-darkAccent text-white shadow-xl border border-museum-border text-sm flex items-center space-x-2 animate-bounce-short">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-museum-surface/90 backdrop-blur-md border-b border-museum-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 text-xs font-semibold text-museum-secondary hover:text-museum-text px-3 py-1.5 rounded-lg bg-museum-muted border border-museum-border transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Bảo tàng</span>
            </Link>
            <div className="h-4 w-[1px] bg-museum-border" />
            <div>
              <h1 className="font-serif text-lg font-bold tracking-tight flex items-center space-x-2">
                <span>AI Naming Studio & Đối soát</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/10 text-accent font-semibold">
                  v5.0 Grounded
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchArtworks}
              disabled={loading}
              title="Tải lại danh sách"
              className="p-2 rounded-lg text-museum-secondary hover:text-museum-text hover:bg-museum-muted border border-museum-border transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-accent" : ""}`} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* KPI Stats Bar */}
      {stats && (
        <section className="bg-museum-surface border-b border-museum-border py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            <div className="bg-museum-muted/50 p-2.5 rounded-lg border border-museum-border">
              <div className="text-museum-secondary font-medium">Tổng hiện vật</div>
              <div className="text-base font-bold mt-0.5">{stats.total}</div>
            </div>
            <div className="bg-museum-muted/50 p-2.5 rounded-lg border border-museum-border">
              <div className="text-museum-secondary font-medium">Đã phân tích AI</div>
              <div className="text-base font-bold text-accent mt-0.5">{stats.aiCurated}</div>
            </div>
            <div className="bg-museum-muted/50 p-2.5 rounded-lg border border-museum-border">
              <div className="text-museum-secondary font-medium">Đã duyệt chuẩn</div>
              <div className="text-base font-bold text-emerald-600 mt-0.5">{stats.approved}</div>
            </div>
            <div className="bg-museum-muted/50 p-2.5 rounded-lg border border-museum-border">
              <div className="text-museum-secondary font-medium">Cần xem xét</div>
              <div className="text-base font-bold text-amber-500 mt-0.5">{stats.needsReview}</div>
            </div>
            <div className="bg-museum-muted/50 p-2.5 rounded-lg border border-museum-border">
              <div className="text-museum-secondary font-medium">Có cảnh báo</div>
              <div className="text-base font-bold text-rose-500 mt-0.5">{stats.withGroundingWarning}</div>
            </div>
            <div className="bg-museum-muted/50 p-2.5 rounded-lg border border-museum-border">
              <div className="text-museum-secondary font-medium">Chờ phân tích</div>
              <div className="text-base font-bold text-museum-secondary mt-0.5">{stats.pending}</div>
            </div>
          </div>
        </section>
      )}

      {/* Main Workspace: Split View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List & Filters (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Filter Tabs & Search */}
            <div className="bg-museum-surface p-4 rounded-xl border border-museum-border space-y-3">
              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "needs_review", label: "Cần duyệt" },
                  { id: "approved", label: "Đã duyệt" },
                  { id: "pending", label: "Chưa AI" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      filter === tab.id
                        ? "bg-accent text-white shadow-sm"
                        : "bg-museum-muted text-museum-secondary hover:text-museum-text"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-museum-secondary" />
                <input
                  type="text"
                  placeholder="Tìm theo tiêu đề, ID, tệp..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-museum-muted border border-museum-border text-museum-text placeholder:text-museum-secondary focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            {/* Artwork Items List */}
            <div className="bg-museum-surface rounded-xl border border-museum-border divide-y divide-museum-border max-h-[calc(100vh-280px)] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-xs text-museum-secondary flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-accent" />
                  <span>Đang tải danh mục hiện vật...</span>
                </div>
              ) : filteredArtworks.length === 0 ? (
                <div className="p-8 text-center text-xs text-museum-secondary">
                  Không tìm thấy hiện vật nào phù hợp bộ lọc.
                </div>
              ) : (
                filteredArtworks.map((item) => {
                  const isSelected = selectedArtwork?.id === item.id;
                  const isVideo = item.type === "video";
                  const thumb = !isVideo && item.hash
                    ? `/thumbnails/${item.hash}.webp`
                    : `/api/media/${item.safeUrl}`;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedArtwork(item)}
                      className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-all hover:bg-museum-muted/60 ${
                        isSelected
                          ? "bg-accent/5 border-l-4 border-l-accent"
                          : ""
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-16 h-16 rounded-lg bg-museum-muted flex-shrink-0 overflow-hidden border border-museum-border">
                        {isVideo ? (
                          <div className="w-full h-full flex items-center justify-center bg-museum-darkAccent text-white">
                            <Play className="w-5 h-5 opacity-70" />
                          </div>
                        ) : (
                          <img
                            src={thumb}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                        <span className="absolute bottom-0.5 right-0.5 text-[9px] font-mono px-1 rounded bg-black/70 text-white uppercase">
                          {item.format}
                        </span>
                      </div>

                      {/* Content preview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between space-x-1">
                          <span className="text-[11px] font-mono font-semibold text-museum-secondary">
                            {item.id}
                          </span>
                          {/* Status Pill */}
                          {item.review_status === "approved" ? (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 flex items-center space-x-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Đã duyệt</span>
                            </span>
                          ) : item.review_status === "needs_review" || item.needsReview ? (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Cần duyệt</span>
                            </span>
                          ) : item.review_status === "flagged" ? (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 flex items-center space-x-1">
                              <Flag className="w-3 h-3" />
                              <span>Gắn cờ</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-museum-muted text-museum-secondary">
                              Chờ xử lý
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-semibold truncate mt-1 text-museum-text">
                          {item.title}
                        </h4>

                        <p className="text-[11px] text-museum-secondary truncate mt-0.5">
                          {item.curatorReview || item.caption || item.description}
                        </p>

                        {item.groundingWarning && (
                          <div className="text-[10px] text-amber-600 truncate mt-1 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                            <span>{item.groundingWarning}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Detailed Review & Editor (7 cols) */}
          <div className="lg:col-span-7">
            {selectedArtwork ? (
              <div className="bg-museum-surface rounded-xl border border-museum-border p-5 space-y-6 sticky top-24">
                {/* Header Info */}
                <div className="flex items-start justify-between border-b border-museum-border pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-museum-muted text-museum-secondary font-semibold">
                        {selectedArtwork.id}
                      </span>
                      <span className="text-xs text-museum-secondary">
                        Tệp: <span className="font-mono font-medium">{selectedArtwork.filename}</span>
                      </span>
                      {selectedArtwork.aiModel && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                          {selectedArtwork.aiModel}
                        </span>
                      )}
                    </div>
                    <h2 className="font-serif text-xl font-bold mt-2 text-museum-text">
                      {selectedArtwork.title}
                    </h2>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAction("regenerate", selectedArtwork.id)}
                      disabled={actionLoadingId === selectedArtwork.id}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-museum-muted hover:bg-museum-border text-museum-text border border-museum-border transition-all active:scale-95 disabled:opacity-50"
                      title="Gọi lại Gemini Vision Two-Pass để tạo tiêu đề mới"
                    >
                      <Sparkles
                        className={`w-3.5 h-3.5 text-accent ${
                          actionLoadingId === selectedArtwork.id ? "animate-spin" : ""
                        }`}
                      />
                      <span>Tạo lại AI</span>
                    </button>

                    <button
                      onClick={() => handleAction("approve", selectedArtwork.id)}
                      disabled={actionLoadingId === selectedArtwork.id}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Duyệt</span>
                    </button>

                    <button
                      onClick={() => handleAction("flag", selectedArtwork.id)}
                      disabled={actionLoadingId === selectedArtwork.id}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 border border-museum-border transition-all active:scale-95"
                      title="Gắn cờ kiểm tra lại"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Grounding Warning Banner (if any) */}
                {selectedArtwork.groundingWarning && (
                  <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start space-x-2.5">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Cảnh báo kiểm chứng thị giác:</div>
                      <div className="mt-0.5">{selectedArtwork.groundingWarning}</div>
                    </div>
                  </div>
                )}

                {/* Media Preview & Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Media Frame */}
                  <div className="relative rounded-lg bg-museum-muted border border-museum-border overflow-hidden flex items-center justify-center min-h-[220px] max-h-[340px]">
                    {selectedArtwork.type === "video" ? (
                      <video
                        src={`/api/media/${selectedArtwork.safeUrl}`}
                        controls
                        className="w-full h-full object-contain max-h-[340px]"
                      />
                    ) : (
                      <img
                        src={`/api/media/${selectedArtwork.safeUrl}`}
                        alt={selectedArtwork.title}
                        className="w-full h-full object-contain max-h-[340px]"
                      />
                    )}
                  </div>

                  {/* Pass 1: Factual Visual Analysis */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-museum-secondary uppercase tracking-wider">
                        <Eye className="w-3.5 h-3.5 text-accent" />
                        <span>Pass 1: Phân tích thị giác thực tế</span>
                      </div>
                      <div className="mt-2 text-xs text-museum-text bg-museum-muted/50 p-3 rounded-lg border border-museum-border leading-relaxed">
                        {selectedArtwork.visual_summary || selectedArtwork.description || (
                          <span className="italic text-museum-secondary">
                            Chưa có dữ liệu phân tích thị giác xác thực.
                          </span>
                        )}
                      </div>

                      {/* Funny Observation from Pass 1 */}
                      {selectedArtwork.funny_observation && (
                        <div className="mt-2 text-xs bg-accent/5 p-2.5 rounded-lg border border-accent/20 text-museum-text">
                          <span className="font-semibold text-accent">Góc hài hước: </span>
                          <span>{selectedArtwork.funny_observation}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <div className="text-[11px] font-semibold text-museum-secondary mb-1">
                        Thẻ phân loại:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedArtwork.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-museum-muted border border-museum-border text-museum-secondary"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pass 2: 3 Candidates Side-by-Side */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-museum-secondary uppercase tracking-wider">
                      <Bot className="w-3.5 h-3.5 text-accent" />
                      <span>Pass 2: 3 Ứng viên tiêu đề & Căn cứ thị giác</span>
                    </div>
                    {typeof selectedArtwork.confidence === "number" && (
                      <span className="text-[11px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Độ tự tin: {(selectedArtwork.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>

                  {selectedArtwork.candidates && selectedArtwork.candidates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {selectedArtwork.candidates.map((cand, idx) => {
                        const isChosen =
                          String(idx + 1) === String(selectedArtwork.selectedCandidate) ||
                          selectedArtwork.title === cand.title;

                        const approachBadge =
                          cand.approach === "observational"
                            ? { label: "Quan sát", color: "bg-blue-500/10 text-blue-600" }
                            : cand.approach === "situational"
                            ? { label: "Tình huống", color: "bg-purple-500/10 text-purple-600" }
                            : { label: "Bất ngờ", color: "bg-amber-500/10 text-amber-600" };

                        return (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                              isChosen
                                ? "bg-accent/5 border-accent shadow-sm ring-1 ring-accent"
                                : "bg-museum-muted/40 border-museum-border hover:border-museum-borderDark"
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${approachBadge.color}`}
                                >
                                  {approachBadge.label}
                                </span>
                                {isChosen && (
                                  <span className="text-[10px] font-bold text-accent flex items-center space-x-1">
                                    <Check className="w-3 h-3" />
                                    <span>Đang chọn</span>
                                  </span>
                                )}
                              </div>

                              <h4 className="text-xs font-bold text-museum-text leading-snug">
                                "{cand.title}"
                              </h4>

                              {cand.grounding && (
                                <p className="text-[11px] text-museum-secondary italic bg-museum-surface/60 p-2 rounded border border-museum-border/50">
                                  "{cand.grounding}"
                                </p>
                              )}

                              <p className="text-[11px] text-museum-secondary">
                                {cand.rationale}
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                handleAction("select_candidate", selectedArtwork.id, idx)
                              }
                              disabled={isChosen || actionLoadingId === selectedArtwork.id}
                              className={`w-full mt-3 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                                isChosen
                                  ? "bg-accent text-white opacity-90 cursor-default"
                                  : "bg-museum-surface hover:bg-museum-muted text-museum-text border border-museum-border active:scale-95"
                              }`}
                            >
                              {isChosen ? "Tiêu đề chính thức" : "Chọn ứng viên này"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-museum-secondary italic p-4 bg-museum-muted/40 rounded-xl border border-museum-border text-center">
                      Chưa có 3 ứng viên. Bấm "Tạo lại AI" để chạy phân tích Pass 2 với mô hình thị giác.
                    </div>
                  )}
                </div>

                {/* Curator Caption */}
                <div className="pt-2 border-t border-museum-border">
                  <div className="text-[11px] font-semibold text-museum-secondary uppercase tracking-wider mb-1.5">
                    Lời bình giám tuyển (Curator Caption):
                  </div>
                  <div className="text-xs text-museum-text italic bg-museum-muted/40 p-3 rounded-lg border border-museum-border">
                    "{selectedArtwork.curatorReview || selectedArtwork.caption}"
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-museum-surface rounded-xl border border-museum-border p-12 text-center text-xs text-museum-secondary flex flex-col items-center justify-center space-y-3">
                <HelpCircle className="w-8 h-8 text-museum-secondary/50" />
                <span>Chọn một hiện vật từ danh sách bên trái để đối soát thị giác và biên tập tiêu đề.</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
