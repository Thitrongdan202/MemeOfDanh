"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Sparkles, Volume2, VolumeX, Eye } from "lucide-react";

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
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

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
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-museum-950/80 border-b border-museum-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="group flex items-center space-x-2.5 text-ivory hover:text-lime-accent transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-lime-accent animate-pulse" />
            <span className="font-serif text-lg tracking-tight font-bold">
              MEMEOF DANH
            </span>
            <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded bg-museum-800 text-museum-300 border border-museum-700">
              COLLECTION '26
            </span>
          </Link>
        </div>

        {/* Center Live Clock & Status */}
        <div className="hidden md:flex items-center space-x-6 text-xs font-mono text-museum-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-accent" />
            <span className="text-ivory uppercase tracking-widest text-[11px]">
              TRIỂN LÃM MỞ CỬA
            </span>
          </div>
          <span>•</span>
          <div className="text-museum-300">
            HANOI <span className="text-ivory font-semibold">{timeStr || "07:45:00"}</span>
          </div>
          <span>•</span>
          <div>
            <span className="text-ivory font-bold">{totalArtworks}</span> TÁC PHẨM
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {onRescanRequested && (
            <button
              onClick={onRescanRequested}
              disabled={isSyncing}
              data-cursor="SYNC"
              title="Quét lại thư mục memes và cập nhật catalog"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-museum-850 hover:bg-museum-800 border border-museum-700 hover:border-lime-accent/50 text-museum-200 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-lime-accent ${isSyncing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {isSyncing ? "Đang đồng bộ..." : "Quét thư viện"}
              </span>
            </button>
          )}

          <a
            href="#gallery-section"
            className="px-3.5 py-1.5 rounded-md text-xs font-mono font-medium bg-lime-accent hover:bg-lime-dim text-museum-950 transition-colors shadow-[0_0_15px_rgba(212,255,50,0.2)]"
          >
            VÀO XEM
          </a>
        </div>
      </div>
    </header>
  );
}
