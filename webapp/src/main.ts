import { defineNginxUIPlugin, registerPlugin } from "@nginxui/plugin-sdk";
import FileManagerPage from "./FileManagerPage.vue";

registerPlugin(
  "io.github.aurakomputer.filemanager",
  defineNginxUIPlugin({
    setup(registry) {
      // Daftarkan rute, tambahkan entri "File Manager" di sidebar
      registry.registerRoute({
        path: "filemanager",
        component: FileManagerPage,
        meta: { title: "File Manager" },
      });
    },
    teardown() {
      // Bersihkan timer atau koneksi jika ada
    },
  }),
);
