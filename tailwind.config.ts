import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        museum: {
          950: "#07080a",
          900: "#0c0e12",
          850: "#12151b",
          800: "#181d24",
          700: "#242a35",
          600: "#363e4e",
          500: "#525c70",
          400: "#838d9e",
          300: "#b5bdca",
          200: "#e0e4eb",
          100: "#f3f5f8",
        },
        ivory: {
          DEFAULT: "#f5f4ed",
          muted: "#d8d6cb",
          dark: "#a3a193",
        },
        lime: {
          accent: "#d4ff32",
          dim: "#a3cc18",
          glow: "rgba(212, 255, 50, 0.25)",
        },
        vermilion: {
          DEFAULT: "#ff4d36",
          subtle: "rgba(255, 77, 54, 0.15)",
        },
      },
      fontFamily: {
        serif: ["var(--font-editorial)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ticker: "ticker 35s linear infinite",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
