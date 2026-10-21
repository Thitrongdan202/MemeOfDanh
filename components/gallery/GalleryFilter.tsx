"use client";

import React from "react";
import { Search, X, SlidersHorizontal, Image as ImageIcon, Film, Heart, Shuffle } from "lucide-react";

export type FilterMediaType = "all" | "image" | "video" | "favorites";
export type SortOption = "catalog-asc" | "catalog-desc" | "newest" | "oldest" | "name" | "shuffle";

interface GalleryFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeType: FilterMediaType;
  onTypeChange: (type: FilterMediaType) => void;
  activeSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount: number;
  imageCount: number;
  videoCount: number;
  favoriteCount: number;
  onShuffle: () => void;
  resultCount: number;
}

export function GalleryFilter({
  searchQuery,
  onSearchChange,
  activeType,
  onTypeChange,
  activeSort,
  onSortChange,
  totalCount,
  imageCount,
  videoCount,
  favoriteCount,
  onShuffle,
  resultCount,
}: GalleryFilterProps) {
  return (
    <div className="w-full space-y-4 pb-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-museum-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, nội dung, tệp hoặc #tag (không dấu hoặc có dấu)..."
            className="w-full pl-10 pr-9 py-2 rounded-lg bg-museum-surface border border-museum-border focus:border-cobalt text-museum-text text-xs placeholder:text-museum-subtle focus:outline-none transition-colors shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-museum-subtle hover:text-museum-text"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Media Segmented Tabs */}
        <div className="flex items-center overflow-x-auto p-1 rounded-lg bg-museum-muted border border-museum-border text-xs font-medium">
          <button
            onClick={() => onTypeChange("all")}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeType === "all"
                ? "bg-museum-surface text-cobalt font-semibold shadow-sm"
                : "text-museum-secondary hover:text-museum-text"
            }`}
          >
            <span>Tất cả</span>
            <span className="text-[11px] opacity-75">({totalCount})</span>
          </button>

          <button
            onClick={() => onTypeChange("image")}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeType === "image"
                ? "bg-museum-surface text-cobalt font-semibold shadow-sm"
                : "text-museum-secondary hover:text-museum-text"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Ảnh chụp</span>
            <span className="text-[11px] opacity-75">({imageCount})</span>
          </button>

          <button
            onClick={() => onTypeChange("video")}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeType === "video"
                ? "bg-museum-surface text-cobalt font-semibold shadow-sm"
                : "text-museum-secondary hover:text-museum-text"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Video clip</span>
            <span className="text-[11px] opacity-75">({videoCount})</span>
          </button>

          <button
            onClick={() => onTypeChange("favorites")}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeType === "favorites"
                ? "bg-museum-surface text-coral font-semibold shadow-sm"
                : "text-museum-secondary hover:text-museum-text"
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Đã lưu</span>
            <span className="text-[11px] opacity-75">({favoriteCount})</span>
          </button>
        </div>

        {/* Sort & Shuffle */}
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center">
            <SlidersHorizontal className="absolute left-3 w-3.5 h-3.5 text-museum-subtle pointer-events-none" />
            <select
              value={activeSort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="pl-8 pr-7 py-2 rounded-lg bg-museum-surface border border-museum-border text-xs text-museum-text font-medium focus:border-cobalt focus:outline-none appearance-none cursor-pointer shadow-sm"
            >
              <option value="catalog-asc">Số thứ tự: 1 → Cuối</option>
              <option value="catalog-desc">Số thứ tự: Cuối → 1</option>
              <option value="newest">Ngày thêm: Mới nhất</option>
              <option value="oldest">Ngày thêm: Cũ nhất</option>
              <option value="name">Tên tệp: A → Z</option>
            </select>
          </div>

          <button
            onClick={onShuffle}
            title="Đổi thứ tự ngẫu nhiên"
            className="p-2 rounded-lg bg-museum-surface border border-museum-border hover:border-cobalt text-museum-secondary hover:text-cobalt transition-colors shadow-sm"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Result Indicator if filtering */}
      {(searchQuery || activeType !== "all" || activeSort === "shuffle") && (
        <div className="flex items-center justify-between text-xs text-museum-secondary pt-1">
          <div>
            Hiển thị <span className="font-semibold text-museum-text">{resultCount}</span> tác phẩm phù hợp
          </div>
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="text-cobalt hover:underline text-xs"
            >
              Xóa điều kiện lọc
            </button>
          )}
        </div>
      )}
    </div>
  );
}
