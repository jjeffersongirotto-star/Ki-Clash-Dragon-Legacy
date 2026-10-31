import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { DISMISS_LABELS } from '../../src/ui/dialog';

const dialog = readFileSync('src/ui/dialog.ts', 'utf8');
const ui = readFileSync('src/app/ui.ts', 'utf8');

describe('v0.52.0 janelas fecham pelo ✕ do canto', () => {
  it('botões que só fecham viram o ✕ (que devolve o mesmo valor)', () => {
    for (const l of ['Fechar', 'Entendi', 'OK', 'Cancelar']) expect(DISMISS_LABELS.has(l)).toBe(true);
    expect(DISMISS_LABELS.has('Comprar')).toBe(false);
    expect(dialog).toContain('class="dialog-x" data-dx');
    expect(dialog).toContain("close(xValue)");
    expect(dialog).toContain('buttons.length ?');
  });
  it('modais também ganham o ✕ do canto e escondem o botão Fechar/OK', () => {
    expect(ui).toContain('addCornerX(m)');
    expect(ui).toMatch(/dismiss\.hidden = true/);
  });
  it('Foto de perfil sem texto extra; Loja com banner na primeira tela; rostos com corte justo', () => {
    expect(readFileSync('src/app/profile.ts', 'utf8')).not.toContain('Cada personagem novo que você ganhar libera');
    expect(readFileSync('src/ui/style.css', 'utf8')).toMatch(/\.shop-screen \.banner-box \{[^}]*min-height: calc\(100dvh/);
    const py = readFileSync('scripts/art/build_thumbs.py', 'utf8');
    expect(py).toContain("'nara': (");
  });
});
