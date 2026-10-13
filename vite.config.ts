import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Relative Pfade: läuft so auch unter https://<name>.github.io/<repo>/
  base: "./",
  plugins: [react(), tailwindcss()],
});
