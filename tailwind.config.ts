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
        theme: {
          bg: "#f8fafc",        // slate-50
          surface: "#ffffff",
          border: "#e2e8f0",    // slate-200
          text: "#0f172a",      // slate-900
          muted: "#64748b",     // slate-500
          gold: "#c9a84c",      // from user's code
          "gold-dim": "#41300c",
          accent: "#4f46e5",    // indigo-600
        },
      },
      fontFamily: {
        grotesk: ["Space Grotesk", "sans-serif"],
        inter:   ["Inter", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "card": "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        "card-hover": "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
        "glow": "0 0 20px rgba(201, 168, 76, 0.15)",
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #c9a84c, #8a7333)",
        "gradient-accent": "linear-gradient(135deg, #4f46e5, #3b82f6)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "fade-in": "fadeIn 0.4s ease-out both",
        "fade-up": "fadeUp 0.5s ease-out both",
        "pulse-gold": "pulseGold 2s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        }
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
