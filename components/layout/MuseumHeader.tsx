"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Sparkles, ArrowRight } from "lucide-react";

interface MuseumHeaderProps {
  totalArtworks?: number;
  onRescanRequested?: () => Promise<void>;
  isSyncing?: boolean;
}

export function MuseumHeader({
  totalArtworks = 193,
  onRescanRequested,
  isSyncing = false,
}: MuseumHeaderProps) {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-museum-surface/90 backdrop-blur-md border-b border-museum-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-2.5 text-museum-text hover:text-cobalt transition-colors group"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cobalt transition-transform group-hover:scale-125" />
            <span className="font-serif text-xl font-bold tracking-tight">
              MEMEOF DANH
            </span>
          </Link>
          <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-museum-muted text-museum-secondary border border-museum-border">
            Bảo tàng meme cá nhân
          </span>
        </div>

        {/* Center Live Museum Metrics */}
        <div className="hidden md:flex items-center space-x-5 text-xs text-museum-secondary font-medium">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-museum-text font-medium text-[11px] uppercase tracking-wider">
              Đang mở cửa
            </span>
          </div>
          <span className="text-museum-borderDark">•</span>
          <div>
            Hà Nội <span className="font-mono text-museum-text font-semibold">{timeStr || "09:00:00"}</span>
          </div>
          <span className="text-museum-borderDark">•</span>
          <div>
            Bộ sưu tập: <span className="font-semibold text-museum-text">{totalArtworks}</span> tác phẩm
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {onRescanRequested && (
            <button
              onClick={onRescanRequested}
              disabled={isSyncing}
              title="Quét lại thư mục memes và cập nhật danh mục"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-museum-muted hover:bg-museum-border text-museum-text border border-museum-border transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-cobalt ${isSyncing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {isSyncing ? "Đang quét..." : "Quét thư viện"}
              </span>
            </button>
          )}

          <a
            href="#gallery-section"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cobalt hover:bg-cobalt-hover text-white transition-all shadow-sm"
          >
            <span>Khám phá</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
