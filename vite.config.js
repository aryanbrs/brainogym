import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        courses: resolve(__dirname, "courses.html"),
        gallery: resolve(__dirname, "gallery.html"),
        contact: resolve(__dirname, "contact.html"),
        abacusGame: resolve(__dirname, "abacus-game.html"),
        abacusGuru: resolve(__dirname, "abacus-guru.html"),
        vedicMathsGuru: resolve(__dirname, "vedic-maths-guru.html"),
        robotics: resolve(__dirname, "robotics-for-kids.html"),
        personality: resolve(__dirname, "personality-development.html"),
        resultRedirect: resolve(__dirname, "result.html"),
      },
    },
  },
});
