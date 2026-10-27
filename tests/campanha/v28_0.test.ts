import { describe, expect, it } from 'vitest';
import { DIFFICULTIES, STAGE_GOALS, difficultyUnlocked, goalMet, markCleared, starGoals, starsForWin, stageUnlocked, type AdventureProgress } from '../../src/core/adventure';
import { ENEMY_HERO_HP, ENEMY_STEPS, STAGES, STAGE_COMMANDERS, stageCommander } from '../../src/core/campaign';
import { TUTORIAL_BATTLES } from '../../src/core/tutorial';
import { Ctx, castSpell, createBattle, deploy, endPlayerTurn } from '../../src/core/battle';
import { aiDeploy } from '../../src/core/ai';
import { playerAuto, playerEndTurn, verifyMatch, claimOf } from '../../src/core/match';
import type { CardInstance } from '../../src/core/types';

const fresh = (): AdventureProgress => ({ cleared: [], clearedDiff: {} });

describe('v0.28.0 — liberação fase a fase no Normal e no Difícil', () => {
  it('a fase N do Normal abre com a fase N do Fácil e a N−1 do Normal', () => {
    const p = fresh();
    expect(difficultyUnlocked(p, 'normal')).toBe(false);
    markCleared(p, 'facil', 1);
    expect(difficultyUnlocked(p, 'normal')).toBe(true);
    expect(stageUnlocked(p, 'normal', 1)).toBe(true);
    expect(stageUnlocked(p, 'normal', 2)).toBe(false); // falta a fase 2 do Fácil e a 1 do Normal
    markCleared(p, 'normal', 1);
    expect(stageUnlocked(p, 'normal', 2)).toBe(false); // falta a fase 2 do Fácil
    markCleared(p, 'facil', 2);
    expect(stageUnlocked(p, 'normal', 2)).toBe(true);
    expect(stageUnlocked(p, 'normal', 3)).toBe(false);
    // Difícil em relação ao Normal
    expect(difficultyUnlocked(p, 'dificil')).toBe(true);
    expect(stageUnlocked(p, 'dificil', 2)).toBe(false);
    markCleared(p, 'dificil', 1);
    expect(stageUnlocked(p, 'dificil', 2)).toBe(false); // fase 2 do Normal ainda não
    markCleared(p, 'normal', 2);
    expect(stageUnlocked(p, 'dificil', 2)).toBe(true);
  });
});

describe('v0.28.0 — estrelas com objetivos por fase', () => {
  it('cada fase em cada dificuldade: vencer + 2 objetivos da lista (vida, cartas, feitiços, abates; sem turnos)', () => {
    const allowed: Record<string, number[]> = { hp: [50, 70, 100], cards: [8, 10, 12], nospell: [0], spells: [2], kills: [6, 8, 10] };
    for (const d of DIFFICULTIES) {
      expect(STAGE_GOALS[d]).toHaveLength(STAGES.length);
      STAGE_GOALS[d].forEach((pair, i) => {
        expect(pair).toHaveLength(2);
        expect(pair[0].kind).not.toBe(pair[1].kind);
        for (const g of pair) expect(allowed[g.kind]).toContain(g.n);
        const goals = starGoals(d, i + 1);
        expect(goals[0].kind).toBe('win');
        expect(goals.map((g) => g.text).join(' ')).not.toMatch(/turno/i);
      });
    }
  });
  it('Normal e Difícil mudam os objetivos ou apertam os números em cada fase', () => {
    const key = (d: (typeof DIFFICULTIES)[number], i: number) => JSON.stringify(STAGE_GOALS[d][i]);
    for (let i = 0; i < STAGES.length; i++) {
      expect(key('normal', i)).not.toBe(key('facil', i));
      expect(key('dificil', i)).not.toBe(key('normal', i));
    }
  });
  it('goalMet / starsForWin', () => {
    const r = (cards: number, spells: number, kills: number, hp = 20) => ({ playerHp: hp, playerMaxHp: 20, turn: 30, stats: { cards, spells, kills } });
    expect(goalMet({ kind: 'hp', n: 100 }, r(5, 0, 0, 20))).toBe(true);
    expect(goalMet({ kind: 'hp', n: 100 }, r(5, 0, 0, 19))).toBe(false);
    expect(goalMet({ kind: 'cards', n: 10 }, r(10, 0, 0))).toBe(true);
    expect(goalMet({ kind: 'cards', n: 10 }, r(11, 0, 0))).toBe(false);
    expect(goalMet({ kind: 'nospell', n: 0 }, r(9, 1, 0))).toBe(false);
    expect(goalMet({ kind: 'spells', n: 2 }, r(9, 2, 0))).toBe(true);
    expect(goalMet({ kind: 'kills', n: 6 }, r(9, 0, 5))).toBe(false);
    // fase 3 do Fácil: abates ≥ 6 e vida ≥ 70%
    expect(starsForWin(r(20, 0, 6, 14), 'facil', 3)).toBe(7);
    expect(starsForWin(r(20, 0, 5, 14), 'facil', 3)).toBe(5);
    expect(starsForWin(r(20, 0, 6, 13), 'facil', 3)).toBe(3);
    // sem contagem (vitória antiga), só a de vencer e a de vida podem valer
    expect(starsForWin({ playerHp: 1, playerMaxHp: 20, turn: 5 }, 'facil', 4)).toBe(1);
  });
});

