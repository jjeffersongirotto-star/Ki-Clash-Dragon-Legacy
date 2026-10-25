/// <reference types="vite/client" />
import { beforeEach, describe, expect, it } from 'vitest';
import { ABILITY_WEIGHT, POWER_SCALE, cardPower, deckPower } from '../src/core/power';
import { LEADERS, LEADER_HP, LEADER_THRESHOLDS, canEvolve, evolveLeader, getLeader, leaderHp, nextRequirement } from '../src/core/leaders';
import { PLAYABLE, STARTER_IDS, getChar } from '../src/core/characters';
import { STAGES, PLAYER_HERO_HP, enemyLeaderHp } from '../src/core/campaign';
import { statsFor } from '../src/core/progression';
import { defaultSave, loadSave, migrateV13 } from '../src/ui/save';
import battleSrc from '../src/ui/battleView.ts?raw';
import mainSrc from '../src/main.ts?raw';

const KEY = 'kicdl-save-v1';
const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage;
});

describe('v0.13 — Poder das cartas', () => {
  it('fórmula: 10 × peso da habilidade × √(ataque × vida)', () => {
    const def = getChar('riku');
    const st = statsFor(def, 1, 1, false);
    expect(cardPower({ charId: 'riku', level: 1, stars: 1 })).toBe(Math.round(POWER_SCALE * ABILITY_WEIGHT.riku * Math.sqrt(st.atk * st.hp)));
    expect(cardPower({ charId: 'riku', level: 1, stars: 1 })).toBe(44);
    expect(cardPower({ charId: 'toru', level: 1, stars: 1 })).toBe(47);
  });
  it('todo personagem jogável tem peso de habilidade, com média ~1', () => {
    for (const d of PLAYABLE) expect(ABILITY_WEIGHT[d.id], d.id).toBeGreaterThan(0.5);
    const ws = PLAYABLE.map((d) => ABILITY_WEIGHT[d.id]);
    expect(ws.reduce((a, b) => a + b, 0) / ws.length).toBeCloseTo(1, 1);
  });
  it('sobe com o nível, com o "+" e com a cor', () => {
    for (const d of PLAYABLE) {
      let prev = 0;
      for (let l = 1; l <= 10; l++) {
        const p = cardPower({ charId: d.id, level: l, stars: d.minStars });
        expect(p, `${d.id} nv${l}`).toBeGreaterThanOrEqual(prev);
        prev = p;
      }
      expect(cardPower({ charId: d.id, level: 10, stars: d.minStars, plus: true })).toBeGreaterThan(cardPower({ charId: d.id, level: 10, stars: d.minStars }));
      if (d.maxStars > d.minStars) expect(cardPower({ charId: d.id, level: 15, stars: d.minStars + 1 })).toBeGreaterThanOrEqual(cardPower({ charId: d.id, level: 15, stars: d.minStars, plus: true }));
      expect(cardPower({ charId: d.id, level: 30, stars: d.minStars })).toBeGreaterThan(cardPower({ charId: d.id, level: 1, stars: d.minStars }));
    }
  });
  it('habilidade mais forte = mais Poder com os mesmos status', () => {
    // Kenji tem o maior peso medido; Ren o menor
    const top = Object.entries(ABILITY_WEIGHT).sort((a, b) => b[1] - a[1]);
    expect(top[0][0]).toBe('kenji');
    expect(top[top.length - 1][0]).toBe('ren');
  });
  it('Poder do baralho = soma das 10 cartas', () => {
    const team = STARTER_IDS.slice(0, 10).map((id) => ({ charId: id, level: 1, stars: 1 }));
    expect(deckPower(team)).toBe(team.reduce((s, c) => s + cardPower(c), 0));
    expect(deckPower(team)).toBe(377);
    expect(deckPower(defaultSave().deck.map((id) => defaultSave().cards[id]))).toBe(377);
  });
});

