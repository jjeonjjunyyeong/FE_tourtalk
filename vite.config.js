import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080
  },
  // esbuild 설정 (필요한 경우)
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
});
