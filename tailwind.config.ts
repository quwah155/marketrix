import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        chartreuse: {
          DEFAULT: "#e1ff51",
          dim: "#c8e63a",
          muted: "#a8c020",
          faint: "#e1ff5120",
          light: "#eeff80",
        },
        gunmetal: {
          DEFAULT: "#00272c",
          50:  "#e6f4f5",
          100: "#b3dce0",
          200: "#80c4cb",
          300: "#4dacb6",
          400: "#1a94a1",
          500: "#007c8c",
          600: "#006475",
          700: "#004d5e",
          800: "#003547",
          900: "#00272c",
          950: "#001518",
        },
        surface: {
          DEFAULT:          "#ffffff",
          secondary:        "#f4fafb",
          tertiary:         "#e8f5f7",
          dark:             "#00272c",
          "dark-secondary": "#003035",
          "dark-tertiary":  "#003d45",
        },
      },
      fontFamily: {
        sans:  ["var(--font-inter)",  "system-ui", "sans-serif"],
        mono:  ["var(--font-mono)",   "monospace"],
        grotesk: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in":   "fadeIn 0.3s ease-in-out",
        "slide-up":  "slideUp 0.3s ease-out",
        "slide-down":"slideDown 0.3s ease-out",
        "spin-slow": "spin 3s linear infinite",
        shimmer:     "shimmer 2s linear infinite",
        "pulse-glow":"pulseGlow 2s ease-in-out infinite",
        marquee:     "marquee 25s linear infinite",
        "float":     "float 6s ease-in-out infinite",
        "matrix-scan":"matrixScan 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { transform: "translateY(16px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        slideDown: { "0%": { transform: "translateY(-16px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        pulseGlow: { "0%, 100%": { boxShadow: "0 0 0 0 rgba(225,255,81,0.4)" }, "50%": { boxShadow: "0 0 0 10px rgba(225,255,81,0)" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        float:   { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-12px)" } },
        matrixScan: { "0%": { backgroundPosition: "0 0" }, "100%": { backgroundPosition: "0 100%" } },
      },
      boxShadow: {
        "brand-sm": "0 1px 3px 0 rgba(225,255,81,0.12)",
        brand:      "0 4px 16px 0 rgba(225,255,81,0.2)",
        "brand-lg": "0 8px 32px 0 rgba(225,255,81,0.3)",
        glass:      "0 4px 24px 0 rgba(0,0,0,0.25)",
        "glow-lime":"0 0 32px 0 rgba(225,255,81,0.45)",
        "card-dark":"0 2px 24px 0 rgba(0,0,0,0.4)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