describe('v0.13 — Líder', () => {
  const bar = getLeader('barbaro');
  it('Líderes são uma lista preparada para o futuro; só o Bárbaro disponível', () => {
    expect(LEADERS.filter((l) => l.available).map((l) => l.id)).toEqual(['barbaro']);
    for (const l of LEADERS) {
      expect(l.hpByLevel.length).toBe(l.thresholds.length);
      expect(Array.isArray(l.abilities)).toBe(true);
      expect(l.category).toBeTruthy();
      expect(l.art).toBeTruthy();
    }
    expect(getLeader('nao-existe').id).toBe('barbaro');
  });
  it('vida +10 por nível (20 → 110); nível 1 = vida antiga', () => {
    expect(LEADER_HP).toEqual([20, 30, 40, 50, 60, 70, 80, 90, 100, 110]);
    expect(leaderHp(bar, 1)).toBe(PLAYER_HERO_HP);
    expect(PLAYER_HERO_HP).toBe(20);
    expect(leaderHp(bar, 99)).toBe(110);
    expect(leaderHp(bar, 0)).toBe(20);
  });
  it('requisitos crescentes de Poder', () => {
    expect(LEADER_THRESHOLDS[0]).toBe(0);
    for (let i = 1; i < LEADER_THRESHOLDS.length; i++) expect(LEADER_THRESHOLDS[i]).toBeGreaterThan(LEADER_THRESHOLDS[i - 1]);
    expect(nextRequirement(bar, 1)).toBe(480);
    expect(nextRequirement(bar, 10)).toBeNull();
  });
  it('trava pelo Poder: só evolui com Poder ≥ requisito, 1 nível por vez', () => {
    expect(canEvolve(bar, 1, 479)).toBe(false);
    expect(evolveLeader(bar, 1, 479)).toEqual({ ok: false, level: 1 });
    expect(canEvolve(bar, 1, 480)).toBe(true);
    expect(evolveLeader(bar, 1, 5000)).toEqual({ ok: true, level: 2 });
    expect(evolveLeader(bar, 10, 1e9)).toEqual({ ok: false, level: 10 });
  });
  it('nunca perde nível quando o Poder cai depois', () => {
    let lv = 1;
    for (const p of [480, 510, 560]) lv = evolveLeader(bar, lv, p).level;
    expect(lv).toBe(4);
    // trocou cartas: Poder bem abaixo do requisito do nível atual
    const r = evolveLeader(bar, lv, 100);
    expect(r.ok).toBe(false);
    expect(r.level).toBe(4);
    expect(leaderHp(bar, r.level)).toBe(50);
    // o save guarda o nível e a vida da batalha vem dele, não do Poder
    const s = defaultSave();
    s.leaders = { barbaro: { level: 4 } };
    s.deck = s.deck.slice(0, 10);
    localStorage.setItem(KEY, JSON.stringify(s));
    expect(loadSave().leaders!.barbaro.level).toBe(4);
  });
});

describe('v0.13 — migração do save', () => {
  it('save novo: Bárbaro nível 1 e ativo', () => {
    const s = defaultSave();
    expect(s.leaders).toEqual({ barbaro: { level: 1 } });
    expect(s.activeLeader).toBe('barbaro');
    expect(s.v13).toBe(true);
  });
  it('save antigo (v0.12, sem Líder) ganha o Líder no nível 1, sem mexer nas cartas', () => {
    const old = defaultSave() as unknown as Record<string, unknown>;
    delete old.leaders;
    delete old.activeLeader;
    delete old.v13;
    (old.cards as Record<string, { level: number }>).riku.level = 9;
    localStorage.setItem(KEY, JSON.stringify(old));
    const s = loadSave();
    expect(s.leaders).toEqual({ barbaro: { level: 1 } });
    expect(s.activeLeader).toBe('barbaro');
    expect(s.v13).toBe(true);
    expect(s.cards.riku.level).toBe(9);
  });
  it('dados de Líder inválidos são corrigidos', () => {
    const s = defaultSave();
    (s as unknown as { leaders: unknown }).leaders = { barbaro: { level: 'x' } };
    s.activeLeader = 'fantasma';
    migrateV13(s);
    expect(s.leaders).toEqual({ barbaro: { level: 1 } });
    expect(s.activeLeader).toBe('barbaro');
    s.leaders = { barbaro: { level: 999 } };
    migrateV13(s);
    expect(s.leaders.barbaro.level).toBe(10);
  });
});

describe('v0.13 — campanha e batalha', () => {
  it('Líder inimigo: 12 + 7·i (metade do acréscimo do Líder do jogador por fase)', () => {
    expect(STAGES.map((s) => s.enemyHeroHp)).toEqual([12, 19, 26, 33, 40, 47, 54, 61, 68, 75]);
    for (let i = 0; i < 10; i++) expect(enemyLeaderHp(i)).toBe(12 + 7 * i);
  });
  it('a batalha usa a vida do nível do Líder', () => {
    expect(battleSrc).toContain('playerHeroHp: cb.playerHeroHp ?? PLAYER_HERO_HP');
    expect(mainSrc).toContain('playerHeroHp: leaderHp(activeLeader(), leaderLevel())');
  });
  it('Coleção mostra Poder do baralho, painel do Líder e modal do jogo (sem diálogo nativo)', () => {
    expect(mainSrc).toContain('leaderPanelHTML()');
    expect(mainSrc).toContain('deck-power');
    expect(mainSrc).toContain('evolveDialog');
    expect(mainSrc).not.toMatch(/\b(window\.)?(alert|confirm|prompt)\(/);
  });
});
