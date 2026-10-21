import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoString;
  }
}

/**
 * Returns a deterministic stylish accent color derived from a string (hash or id).
 */
export function getAmbientGlow(seed: string): { glow: string; border: string; text: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const accents = [
    { glow: "rgba(212, 255, 50, 0.12)", border: "rgba(212, 255, 50, 0.35)", text: "#d4ff32" }, // acid lime
    { glow: "rgba(255, 77, 54, 0.12)", border: "rgba(255, 77, 54, 0.35)", text: "#ff4d36" },   // vermilion
    { glow: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.35)", text: "#60a5fa" }, // cobalt
    { glow: "rgba(234, 179, 8, 0.12)", border: "rgba(234, 179, 8, 0.35)", text: "#facc15" },   // amber
    { glow: "rgba(168, 85, 247, 0.12)", border: "rgba(168, 85, 247, 0.35)", text: "#c084fc" }, // amethyst
    { glow: "rgba(20, 184, 166, 0.12)", border: "rgba(20, 184, 166, 0.35)", text: "#2dd4bf" }, // emerald teal
  ];
  const index = Math.abs(hash) % accents.length;
  return accents[index];
}
