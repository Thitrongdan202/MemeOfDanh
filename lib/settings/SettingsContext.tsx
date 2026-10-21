"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { MuseumSettings, DEFAULT_SETTINGS, ThemeMode } from "./types";
import { ACCENT_PRESETS, FONT_SCALES } from "./constants";
import { playUISound } from "../sound";

const SETTINGS_STORAGE_KEY = "memeofdanh_settings_v2";

interface SettingsContextValue {
  settings: MuseumSettings;
  resolvedTheme: "light" | "dark";
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  updateSettings: (partial: Partial<MuseumSettings>) => void;
  resetSettings: () => void;
  toggleTheme: () => void;
  playSound: (type: "click" | "pop" | "heart" | "toggle" | "whoosh") => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<MuseumSettings>(DEFAULT_SETTINGS);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn("Could not load user settings:", e);
    }
    setMounted(true);
  }, []);

  // 2. Resolve Theme (Light, Dark, System)
  useEffect(() => {
    const applyResolved = () => {
      let active: "light" | "dark" = "light";
      if (settings.theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        active = prefersDark ? "dark" : "light";
      } else {
        active = settings.theme;
      }
      setResolvedTheme(active);

      // Apply root attributes
      const root = document.documentElement;
      if (active === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
      root.style.colorScheme = active;

      // Apply dynamic Accent Color CSS Variables
      const preset = ACCENT_PRESETS[settings.accentColor] || ACCENT_PRESETS.cobalt;
      root.style.setProperty("--accent-primary", preset.primary);
      root.style.setProperty("--accent-hover", preset.hover);
      root.style.setProperty(
        "--accent-light",
        active === "dark" ? preset.darkLight : preset.light
      );
      root.style.setProperty(
        "--accent-border",
        active === "dark" ? preset.darkBorder : preset.border
      );

      // Apply font scale & UI tokens
      const fontDef = FONT_SCALES[settings.fontScale] || FONT_SCALES.default;
      root.style.fontSize = fontDef.rootSize;

      root.setAttribute("data-motion", settings.motionIntensity);
      root.setAttribute("data-density", settings.uiDensity);
      root.setAttribute("data-reduced-motion", String(settings.reducedMotion));
    };

    applyResolved();

    if (settings.theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyResolved();
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [settings]);

  // Update helper
  const updateSettings = useCallback((partial: Partial<MuseumSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not persist settings:", err);
      }
      return updated;
    });
  }, []);

  // Reset helper
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (err) {
      console.warn("Could not reset settings:", err);
    }
  }, []);

  // Quick 1-click theme toggle
  const toggleTheme = useCallback(() => {
    setSettings((prev) => {
      const nextTheme: ThemeMode = prev.theme === "dark" ? "light" : "dark";
      const updated = { ...prev, theme: nextTheme };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Sound feedback helper
  const playSound = useCallback(
    (type: "click" | "pop" | "heart" | "toggle" | "whoosh") => {
      playUISound(type, settings.soundEffects);
    },
    [settings.soundEffects]
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        resolvedTheme,
        isSettingsOpen,
        setIsSettingsOpen,
        updateSettings,
        resetSettings,
        toggleTheme,
        playSound,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
