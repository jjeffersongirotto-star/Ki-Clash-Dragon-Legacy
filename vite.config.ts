import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// GitHub Pages serve o site em /Ki-Clash-Dragon-Legacy/
export default defineConfig({
  base: './',
  // v0.19.0: versão do jogo no código (botão ⟳ de atualização) e em dist/version.json (o site compara as duas)
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [
    {
      name: 'version-json',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version }) });
      },
    },
  ],
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
