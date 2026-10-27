import { beforeEach, describe, expect, it } from 'vitest';
import { abilityPower } from '../../src/core/abilities';
import { placeUnit, createBattle } from '../../src/core/battle';
import { PLAYABLE, getChar } from '../../src/core/characters';
import { DIFFICULTIES, stageFor } from '../../src/core/adventure';
import { ENEMY_STEPS, STAGES } from '../../src/core/campaign';
import {
  MAX_STEP,
  STEP_GROWTH,
  ascend,
  ascendCost,
  barFull,
  cardBarXp,
  feedXp,
  isMaxTier,
  migrateOldCard,
  newOwned,
  statsFor,
  stepIndex,
  stepOf,
  stepXp,
  tierLabel,
} from '../../src/core/progression';
import { cardPower } from '../../src/core/power';
import { isSpell } from '../../src/core/spells';
import { cardHTML } from '../../src/ui/components';
import { adminSave } from '../../src/ui/accounts';
import { defaultSave, loadSave, setSaveKey, writeSave } from '../../src/ui/save';

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
  setSaveKey('kicdl-save-v1');
});

describe('v0.23.0 — carta sem nível: raridade + degrau ("+" / "++")', () => {
  it('3 degraus por raridade, com nome e índice na escada', () => {
    expect([0, 1, 2].map((p) => tierLabel(3, p))).toEqual(['Raro', 'Raro+', 'Raro++']);
    expect(stepIndex(1, 0)).toBe(0);
    expect(stepIndex(2, 0)).toBe(3);
    expect(stepIndex(6, 2)).toBe(17);
    // baralhos antigos: plus verdadeiro = "+"
    expect(stepOf({ plus: true })).toBe(1);
    expect(stepOf({ plus: false })).toBe(0);
    expect(stepOf({})).toBe(0);
    expect(stepOf({ plus: 7 })).toBe(MAX_STEP);
  });

  it('status = base × 1,17^(degrau na escada), arredondado (mínimo 1); a barra de XP não muda os status', () => {
    expect(STEP_GROWTH).toBe(1.17);
    for (const d of PLAYABLE)
      for (let s = d.minStars; s <= d.maxStars; s++)
        for (let p = 0; p <= MAX_STEP; p++) {
          const m = STEP_GROWTH ** stepIndex(s, p);
          expect(statsFor(d, s, p)).toEqual({ atk: Math.max(1, Math.round(d.atk * m)), hp: Math.max(1, Math.round(d.hp * m)) });
        }
    // o Mítico fica ~10× o Comum (como antes)
    expect(STEP_GROWTH ** stepIndex(6, 0)).toBeGreaterThan(9.5);
    expect(STEP_GROWTH ** stepIndex(6, 0)).toBeLessThan(11);
    const c = newOwned('riku');
    const before = cardPower(c);
    feedXp(c, cardBarXp(c) - 1);
    expect(cardPower(c)).toBe(before);
  });

  it('barras: o "++" fica entre o base e o da troca de raridade, e cresce com a raridade', () => {
    for (let s = 1; s <= 6; s++) {
      expect(stepXp(s, 0)).toBeLessThan(stepXp(s, 1));
      expect(stepXp(s, 1)).toBeLessThan(stepXp(s, 2));
      if (s > 1) expect(stepXp(s, 0)).toBeGreaterThan(stepXp(s - 1, 0));
    }
  });

  it('Despertar: só com a barra cheia e Essências; vai para o próximo degrau e zera a barra', () => {
    const c = newOwned('aiko'); // Incomum
    expect(barFull(c)).toBe(false);
    expect(ascend(c, 999).ok).toBe(false);
    const r = feedXp(c, cardBarXp(c) + 50);
    expect(r).toEqual({ filled: true, wasted: 50 });
    expect(barFull(c)).toBe(true);
    expect(ascendCost(c)).toBe(8); // 4 × Incomum
    expect(ascend(c, 7).ok).toBe(false);
    expect(ascend(c, 8)).toEqual({ ok: true, cost: 8 });
    expect(c).toMatchObject({ stars: 2, plus: 1, xp: 0 });
    feedXp(c, 1e9);
    expect(ascendCost(c)).toBe(10); // 5 × Incomum ("++")
    ascend(c, 10);
    feedXp(c, 1e9);
    expect(ascendCost(c)).toBe(12); // 6 × Incomum (nova raridade)
    ascend(c, 12);
    expect(c).toMatchObject({ stars: 3, plus: 0, xp: 0 });
  });

  it('topo = raridade máxima "++": não sobe mais e todo XP é perdido', () => {
    const c = { charId: 'aiko', xp: 0, stars: 4, plus: 2 };
    expect(isMaxTier(c)).toBe(true);
    expect(feedXp(c, 500)).toEqual({ filled: false, wasted: 500 });
    expect(ascend(c, 1e6).ok).toBe(false);
  });

  it('habilidades que melhoravam por nível melhoram no degrau equivalente', () => {
    // Bênção do Lótus (antes +1 no nível 20): a partir de Incomum+
    expect(abilityPower('lotus', 2, 0)).toBe(2);
    expect(abilityPower('lotus', 2, 1)).toBe(3);
    // Salto Vendaval (antes +1 no nível 30): a partir de Raro+
    expect(abilityPower('salto', 3, 0)).toBe(1);
    expect(abilityPower('salto', 3, 1)).toBe(2);
    // Flecha Dupla (antes +1 no nível 25): junto com o Raro
    expect(abilityPower('flechaDupla', 2, 2)).toBe(1);
    expect(abilityPower('flechaDupla', 3, 0)).toBe(3);
    // a unidade em campo usa o degrau da carta
    const s = createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });
    const u = placeUnit(s, { charId: 'mei', stars: 2, plus: 1 }, 'player', 0, 0);
    expect(u.plus).toBe(1);
    expect(u.maxHp).toBe(statsFor(getChar('mei'), 2, 1).hp);
  });

  it('a carta não mostra "Nv.": o degrau aparece na raridade ("Comum+" / "Comum++"; v0.28.7: sem a estrela)', () => {
    expect(cardHTML({ charId: 'riku', stars: 1 })).not.toContain('ck-star');
    expect(cardHTML({ charId: 'riku', stars: 1, plus: 1 })).toContain('<div class="ck-rar">Comum+</div>');
    expect(cardHTML({ charId: 'riku', stars: 1, plus: 2 })).toContain('<div class="ck-rar">Comum++</div>');
    for (const d of PLAYABLE) expect(cardHTML({ charId: d.id, stars: d.maxStars, plus: 2 })).not.toContain('Nv.');
  });
});