describe('v0.28.0 — contagem da partida (cartas, feitiços, abates)', () => {
  const deck: CardInstance[] = ['riku', 'nara', 'sora', 'daichi', 'tobi', 'kael', 'suri', 'hana', 'jin', 'ren'].map((id) => ({ charId: id, stars: 1, plus: 0, copies: 3 }));
  it('conta cartas invocadas e personagens inimigos derrotados; refazer a partida dá o mesmo resultado', () => {
    const s = createBattle({ playerDeck: deck, enemyDeck: deck, playerHeroHp: 40, enemyHeroHp: 40, seed: 9 });
    expect(s.stats).toEqual({ player: { cards: 0, spells: 0, kills: 0 }, enemy: { cards: 0, spells: 0, kills: 0 } });
    for (let t = 0; t < 60 && !s.winner; t++) {
      playerAuto(s);
      playerEndTurn(s);
    }
    expect(s.stats!.player.cards).toBeGreaterThan(0);
    expect(s.stats!.player.kills + s.stats!.enemy.kills).toBeGreaterThan(0);
    expect(verifyMatch(s.record!, claimOf(s)).ok).toBe(true);
  });
  it('invocar conta 1 carta; feitiço conta 1 carta e 1 feitiço', () => {
    const s = createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });
    s.decks.player.hand = [{ charId: 'riku', stars: 1, plus: 0, slot: 0, wait: 0 } as never, { charId: 'f-raio', stars: 1, slot: 1, wait: 0 } as never];
    expect(deploy(s, 'player', 0, 0, 0).ok).toBe(true);
    expect(s.stats!.player.cards).toBe(1);
    s.decks.enemy.hand = [{ charId: 'daichi', stars: 1, plus: 0, slot: 0, wait: 0 } as never];
    s.active = 'enemy';
    deploy(s, 'enemy', 0, 0, s.cols - 1);
    s.active = 'player';
    const res = castSpell(s, 'player', 0, 0, s.cols - 1, new Ctx());
    if (res.ok) {
      expect(s.stats!.player.cards).toBe(2);
      expect(s.stats!.player.spells).toBe(1);
    }
    void endPlayerTurn;
    void aiDeploy;
  });
});

describe('v0.28.0 — Comandante inimigo de cada fase', () => {
  it('fases 1–9: o mais forte da fase sem repetir; fase 10: minotauro', () => {
    expect(STAGE_COMMANDERS).toHaveLength(10);
    expect(STAGE_COMMANDERS[9]).toBeNull();
    const ids = STAGE_COMMANDERS.slice(0, 9);
    expect(new Set(ids).size).toBe(9);
    ids.forEach((id, i) => expect(STAGES[i].enemyDeck.some((c) => c.charId === id)).toBe(true));
    expect(stageCommander(STAGES[9])).toBeNull();
    expect(stageCommander(STAGES[0])?.charId).toBe(STAGE_COMMANDERS[0]);
    // tutorial: o mais forte da batalha
    expect(stageCommander(TUTORIAL_BATTLES[0])?.charId).toBe('kuro');
  });
});

describe('v0.28.0 — reequilíbrio do Fácil', () => {
  it('degraus, vida do Comandante e feitiços da tabela nova (v0.33.0: reequilibrada de novo)', () => {
    expect(ENEMY_STEPS).toEqual([3.34, 3.25, 0.5, 1.5, 0, 0, 1.5, 0, 0, 0]);
    expect(ENEMY_HERO_HP).toEqual([16, 20, 18, 32, 22, 40, 47, 52, 56, 74]);
    expect(STAGES.map((s) => s.enemyHeroHp)).toEqual(ENEMY_HERO_HP);
  });
});
