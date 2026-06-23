import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/upscale": {
        target: "https://vgupscale-production.up.railway.app",
        changeOrigin: true,
      },
    },
  },
});
