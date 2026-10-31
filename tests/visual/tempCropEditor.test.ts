// TEMP v0.54.0 — apagar junto com src/app/tempProfileCropEditor.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('TEMP editor do recorte da foto de perfil', () => {
  const src = readFileSync('src/app/tempProfileCropEditor.ts', 'utf8');
  it('fica isolado, desligável e marcado como temporário', () => {
    expect(src).toContain('export const TEMP_PROFILE_CROP_EDITOR = true;');
    expect(src).toContain('COMO REMOVER');
    expect(src).toMatch(/if \(!TEMP_PROFILE_CROP_EDITOR\) return \{\};/);
    const prof = readFileSync('src/app/profile.ts', 'utf8');
    expect(prof.split('\n').filter((l) => l.includes('tempProfileCropEditor') || l.includes('TempCropEditor') || l.includes('tempFaceUrl')).every((l) => l.includes('TEMP crop editor'))).toBe(true);
  });
  it('arrastar, pinça, salvar e exportar só os editados', () => {
    expect(src).toContain('pts.size >= 2');
    expect(src).toContain("addEventListener('wheel'");
    expect(src).toContain('data-tsave');
    expect(src).toMatch(/const c = tempCrops\(\);\n\s*const ids = Object\.keys\(c\);/);
    expect(src).toContain('cropsPython');
  });
});
