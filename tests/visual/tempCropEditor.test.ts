// TEMP — editor do recorte da foto de perfil: guardado no repositório, DESLIGADO e fora da tela (v0.54.1)
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('editor temporário do recorte (guardado, desligado)', () => {
  it('flag desligada e sem ligação na Foto de perfil', () => {
    expect(readFileSync('src/app/tempProfileCropEditor.ts', 'utf8')).toContain('export const TEMP_PROFILE_CROP_EDITOR = false;');
    const prof = readFileSync('src/app/profile.ts', 'utf8');
    expect(prof).not.toContain('tempProfileCropEditor');
    expect(prof).not.toContain('bindTempCropEditor');
    expect(prof).toContain("localStorage.removeItem('kiclash.tempProfileCrops')");
  });
  it('recortes do jogador entram no build (FACE_USER), Fen continua de pé', () => {
    const py = readFileSync('scripts/art/build_thumbs.py', 'utf8');
    expect(py).toContain('FACE = {**FACE_AUTO, **FACE, **FACE_FIX, **FACE_USER}');
    expect(py).toContain("'fen': (0.534, 0.605, 0.46, 'flip')");
    expect((py.split('FACE_USER = {')[1].split('}')[0].match(/'\w+': \(/g) ?? []).length).toBe(62);
  });
});
