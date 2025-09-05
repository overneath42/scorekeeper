import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "index.html",
        about: "about.html",
        contact: "contact.html",
        games: "games.html",
        gameDetail: "game-detail.html",
      },
    },
    copyPublicDir: true,
  },
  server: {
    open: true,
    port: 3000,
  },
  publicDir: "src",
});
