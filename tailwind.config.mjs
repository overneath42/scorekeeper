import containerQueries from "@tailwindcss/container-queries";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./*.html", "./src/**/*.{js,ts,html}"],
  theme: {
    extend: {
      backgroundImage: {
        "natural-paper": "url('/src/assets/bg-natural-paper.png')",
      },
      fontFamily: {
        sans: ["Rethink Sans", "sans-serif"],
        cursive: ["Homemade Apple", "cursive"],
      },
      spacing: ({ theme }) => ({
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        "device-height": "100dvh",
        "safe-area-top": `max(env(safe-area-inset-top), 1rem)`,
        "safe-area-bottom": `max(env(safe-area-inset-bottom), 1rem)`,
      }),
      colors: {
        primary: {
          DEFAULT: "#2563EB", // Blue-600
          light: "#3B82F6", // Blue-500
          dark: "#1D4ED8", // Blue-700
        },
        secondary: {
          DEFAULT: "#10B981", // Green-500
          light: "#34D399", // Green-400
          dark: "#059669", // Green-600
        },
        gray: {
          light: "#F3F4F6", // Gray-100
          DEFAULT: "#6B7280", // Gray-500
          dark: "#374151", // Gray-700
        },
        success: {
          DEFAULT: "#22C55E", // Green-500
          light: "#4ADE80", // Green-400
          dark: "#16A34A", // Green-600
        },
        warning: {
          DEFAULT: "#F59E0B", // Amber-500
          light: "#fef3c7", // Amber-100
          dark: "#D97706", // Amber-600
        },
        error: {
          DEFAULT: "#EF4444", // Red-500
          light: "#F87171", // Red-400
          dark: "#DC2626", // Red-600
        },
      },
    },
  },
  plugins: [containerQueries],
};
