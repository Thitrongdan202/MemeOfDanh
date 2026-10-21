"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useSettings } from "@/lib/settings/SettingsContext";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggleTheme, playSound } = useSettings();

  const handleToggle = () => {
    playSound("toggle");
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      data-cursor="THEME"
      title={resolvedTheme === "dark" ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
      className={`relative p-2 rounded-lg text-museum-secondary hover:text-museum-text hover:bg-museum-muted border border-museum-border transition-all duration-200 group active:scale-95 ${className}`}
      aria-label="Chuyển đổi giao diện sáng/tối"
    >
      <div className="relative w-4 h-4 overflow-hidden">
        <Sun
          className={`w-4 h-4 absolute inset-0 transition-transform duration-300 ${
            resolvedTheme === "dark"
              ? "rotate-0 scale-100 text-amber-400"
              : "-rotate-90 scale-0 text-museum-subtle"
          }`}
        />
        <Moon
          className={`w-4 h-4 absolute inset-0 transition-transform duration-300 ${
            resolvedTheme === "light"
              ? "rotate-0 scale-100 text-museum-text"
              : "rotate-90 scale-0 text-museum-subtle"
          }`}
        />
      </div>
    </button>
  );
}
