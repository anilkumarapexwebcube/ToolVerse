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
          bg: "#e9ecf2",        // cool titanium porcelain
          surface: "#ffffff",
          "surface-2": "#f3f6fb",
          border: "#dce2ec",    // cool hairline
          line: "#dce2ec",
          text: "#10141c",      // cool graphite ink
          muted: "#626c7e",     // cool slate
          gold: "#c9a84c",
          "gold-lite": "#f2d67e",
          "gold-deep": "#9a7b2c",
          "gold-dim": "#41300c",
          ink: "#0c0f16",       // dark console
          "ink-2": "#141a26",
          accent: "#37506c",    // structural steel (secondary, not a competing accent)
        },
      },
      fontFamily: {
        grotesk: ["Sora", "Space Grotesk", "sans-serif"],
        sora:    ["Sora", "sans-serif"],
        inter:   ["Inter", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "card": "inset 0 1px 0 rgba(255,255,255,0.85), 0 1px 2px rgba(16,20,28,0.04), 0 12px 28px -14px rgba(16,20,28,0.16)",
        "card-hover": "inset 0 1px 0 rgba(255,255,255,0.9), 0 18px 42px -18px rgba(16,20,28,0.26), 0 0 0 1px rgba(201,168,76,0.35)",
        "glow": "0 0 24px rgba(201, 168, 76, 0.18)",
        "gold": "0 8px 20px -8px rgba(201,168,76,0.55)",
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(180deg, #f2d67e, #c9a84c 45%, #9a7b2c)",
        "gradient-accent": "linear-gradient(135deg, #37506c, #22304a)",
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
