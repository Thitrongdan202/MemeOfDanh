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
 * Remove Vietnamese accents for smart, accent-insensitive search.
 * e.g., "Phòng tập" -> "phong tap", "Đang tập" -> "dang tap"
 */
export function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

/**
 * Returns a delicate editorial accent tag style based on hash/seed.
 */
export function getEditorialAccent(seed: string): { bg: string; text: string; border: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const accents = [
    { bg: "#EEF1FD", text: "#4056E8", border: "#BAC4F8" }, // Cobalt
    { bg: "#FDF1EE", text: "#D85335", border: "#F7BEB1" }, // Coral
    { bg: "#F2F4F7", text: "#344054", border: "#D0D5DD" }, // Slate
    { bg: "#FEF6EE", text: "#B54708", border: "#F9DBAF" }, // Warm Amber
    { bg: "#ECFDF3", text: "#027A48", border: "#A6F4C5" }, // Forest Green
  ];
  return accents[Math.abs(hash) % accents.length];
}
