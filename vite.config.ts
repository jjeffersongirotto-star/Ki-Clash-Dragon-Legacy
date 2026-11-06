import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const version: string = pkg.version;
/** v0.64.0: versão mínima do app instalado (APK/instalador) que aceita esta atualização automática. Suba só quando mudar a parte nativa. */
const minNative: string = pkg.kiclash?.minNative ?? version;

const walk = (dir: string): string[] => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));

// GitHub Pages serve o site em /Ki-Clash-Dragon-Legacy/
export default defineConfig({
  base: './',
  // v0.19.0: versão do jogo no código (botão ⟳ de atualização) e em dist/version.json (o site compara as duas)
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [
    {
      name: 'version-json',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version, minNative }) });
      },
    },
    {
      // v0.64.0: lista dos arquivos do jogo com o SHA-256 de cada um — o app instalado baixa só os que mudaram
      name: 'ota-manifest',
      apply: 'build',
      closeBundle() {
        const out = resolve('dist');
        const files = walk(out)
          .map((f) => relative(out, f).split('\\').join('/'))
          .filter((f) => f !== 'ota-manifest.json')
          .sort()
          .map((f) => ({ file_name: f, file_hash: createHash('sha256').update(readFileSync(join(out, f))).digest('hex') }));
        writeFileSync(join(out, 'ota-manifest.json'), JSON.stringify({ version, minNative, files }));
      },
    },
  ],
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
