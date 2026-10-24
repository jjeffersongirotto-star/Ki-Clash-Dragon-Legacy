import { defineConfig } from 'vite';

// GitHub Pages serve o site em /Ki-Clash-Dragon-Legacy/
export default defineConfig({
  base: './',
  test: {
    include: ['tests/**/*.test.ts'],
  },
} as any);
