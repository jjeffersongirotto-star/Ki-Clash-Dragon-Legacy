import { describe, expect, it } from 'vitest';
import { TOWER_FLOORS, TOWER_UNLOCK_STAGE, isBossFloor, normalizeTower, towerNext, towerReward, towerStage, towerStep, towerUnlocked } from '../../src/core/tower';
import { CHEST_GEMS, MISSIONS, chestReady, claimMission, freshMissions, missionReward, missionsToClaim, normalizeMissions, refStage, trackMission } from '../../src/core/missions';
import { goldFor } from '../../src/core/profile';
import { HUB_SPOTS } from '../../src/app/hubConfig';

const DAY = Date.UTC(2026, 10, 27, 15); // 12h em Brasília
const prog = (cleared: number[], normal: number[] = [], dificil: number[] = []) => ({ cleared, clearedDiff: { normal, dificil } });

describe('v0.72.0 — Torre', () => {
  it('100 andares, abre depois da Fácil 10, sempre o próximo andar', () => {
    expect(TOWER_FLOORS).toBe(100);
    expect(towerUnlocked([1, 2, 3])).toBe(false);
    expect(towerUnlocked([TOWER_UNLOCK_STAGE])).toBe(true);
    expect(towerNext(undefined)).toBe(1);
    expect(towerNext({ best: 41 })).toBe(42);
    expect(towerNext({ best: 100 })).toBeNull();
    expect(normalizeTower({ best: 250 })).toEqual({ best: 100 });
    expect(normalizeTower('x')).toEqual({ best: 0 });
    expect(HUB_SPOTS.find((s) => s.key === '08-torre')?.nav).toBe('tower');
  });
  it('cada andar é mais difícil (ou igual); chefe a cada 10 com mais vida', () => {
    for (let f = 2; f <= TOWER_FLOORS; f++) if (!isBossFloor(f) && !isBossFloor(f - 1)) expect(towerStep(f)).toBeGreaterThanOrEqual(towerStep(f - 1));
    expect(towerStep(10)).toBeGreaterThan(towerStep(11) - 1);
    const s9 = towerStage(9), s10 = towerStage(10);
    expect(s10.name).toContain('chefe');
    expect(s10.enemyHeroHp).toBeGreaterThan(s9.enemyHeroHp);
    expect(towerStage(1).id).toBe(0);
    expect(towerStage(1).enemyDeck.length).toBeGreaterThan(0);
  });
  it('prêmio: Ouro e Orbes em dobro, 3 itens (6 a cada 5 andares), Gemas no chefe', () => {
    const r = towerReward(7, () => 0.5);
    expect(r.gold).toBe(goldFor(9, 'normal') * 2);
    expect(r.gear).toHaveLength(3);
    expect(r.gems).toBe(0);
    expect(towerReward(5, () => 0.5).gear).toHaveLength(6);
    expect(towerReward(10, () => 0.5).gems).toBe(2);
  });
});

describe('v0.72.0 — Missões diárias', () => {
  it('progresso por evento, até a meta; zera no dia seguinte', () => {
    let m = trackMission(undefined, 'win', 1, DAY);
    m = trackMission(m, 'win', 5, DAY);
    m = trackMission(m, 'energy', 18, DAY);
    expect(m.prog).toEqual({ win: 3, energy: 18 });
    expect(freshMissions(m, DAY + 24 * 3600e3).prog).toEqual({});
  });
  it('resgatar: só cumprida e uma vez; o Baú pede todas (a da Torre só com a Torre aberta)', () => {
    let m = trackMission(undefined, 'win', 3, DAY);
    const p = prog([1, 2, 3]);
    expect(claimMission(m, p, 'play', false, () => 0, DAY)).toBeNull();
    const c = claimMission(m, p, 'win', false, () => 0, DAY)!;
    expect(c.reward.gold).toBe(goldFor(3, 'facil') * 3);
    m = c.state;
    expect(claimMission(m, p, 'win', false, () => 0, DAY)).toBeNull();
    for (const d of MISSIONS) m = trackMission(m, d.event, d.goal, DAY);
    expect(chestReady(m, false, DAY)).toBe(true);
    const fresh = MISSIONS.filter((d) => d.event !== 'tower').reduce((s, d) => trackMission(s, d.event, d.goal, DAY), freshMissions(undefined, DAY));
    expect(chestReady(fresh, false, DAY)).toBe(true);
    expect(chestReady(fresh, true, DAY)).toBe(false);
    const chest = claimMission(m, p, 'chest', true, () => 0, DAY)!;
    expect(chest.reward.gems).toBe(CHEST_GEMS);
    expect(chest.reward.gear).toHaveLength(2);
    expect(missionsToClaim(chest.state, true, DAY)).toBe(MISSIONS.length - 1);
  });
  it('prêmios crescem com o progresso (fase que mais dá Ouro)', () => {
    expect(refStage(prog([]))).toEqual({ diff: 'facil', stage: 1 });
    expect(refStage(prog([1, 2, 30], [1, 2]))).toEqual({ diff: 'facil', stage: 30 });
    expect(refStage(prog([1, 2, 30], [12]))).toEqual({ diff: 'normal', stage: 12 });
    expect(missionReward(prog([1, 2, 30], [12]), 'win').gold).toBeGreaterThan(missionReward(prog([1]), 'win').gold);
  });
  it('save: confere o que veio salvo', () => {
    expect(normalizeMissions(null)).toBeUndefined();
    expect(normalizeMissions({ day: '2026-11-27', prog: { win: 99, x: 3 }, claimed: ['win', 'win', 'zzz', 'chest'] })).toEqual({ day: '2026-11-27', prog: { win: 3 }, claimed: ['win', 'chest'] });
  });
});
