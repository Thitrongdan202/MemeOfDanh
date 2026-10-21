import { AccentColor, MotionIntensity, UIDensity, FontScale } from "./types";

export interface AccentDefinition {
  id: AccentColor;
  label: string;
  primary: string;
  hover: string;
  light: string;
  border: string;
  darkLight: string;
  darkBorder: string;
}

export const ACCENT_PRESETS: Record<AccentColor, AccentDefinition> = {
  cobalt: {
    id: "cobalt",
    label: "Cobalt Blue",
    primary: "#4056E8",
    hover: "#3144C7",
    light: "#EEF1FD",
    border: "#BAC4F8",
    darkLight: "#18224C",
    darkBorder: "#2E3B7D",
  },
  violet: {
    id: "violet",
    label: "Royal Violet",
    primary: "#7C3AED",
    hover: "#6D28D9",
    light: "#F5F3FF",
    border: "#DDD6FE",
    darkLight: "#2E1557",
    darkBorder: "#4C248B",
  },
  emerald: {
    id: "emerald",
    label: "Emerald Green",
    primary: "#059669",
    hover: "#047857",
    light: "#ECFDF5",
    border: "#A7F3D0",
    darkLight: "#0B3828",
    darkBorder: "#145A42",
  },
  coral: {
    id: "coral",
    label: "Coral Vermilion",
    primary: "#EE684A",
    hover: "#D85335",
    light: "#FDF1EE",
    border: "#F7BEB1",
    darkLight: "#3B1812",
    darkBorder: "#682D23",
  },
  amber: {
    id: "amber",
    label: "Warm Amber",
    primary: "#D97706",
    hover: "#B45309",
    light: "#FEF3C7",
    border: "#FDE68A",
    darkLight: "#382305",
    darkBorder: "#633E09",
  },
  monochrome: {
    id: "monochrome",
    label: "Monochrome Noir",
    primary: "#202127",
    hover: "#111317",
    light: "#F2F4F7",
    border: "#D0D5DD",
    darkLight: "#252A36",
    darkBorder: "#3E465B",
  },
};

export const MOTION_INTENSITIES: Record<
  MotionIntensity,
  { label: string; desc: string; multiplier: number }
> = {
  subtle: {
    label: "Tinh tế (Subtle)",
    desc: "Chuyển động nhẹ nhàng, tối giản thời gian chờ",
    multiplier: 0.6,
  },
  expressive: {
    label: "Biểu cảm (Expressive)",
    desc: "Đầy đủ hiệu ứng, tương tác sống động tự nhiên",
    multiplier: 1.0,
  },
  cinematic: {
    label: "Điện ảnh (Cinematic)",
    desc: "Chuyển cảnh ấn tượng, chiều sâu thị giác tối đa",
    multiplier: 1.5,
  },
};

export const UI_DENSITIES: Record<UIDensity, { label: string; paddingClass: string }> = {
  comfortable: { label: "Thư thả", paddingClass: "py-6 sm:py-8" },
  balanced: { label: "Tiêu chuẩn", paddingClass: "py-4 sm:py-6" },
  compact: { label: "Gọn gàng", paddingClass: "py-2 sm:py-3" },
};

export const FONT_SCALES: Record<FontScale, { label: string; rootSize: string }> = {
  small: { label: "Nhỏ (90%)", rootSize: "92%" },
  default: { label: "Chuẩn (100%)", rootSize: "100%" },
  large: { label: "Lớn (110%)", rootSize: "108%" },
};
