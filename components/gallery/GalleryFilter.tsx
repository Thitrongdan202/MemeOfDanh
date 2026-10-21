"use client";

import React from "react";
import { Search, X, SlidersHorizontal, Image as ImageIcon, Film, Heart, Grid, Shuffle } from "lucide-react";

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
}: GalleryFilterProps) {
  return (
    <div className="w-full space-y-4 pb-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-museum-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên tác phẩm, tệp, lời bình hoặc #tag..."
            className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-museum-900 border border-museum-800 focus:border-lime-accent text-ivory text-xs font-mono placeholder:text-museum-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-museum-400 hover:text-ivory"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Media Type Tabs */}
        <div className="flex items-center overflow-x-auto pb-1 lg:pb-0 space-x-1.5 p-1 rounded-lg bg-museum-900 border border-museum-800 text-xs font-mono">
          <button
            onClick={() => onTypeChange("all")}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeType === "all"
                ? "bg-museum-800 text-lime-accent font-semibold shadow-sm"
                : "text-museum-400 hover:text-ivory"
            }`}
          >
            <span>TẤT CẢ</span>
            <span className="text-[10px] opacity-70">({totalCount})</span>
          </button>

          <button
            onClick={() => onTypeChange("image")}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeType === "image"
                ? "bg-museum-800 text-lime-accent font-semibold shadow-sm"
                : "text-museum-400 hover:text-ivory"
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>ẢNH</span>
            <span className="text-[10px] opacity-70">({imageCount})</span>
          </button>

          <button
            onClick={() => onTypeChange("video")}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeType === "video"
                ? "bg-museum-800 text-lime-accent font-semibold shadow-sm"
                : "text-museum-400 hover:text-ivory"
            }`}
          >
            <Film className="w-3 h-3" />
            <span>CLIPS</span>
            <span className="text-[10px] opacity-70">({videoCount})</span>
          </button>

          <button
            onClick={() => onTypeChange("favorites")}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-all whitespace-nowrap ${
              activeType === "favorites"
                ? "bg-museum-800 text-vermilion font-semibold shadow-sm"
                : "text-museum-400 hover:text-ivory"
            }`}
          >
            <Heart className="w-3 h-3 fill-current" />
            <span>YÊU THÍCH</span>
            <span className="text-[10px] opacity-70">({favoriteCount})</span>
          </button>
        </div>

        {/* Sort & Shuffle */}
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center">
            <SlidersHorizontal className="absolute left-3 w-3.5 h-3.5 text-museum-400 pointer-events-none" />
            <select
              value={activeSort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="pl-8 pr-7 py-2 rounded-lg bg-museum-900 border border-museum-800 text-xs font-mono text-ivory focus:border-lime-accent focus:outline-none appearance-none cursor-pointer"
            >
              <option value="catalog-asc">Catalog # tăng dần</option>
              <option value="catalog-desc">Catalog # giảm dần</option>
              <option value="newest">Ngày sửa: Mới nhất</option>
              <option value="oldest">Ngày sửa: Cũ nhất</option>
              <option value="name">Tên tệp: A → Z</option>
            </select>
          </div>

          <button
            onClick={onShuffle}
            data-cursor="SHUFFLE"
            title="Đổi thứ tự ngẫu nhiên"
            className="p-2 rounded-lg bg-museum-900 border border-museum-800 hover:border-lime-accent text-museum-300 hover:text-lime-accent transition-colors"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
