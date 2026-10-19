import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F4EB", // Warm vintage comic book newsprint paper
        surface: "#FFFFFF",
        "surface-alt": "#FFFDF8",
        ink: "#161716", // Solid comic black ink
        "ink-muted": "#525450",
        muted: "#666862",
        line: "#161716", // Comic panel border
        "line-light": "#E2DCD0",
        forest: {
          DEFAULT: "#1E5838",
          light: "#2B7A4F",
          soft: "#E2EFE7",
        },
        rust: {
          DEFAULT: "#C53B27",
          soft: "#FDECE9",
        },
        ochre: {
          DEFAULT: "#D97706",
          soft: "#FEF3C7",
        },
        caption: "#FEF9C3", // Classic comic caption box yellow
        comic: {
          yellow: "#FDE047",
          red: "#EF4444",
          blue: "#3B82F6",
          cream: "#FAF6ED",
        },
      },
      fontFamily: {
        comic: ["var(--font-geist-mono)", "Impact", "Arial Black", "sans-serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Menlo", "Courier New", "monospace"],
      },
      boxShadow: {
        comic: "3px 3px 0px #161716",
        "comic-md": "4px 4px 0px #161716",
        "comic-lg": "6px 6px 0px #161716",
        "comic-hover": "5px 5px 0px #161716",
      },
    },
  },
  plugins: [],
} satisfies Config;
