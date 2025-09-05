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
    },
  },
  plugins: [],
};
