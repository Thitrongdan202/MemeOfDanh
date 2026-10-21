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
          bg: "var(--bg)",
          surface: "var(--surface)",
          muted: "var(--surface-muted)",
          border: "var(--border)",
          borderDark: "var(--border-dark)",
          text: "var(--text)",
          secondary: "var(--text-secondary)",
          subtle: "var(--text-subtle)",
          dark: "var(--dark-accent)",
        },
        accent: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-hover)",
          light: "var(--accent-light)",
          border: "var(--accent-border)",
        },
        cobalt: {
          DEFAULT: "#4056E8",
          hover: "#3144C7",
          light: "#EEF1FD",
          border: "#BAC4F8",
        },
        coral: {
          DEFAULT: "#EE684A",
          hover: "#D85335",
          light: "#FDF1EE",
          border: "#F7BEB1",
        },
      },
      fontFamily: {
        sans: ["'Be Vietnam Pro'", "-apple-system", "BlinkMacSystemFont", "Arial", "sans-serif"],
        serif: ["'Noto Serif'", "Georgia", "Cambria", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 2px 8px -2px rgba(32, 33, 39, 0.05), 0 1px 3px rgba(32, 33, 39, 0.04)",
        cardHover: "0 14px 30px -6px rgba(32, 33, 39, 0.12), 0 4px 12px -2px rgba(32, 33, 39, 0.06)",
        modal: "0 24px 48px -12px rgba(32, 33, 39, 0.25), 0 8px 16px -4px rgba(32, 33, 39, 0.1)",
      },
      borderRadius: {
        editorial: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
