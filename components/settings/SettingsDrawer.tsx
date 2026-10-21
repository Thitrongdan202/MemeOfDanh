"use client";

import React, { useState } from "react";
import { useSettings } from "@/lib/settings/SettingsContext";
import {
  ACCENT_PRESETS,
  MOTION_INTENSITIES,
  UI_DENSITIES,
  FONT_SCALES,
} from "@/lib/settings/constants";
import {
  AccentColor,
  ThemeMode,
  MotionIntensity,
  UIDensity,
  FontScale,
  GalleryLayoutMode,
} from "@/lib/settings/types";
import { Toggle } from "../ui/Toggle";
import {
  X,
  Sliders,
  Sparkles,
  Palette,
  Volume2,
  VolumeX,
  RotateCcw,
  Sun,
  Moon,
  Laptop,
  Check,
  LayoutGrid,
  Columns,
  Eye,
  Zap,
} from "lucide-react";

export function SettingsDrawer() {
  const {
    settings,
    isSettingsOpen,
    setIsSettingsOpen,
    updateSettings,
    resetSettings,
    playSound,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<"appearance" | "motion" | "preferences">(
    "appearance"
  );

  if (!isSettingsOpen) return null;

  const handleClose = () => {
    playSound("click");
    setIsSettingsOpen(false);
  };

  const handleReset = () => {
    playSound("pop");
    resetSettings();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-museum-text/40 backdrop-blur-sm transition-all duration-300">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={handleClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md h-full bg-museum-surface border-l border-museum-border shadow-modal flex flex-col justify-between z-10 overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-museum-border flex items-center justify-between bg-museum-surface">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-accent-light text-accent">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-museum-text">
                Tùy chỉnh giao diện
              </h3>
              <p className="text-[11px] text-museum-subtle">
                Personalization & Motion Studio
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-museum-secondary hover:text-museum-text hover:bg-museum-muted border border-transparent hover:border-museum-border transition-colors"
            title="Đóng (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-4 pt-2 border-b border-museum-border bg-museum-muted/40 text-xs font-semibold">
          <button
            onClick={() => {
              playSound("pop");
              setActiveTab("appearance");
            }}
            className={`pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === "appearance"
                ? "border-accent text-accent"
                : "border-transparent text-museum-secondary hover:text-museum-text"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Giao diện</span>
          </button>

          <button
            onClick={() => {
              playSound("pop");
              setActiveTab("motion");
            }}
            className={`pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === "motion"
                ? "border-accent text-accent"
                : "border-transparent text-museum-secondary hover:text-museum-text"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Chuyển động</span>
          </button>

          <button
            onClick={() => {
              playSound("pop");
              setActiveTab("preferences");
            }}
            className={`pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === "preferences"
                ? "border-accent text-accent"
                : "border-transparent text-museum-secondary hover:text-museum-text"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Tùy chọn</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 p-5 space-y-6 overflow-y-auto">
          {/* TAB 1: APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              {/* Theme Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-museum-text block">
                  Chế độ hiển thị (Theme)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        playSound("click");
                        updateSettings({ theme: mode });
                      }}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center space-y-1.5 transition-all ${
                        settings.theme === mode
                          ? "border-accent bg-accent-light text-accent font-semibold shadow-sm"
                          : "border-museum-border bg-museum-surface text-museum-secondary hover:text-museum-text"
                      }`}
                    >
                      {mode === "light" && <Sun className="w-4 h-4" />}
                      {mode === "dark" && <Moon className="w-4 h-4" />}
                      {mode === "system" && <Laptop className="w-4 h-4" />}
                      <span className="capitalize">
                        {mode === "light"
                          ? "Sáng"
                          : mode === "dark"
                          ? "Tối"
                          : "Hệ thống"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-museum-text block">
                  Màu sắc điểm nhấn (Accent Color)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(ACCENT_PRESETS).map((accent) => (
                    <button
                      key={accent.id}
                      onClick={() => {
                        playSound("pop");
                        updateSettings({ accentColor: accent.id });
                      }}
                      className={`p-2 rounded-lg border text-left flex items-center space-x-2 transition-all ${
                        settings.accentColor === accent.id
                          ? "border-accent bg-accent-light shadow-sm"
                          : "border-museum-border bg-museum-surface hover:border-museum-borderDark"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: accent.primary }}
                      />
                      <span className="text-[11px] font-medium text-museum-text truncate">
                        {accent.label.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gallery Layout Mode */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-museum-text block">
                  Bố cục triển lãm (Gallery Grid)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      playSound("click");
                      updateSettings({ galleryLayout: "masonry" });
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center space-x-2 transition-all ${
                      settings.galleryLayout === "masonry"
                        ? "border-accent bg-accent-light text-accent font-semibold"
                        : "border-museum-border text-museum-secondary hover:text-museum-text"
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Masonry nghệ thuật</span>
                  </button>

                  <button
                    onClick={() => {
                      playSound("click");
                      updateSettings({ galleryLayout: "grid" });
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center space-x-2 transition-all ${
                      settings.galleryLayout === "grid"
                        ? "border-accent bg-accent-light text-accent font-semibold"
                        : "border-museum-border text-museum-secondary hover:text-museum-text"
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Lưới đồng đều</span>
                  </button>
                </div>
              </div>

              {/* Typography Scale */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-museum-text block">
                  Cỡ chữ giao diện (Typography Scale)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["small", "default", "large"] as FontScale[]).map((scale) => (
                    <button
                      key={scale}
                      onClick={() => {
                        playSound("click");
                        updateSettings({ fontScale: scale });
                      }}
                      className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                        settings.fontScale === scale
                          ? "border-accent bg-accent-light text-accent font-semibold"
                          : "border-museum-border text-museum-secondary hover:text-museum-text"
                      }`}
                    >
                      {FONT_SCALES[scale].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* UI Density */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-museum-text block">
                  Mật độ khoảng cách (UI Density)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["comfortable", "balanced", "compact"] as UIDensity[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        playSound("click");
                        updateSettings({ uiDensity: d });
                      }}
                      className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                        settings.uiDensity === d
                          ? "border-accent bg-accent-light text-accent font-semibold"
                          : "border-museum-border text-museum-secondary hover:text-museum-text"
                      }`}
                    >
                      {UI_DENSITIES[d].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOTION & EFFECTS */}
          {activeTab === "motion" && (
            <div className="space-y-5">
              {/* Motion Intensity (3 Levels) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-museum-text block">
                  Cường độ chuyển động (Motion Intensity)
                </label>
                <div className="space-y-2">
                  {(["subtle", "expressive", "cinematic"] as MotionIntensity[]).map(
                    (level) => (
                      <div
                        key={level}
                        onClick={() => {
                          playSound("pop");
                          updateSettings({ motionIntensity: level });
                        }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          settings.motionIntensity === level
                            ? "border-accent bg-accent-light shadow-sm"
                            : "border-museum-border bg-museum-surface hover:border-museum-borderDark"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-museum-text">
                            {MOTION_INTENSITIES[level].label}
                          </span>
                          {settings.motionIntensity === level && (
                            <Check className="w-3.5 h-3.5 text-accent" />
                          )}
                        </div>
                        <p className="text-[11px] text-museum-subtle mt-0.5">
                          {MOTION_INTENSITIES[level].desc}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Motion Feature Toggles */}
              <div className="pt-2 border-t border-museum-border space-y-3">
                <Toggle
                  checked={settings.cardTilt}
                  onChange={(val) => updateSettings({ cardTilt: val })}
                  label="Hiệu ứng nghiêng 3D (Card Tilt)"
                  description="Thẻ tác phẩm xoay nhẹ theo góc di chuột"
                />

                <Toggle
                  checked={settings.hoverZoom}
                  onChange={(val) => updateSettings({ hoverZoom: val })}
                  label="Phóng to ảnh khi rê chuột (Hover Zoom)"
                  description="Thu phóng nhẹ ảnh tác phẩm khi di chuột"
                />

                <Toggle
                  checked={settings.magneticButtons}
                  onChange={(val) => updateSettings({ magneticButtons: val })}
                  label="Nút hít nam châm (Magnetic Buttons)"
                  description="Các nút CTA chính hút nhẹ về phía con trỏ"
                />

                <Toggle
                  checked={settings.customCursor}
                  onChange={(val) => updateSettings({ customCursor: val })}
                  label="Con trỏ tương tác (Custom Cursor)"
                  description="Hiển thị vòng tròn kèm nhãn trạng thái (Desktop)"
                />

                <Toggle
                  checked={settings.backgroundEffects}
                  onChange={(val) => updateSettings({ backgroundEffects: val })}
                  label="Hiệu ứng đèn rọi nền (Ambient Spotlight)"
                  description="Vùng ánh sáng nhẹ chuyển động theo chuột"
                />

                <Toggle
                  checked={settings.reducedMotion}
                  onChange={(val) => updateSettings({ reducedMotion: val })}
                  label="Giảm chuyển động (Reduced Motion)"
                  description="Tắt toàn bộ hiệu ứng nặng để ưu tiên tốc độ"
                />
              </div>
            </div>
          )}

          {/* TAB 3: PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Toggle
                  checked={settings.showCaptions}
                  onChange={(val) => updateSettings({ showCaptions: val })}
                  label="Hiển thị lời bình trên thẻ (Captions)"
                  description="Xem trước bình luận của AI ngay trên lưới ảnh"
                />

                <Toggle
                  checked={settings.showMetadata}
                  onChange={(val) => updateSettings({ showMetadata: val })}
                  label="Hiển thị thông số tệp (Metadata)"
                  description="Hiển thị tên tệp và định dạng ảnh trên thẻ"
                />

                <Toggle
                  checked={settings.showArtworkIndex}
                  onChange={(val) => updateSettings({ showArtworkIndex: val })}
                  label="Hiển thị mã hồ sơ (Catalog ID)"
                  description="Hiển thị mã DANH-XXX trên góc thẻ"
                />

                <Toggle
                  checked={settings.showHoverOverlay}
                  onChange={(val) => updateSettings({ showHoverOverlay: val })}
                  label="Lớp phủ khi rê chuột (Hover Overlay)"
                  description="Hiển thị gradient và nút phóng to khi hover"
                />
              </div>

              {/* Sound Effects */}
              <div className="pt-3 border-t border-museum-border">
                <Toggle
                  checked={settings.soundEffects}
                  onChange={(val) => updateSettings({ soundEffects: val })}
                  label="Âm thanh tương tác (UI Sound Effects)"
                  description="Phát âm thanh nhẹ khi bấm nút, thả tim và chuyển tab"
                />
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-museum-border bg-museum-surface flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-museum-secondary hover:text-museum-text hover:bg-museum-muted border border-museum-border transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>

          <button
            onClick={handleClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-accent hover:bg-accent-hover text-white transition-colors shadow-sm"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
