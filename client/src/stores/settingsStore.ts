import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type MotionLevel = 'full' | 'reduced' | 'off';
export type LayoutDensity = 'comfortable' | 'compact' | 'spacious';

interface SettingsState {
  theme: Theme;
  motionLevel: MotionLevel;
  layoutDensity: LayoutDensity;
  galleryColumns: number; // 0 = auto
  accentColor: string;
  // actions
  setTheme: (t: Theme) => void;
  setMotionLevel: (m: MotionLevel) => void;
  setLayoutDensity: (d: LayoutDensity) => void;
  setGalleryColumns: (n: number) => void;
  setAccentColor: (c: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      motionLevel: 'full',
      layoutDensity: 'comfortable',
      galleryColumns: 0,
      accentColor: '#C8691F',
      setTheme: (theme) => set({ theme }),
      setMotionLevel: (motionLevel) => set({ motionLevel }),
      setLayoutDensity: (layoutDensity) => set({ layoutDensity }),
      setGalleryColumns: (galleryColumns) => set({ galleryColumns }),
      setAccentColor: (accentColor) => set({ accentColor }),
    }),
    { name: 'danhmus-settings' }
  )
);
