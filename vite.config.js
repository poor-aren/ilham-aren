import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  // .glb bisa juga di-import langsung bila diperlukan (di sini kita muat dari /public)
  assetsInclude: ['**/*.glb'],
  build: {
    rollupOptions: {
      // 4 pintu masuk (semua memuat mesin SPA yang sama, beda titik mulai halaman)
      input: {
        main: resolve(__dirname, 'index.html'),
        aboutMe: resolve(__dirname, 'about-me.html'),
        project: resolve(__dirname, 'project.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
});