describe('v0.23.0 — inimigos por degrau', () => {
  it('toda carta inimiga tem raridade e degrau válidos (dentro da faixa do personagem), nas 3 dificuldades', () => {
    expect(ENEMY_STEPS).toHaveLength(STAGES.length);
    for (const st of STAGES)
      for (const diff of DIFFICULTIES)
        for (const c of stageFor(st.id, diff).enemyDeck) {
          if (isSpell(c.charId)) continue;
          const d = getChar(c.charId);
          expect(c.stars).toBeGreaterThanOrEqual(d.minStars);
          expect(c.stars).toBeLessThanOrEqual(d.maxStars);
          expect([0, 1, 2]).toContain(c.plus);
          expect('level' in c).toBe(false);
        }
  });
  it('Normal = +1 degrau e Difícil = +2 degraus em cada carta (limitado ao topo)', () => {
    for (const st of STAGES) {
      const g = (diff: (typeof DIFFICULTIES)[number]) => stageFor(st.id, diff).enemyDeck.filter((c) => !isSpell(c.charId)).map((c) => ({ g: stepIndex(c.stars, stepOf(c)), top: stepIndex(getChar(c.charId).maxStars, 2) }));
      const [f, n, d] = DIFFICULTIES.map(g);
      f.forEach((x, k) => {
        expect(n[k].g).toBe(Math.min(x.top, x.g + 1));
        expect(d[k].g).toBe(Math.min(x.top, x.g + 2));
      });
    }
  });
});

describe('v0.23.0 — conversão dos saves', () => {
  it('mesma raridade e degrau; barra cheia na proporção do progresso antigo', () => {
    // Comum base no nível máximo (10) = barra cheia; nível 1 sem XP = barra vazia
    expect(migrateOldCard({ charId: 'riku', level: 10, xp: 0, stars: 1 })).toMatchObject({ stars: 1, plus: 0, xp: stepXp(1, 0) });
    expect(migrateOldCard({ charId: 'riku', level: 1, xp: 0, stars: 1 })).toMatchObject({ stars: 1, plus: 0, xp: 0 });
    // Raro+ antigo vira Raro+; no meio do degrau fica com a barra no meio do caminho
    const mid = migrateOldCard({ charId: 'lyra', level: 32, xp: 0, stars: 3, plus: true });
    expect(mid).toMatchObject({ stars: 3, plus: 1 });
    expect(mid.xp).toBeGreaterThan(0);
    expect(mid.xp).toBeLessThan(stepXp(3, 1));
    // quanto mais nível, mais cheia a barra
    const a = migrateOldCard({ charId: 'riku', level: 4, xp: 0, stars: 1 }).xp;
    const b = migrateOldCard({ charId: 'riku', level: 7, xp: 0, stars: 1 }).xp;
    expect(b).toBeGreaterThan(a);
  });

  it('loadSave converte um save antigo sem perder nenhum personagem', () => {
    const old = defaultSave() as unknown as Record<string, unknown>;
    delete old.v23;
    const cards: Record<string, unknown> = {};
    for (const d of PLAYABLE) cards[d.id] = { charId: d.id, level: d.minStars * 10, xp: 0, stars: d.minStars, plus: d.id === 'riku' };
    old.cards = cards;
    store.set('kicdl-save-v1', JSON.stringify(old));
    const s = loadSave();
    expect(Object.keys(s.cards).sort()).toEqual(PLAYABLE.map((d) => d.id).sort());
    for (const c of Object.values(s.cards)) {
      expect('level' in c).toBe(false);
      expect(typeof c.plus).toBe('number');
    }
    expect(s.cards.riku).toMatchObject({ stars: 1, plus: 1 });
    expect(s.cards.nara).toMatchObject({ stars: 1, plus: 0, xp: stepXp(1, 0) }); // nível 10 = barra cheia
    expect(s.v23).toBe(true);
    // carregar de novo não muda nada (a conversão é feita uma vez)
    writeSave(s);
    expect(loadSave().cards).toEqual(s.cards);
  });

  it('conta ADM: todos os personagens no topo (raridade máxima "++")', () => {
    const d = adminSave();
    for (const def of PLAYABLE) expect(d.cards[def.id]).toMatchObject({ stars: def.maxStars, plus: MAX_STEP });
    expect(Object.values(d.cards).every(isMaxTier)).toBe(true);
  });
});
