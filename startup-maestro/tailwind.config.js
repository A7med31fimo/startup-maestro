/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
      },
      colors: {
        surface: {
          50:  "#f8f8fc",
          100: "#f0f0f8",
          200: "#e2e2ef",
          800: "#16161f",
          850: "#111118",
          900: "#0c0c12",
          950: "#08080e",
        },
        accent: {
          DEFAULT: "#7c5cfc",
          dim:     "#5a3fd4",
          glow:    "#a07dff",
          muted:   "#3d2a8a",
        },
        emerald: {
          400: "#34d399",
          500: "#10b981",
        },
        amber: {
          400: "#fbbf24",
        },
        rose: {
          400: "#fb7185",
          500: "#f43f5e",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "glow-accent": "0 0 20px rgba(124, 92, 252, 0.3)",
        "glow-green":  "0 0 20px rgba(52, 211, 153, 0.2)",
        "card": "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
      },
    },
  },
  plugins: [],
};
