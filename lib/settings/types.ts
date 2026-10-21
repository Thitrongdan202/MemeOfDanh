export type ThemeMode = "light" | "dark" | "system";

export type AccentColor =
  | "cobalt"
  | "violet"
  | "emerald"
  | "coral"
  | "amber"
  | "monochrome";

export type UIDensity = "comfortable" | "balanced" | "compact";

export type FontScale = "small" | "default" | "large";

export type GalleryLayoutMode = "masonry" | "grid";

export type MotionIntensity = "subtle" | "expressive" | "cinematic";

export interface MuseumSettings {
  // 1. Appearance
  theme: ThemeMode;
  accentColor: AccentColor;
  uiDensity: UIDensity;
  fontScale: FontScale;
  galleryLayout: GalleryLayoutMode;
  gridColumns: number; // 2, 3, 4
  showCaptions: boolean;
  showMetadata: boolean;
  showArtworkIndex: boolean;
  showHoverOverlay: boolean;

  // 2. Motion & Effects
  motionIntensity: MotionIntensity;
  pageTransitions: boolean;
  scrollReveal: boolean;
  hoverZoom: boolean;
  cardTilt: boolean;
  magneticButtons: boolean;
  customCursor: boolean;
  backgroundEffects: boolean;
  reducedMotion: boolean;

  // 3. Preferences
  soundEffects: boolean;
}

export const DEFAULT_SETTINGS: MuseumSettings = {
  theme: "light",
  accentColor: "cobalt",
  uiDensity: "balanced",
  fontScale: "default",
  galleryLayout: "masonry",
  gridColumns: 3,
  showCaptions: true,
  showMetadata: true,
  showArtworkIndex: true,
  showHoverOverlay: true,

  motionIntensity: "expressive",
  pageTransitions: true,
  scrollReveal: true,
  hoverZoom: true,
  cardTilt: true,
  magneticButtons: true,
  customCursor: true,
  backgroundEffects: true,
  reducedMotion: false,

  soundEffects: false,
};
