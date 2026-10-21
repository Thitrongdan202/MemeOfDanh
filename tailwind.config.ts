import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        museum: {
          bg: "#F5F2EA",        // Main background: warm paper ivory
          surface: "#FFFEFA",   // Primary surface: clean gallery white
          muted: "#ECE8DE",     // Secondary surface / neutral warm
          border: "#DDD9CE",    // Border: crisp warm outline
          borderDark: "#C7C2B4",// Darker border for hover / focus
          text: "#202127",      // Primary text: graphite charcoal
          secondary: "#686A73", // Secondary text: slate gray
          subtle: "#83848A",    // Muted text: cool gray
          dark: "#1A1B20",      // Dark accent container
        },
        cobalt: {
          DEFAULT: "#4056E8",   // Primary accent: electric cobalt
          hover: "#3144C7",
          light: "#EEF1FD",
          border: "#BAC4F8",
        },
        coral: {
          DEFAULT: "#EE684A",   // Secondary accent: warm coral / vermilion
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
        cardHover: "0 12px 28px -6px rgba(32, 33, 39, 0.1), 0 4px 10px -2px rgba(32, 33, 39, 0.04)",
        modal: "0 24px 48px -12px rgba(32, 33, 39, 0.2), 0 8px 16px -4px rgba(32, 33, 39, 0.1)",
      },
      borderRadius: {
        editorial: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
