import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // .glb bisa juga di-import langsung bila diperlukan (di sini kita muat dari /public)
  assetsInclude: ['**/*.glb'],
});
