import { defineConfig } from "vite";

/** @type {import('vite').UserConfig} */
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
        play: "play.html",
        new: "new.html",
        edit: "edit.html",
      },
    },
    copyPublicDir: true,
  },
  server: {
    open: true,
    port: 3000,
  },
  publicDir: "src",
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
