import { defineConfig } from 'vite';

// Project root is `src/` so Vite finds `src/index.html` during dev and build
export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
