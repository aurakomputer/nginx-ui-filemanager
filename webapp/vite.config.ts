// webapp/vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { nginxUiPlugin } from "@nginxui/plugin-sdk/vite";

export default defineConfig({
  plugins: [
    vue(),
    nginxUiPlugin({
      id: "io.github.aurakomputer.filemanager", // ← change to your real plugin id
    }),
  ],
});
