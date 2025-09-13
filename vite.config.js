import { defineConfig } from "vite";

/** @type {import('vite').UserConfig} */
export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "index.html",
        play: "pages/play.html",
        new: "pages/new.html",
        edit: "pages/edit.html",
      },
    },
    copyPublicDir: true,
  },
  server: {
    open: true,
    host: true,
    port: 3000,
  },
  publicDir: "src",
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
