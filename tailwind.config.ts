import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0A0A0A",
        surface: "#141414",
        elevated: "#1F1F1F",
        elevated2: "#2A2A2A",
        prime: {
          DEFAULT: "#E4142D",
          dark: "#B10F22",
          light: "#FF3B52",
        },
        gold: {
          DEFAULT: "#C9A227",
          light: "#E4C455",
        },
        bone: "#F5F5F0",
        mist: "#A3A3A0",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      backgroundImage: {
        "fade-up": "linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0.85) 15%, rgba(10,10,10,0.3) 50%, transparent 100%)",
        "fade-side": "linear-gradient(to right, #0A0A0A 0%, rgba(10,10,10,0.6) 30%, transparent 70%)",
        "film-strip": "repeating-linear-gradient(90deg, #2A2A2A 0px, #2A2A2A 8px, transparent 8px, transparent 16px)",
      },
      keyframes: {
        kenburns: {
          "0%": { transform: "scale(1.0)" },
          "100%": { transform: "scale(1.08)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        kenburns: "kenburns 20s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
