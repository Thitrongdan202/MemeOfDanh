"use client";

import React from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  Image as ImageIcon,
  Film,
  Heart,
  Shuffle,
  Columns,
  LayoutGrid,
} from "lucide-react";
import { useSettings } from "@/lib/settings/SettingsContext";

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
  const { settings, updateSettings, playSound } = useSettings();

  const handleTabChange = (type: FilterMediaType) => {
    playSound("pop");
    onTypeChange(type);
  };

  const handleLayoutToggle = (mode: "masonry" | "grid") => {
    playSound("click");
    updateSettings({ galleryLayout: mode });
  };

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
            className="w-full pl-10 pr-9 py-2 rounded-lg bg-museum-surface border border-museum-border focus:border-accent text-museum-text text-xs placeholder:text-museum-subtle focus:outline-none transition-colors shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => {
                playSound("click");
                onSearchChange("");
              }}
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
            onClick={() => handleTabChange("all")}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-all duration-200 whitespace-nowrap active:scale-95 ${
              activeType === "all"
                ? "bg-museum-surface text-accent font-semibold shadow-sm"
                : "text-museum-secondary hover:text-museum-text"
            }`}
          >
            <span>Tất cả</span>
            <span className="text-[11px] opacity-75">({totalCount})</span>
          </button>

          <button
            onClick={() => handleTabChange("image")}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-all duration-200 whitespace-nowrap active:scale-95 ${
              activeType === "image"
                ? "bg-museum-surface text-accent font-semibold shadow-sm"
                : "text-museum-secondary hover:text-museum-text"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Ảnh chụp</span>
            <span className="text-[11px] opacity-75">({imageCount})</span>
          </button>

          <button
            onClick={() => handleTabChange("video")}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-all duration-200 whitespace-nowrap active:scale-95 ${
              activeType === "video"
                ? "bg-museum-surface text-accent font-semibold shadow-sm"
                : "text-museum-secondary hover:text-museum-text"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Video clip</span>
            <span className="text-[11px] opacity-75">({videoCount})</span>
          </button>

          <button
            onClick={() => handleTabChange("favorites")}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-all duration-200 whitespace-nowrap active:scale-95 ${
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

        {/* Layout Toggle, Sort & Shuffle */}
        <div className="flex items-center space-x-2">
          {/* Quick Layout Mode Switcher */}
          <div className="flex items-center p-1 rounded-lg bg-museum-muted border border-museum-border">
            <button
              onClick={() => handleLayoutToggle("masonry")}
              title="Bố cục Masonry nhịp điệu"
              className={`p-1.5 rounded-md transition-colors ${
                settings.galleryLayout === "masonry"
                  ? "bg-museum-surface text-accent shadow-sm"
                  : "text-museum-subtle hover:text-museum-text"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleLayoutToggle("grid")}
              title="Bố cục Lưới đồng đều"
              className={`p-1.5 rounded-md transition-colors ${
                settings.galleryLayout === "grid"
                  ? "bg-museum-surface text-accent shadow-sm"
                  : "text-museum-subtle hover:text-museum-text"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <SlidersHorizontal className="absolute left-3 w-3.5 h-3.5 text-museum-subtle pointer-events-none" />
            <select
              value={activeSort}
              onChange={(e) => {
                playSound("click");
                onSortChange(e.target.value as SortOption);
              }}
              className="pl-8 pr-7 py-2 rounded-lg bg-museum-surface border border-museum-border text-xs text-museum-text font-medium focus:border-accent focus:outline-none appearance-none cursor-pointer shadow-sm"
            >
              <option value="catalog-asc">Số thứ tự: 1 → Cuối</option>
              <option value="catalog-desc">Số thứ tự: Cuối → 1</option>
              <option value="newest">Ngày thêm: Mới nhất</option>
              <option value="oldest">Ngày thêm: Cũ nhất</option>
              <option value="name">Tên tệp: A → Z</option>
            </select>
          </div>

          {/* Shuffle Button */}
          <button
            onClick={() => {
              playSound("pop");
              onShuffle();
            }}
            data-cursor="SHUFFLE"
            title="Đổi thứ tự ngẫu nhiên (Shuffle)"
            className="p-2 rounded-lg bg-museum-surface border border-museum-border hover:border-accent text-museum-secondary hover:text-accent transition-colors shadow-sm active:scale-95"
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
              onClick={() => {
                playSound("click");
                onSearchChange("");
              }}
              className="text-accent hover:underline text-xs"
            >
              Xóa điều kiện lọc
            </button>
          )}
        </div>
      )}
    </div>
  );
}
