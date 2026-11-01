import { describe, expect, it, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { CHAR_BY_ID } from '../../src/core/characters';
import { waitFor } from '../../src/core/battle';
import { applyEdits, exportJSON, TEMP_CARD_BALANCE_EDITOR } from '../../src/app/tempCardBalanceEditor';

const mem: Record<string, string> = {};
beforeEach(() => {
  (globalThis as any).localStorage = { getItem: (k: string) => mem[k] ?? null, setItem: (k: string, v: string) => (mem[k] = v), removeItem: (k: string) => delete mem[k] };
});

describe('v0.56.0 editor temporário de balanceamento', () => {
  it('ligado nesta versão (fácil de desligar)', () => expect(TEMP_CARD_BALANCE_EDITOR).toBe(true));
  it('aplica ATQ/Vida/espera e volta ao original ao restaurar', () => {
    const id = Object.keys(CHAR_BY_ID)[0];
    const atk = CHAR_BY_ID[id].atk;
    const w = waitFor(id);
    applyEdits({ [id]: { atk: 99, hp: 77, wait: 9, abilities: ['nova coisa'] } });
    expect(CHAR_BY_ID[id].atk).toBe(99);
    expect(CHAR_BY_ID[id].hp).toBe(77);
    expect(waitFor(id)).toBe(9);
    expect(CHAR_BY_ID[id].abilities).toEqual([]);
    expect(JSON.parse(exportJSON({ [id]: { atk: 99 } }))[id].atk).toBe(99);
    applyEdits({});
    expect(CHAR_BY_ID[id].atk).toBe(atk);
    expect(waitFor(id)).toBe(w);
  });
});

describe('v0.56.0 login, dica e gotas', () => {
  it('jogo abre na tela de login e Sair volta para ela', () => {
    expect(readFileSync('src/main.ts', 'utf8')).toContain('loginScreen();');
    expect(readFileSync('src/app/profile.ts', 'utf8')).toContain('exitToLogin()');
    const l = readFileSync('src/app/login.ts', 'utf8');
    expect(l).toContain('id="lgEye"');
    expect(l).toContain('id="lgSave"');
  });
  it('dica com faixa nunca cai sobre a mão', () => {
    const s = readFileSync('src/ui/spotlight.ts', 'utf8');
    expect(s).toContain('const useStrip = !!opts.strip;');
    expect(readFileSync('src/app/tutorial.ts', 'utf8')).toContain("root.querySelector('.board-wrap')");
  });
  it('gota sem ::before (igual na carta assada e na viva)', () => {
    expect(readFileSync('src/ui/style.css', 'utf8')).not.toContain('.ck-cost::before');
  });
});
