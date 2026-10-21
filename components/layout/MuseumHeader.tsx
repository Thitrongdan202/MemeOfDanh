"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Sliders, ArrowRight, Check } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useSettings } from "@/lib/settings/SettingsContext";
import { useMagnetic } from "@/lib/motion/useMagnetic";

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
  const [justSynced, setJustSynced] = useState(false);
  const { setIsSettingsOpen, playSound, settings } = useSettings();
  const ctaRef = useMagnetic<HTMLAnchorElement>(settings.magneticButtons ? 0.25 : 0);

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

  const handleScan = async () => {
    if (!onRescanRequested || isSyncing) return;
    playSound("click");
    await onRescanRequested();
    setJustSynced(true);
    playSound("pop");
    setTimeout(() => setJustSynced(false), 3000);
  };

  const handleOpenSettings = () => {
    playSound("whoosh");
    setIsSettingsOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-museum-surface/85 backdrop-blur-md border-b border-museum-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-2.5 text-museum-text hover:text-accent transition-colors group"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-accent transition-transform duration-300 group-hover:scale-125 shadow-sm" />
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
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Quick Rescan Button */}
          {onRescanRequested && (
            <button
              onClick={handleScan}
              disabled={isSyncing}
              data-cursor="SYNC"
              title="Quét lại thư mục memes và cập nhật danh mục"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-museum-muted hover:bg-museum-border text-museum-text border border-museum-border transition-all active:scale-95 disabled:opacity-50"
            >
              {justSynced ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <RefreshCw
                  className={`w-3.5 h-3.5 text-accent ${isSyncing ? "animate-spin" : ""}`}
                />
              )}
              <span className="hidden sm:inline">
                {isSyncing ? "Đang quét..." : justSynced ? "Đã cập nhật!" : "Quét thư viện"}
              </span>
            </button>
          )}

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Settings Studio Button */}
          <button
            onClick={handleOpenSettings}
            data-cursor="CÀI ĐẶT"
            title="Tùy chỉnh giao diện & chuyển động (Settings Studio)"
            className="p-2 rounded-lg text-museum-secondary hover:text-museum-text hover:bg-museum-muted border border-museum-border transition-all group active:scale-95"
            aria-label="Cài đặt giao diện"
          >
            <Sliders className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 text-accent" />
          </button>

          {/* Primary CTA */}
          <a
            ref={ctaRef}
            href="#gallery-section"
            data-cursor="KHÁM PHÁ"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-accent hover:bg-accent-hover text-white transition-all shadow-sm active:scale-95 group"
          >
            <span>Khám phá</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
