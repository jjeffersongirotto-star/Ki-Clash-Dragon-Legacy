import { describe, expect, it } from 'vitest';
import {
  act,
  attack,
  COLS,
  computeDamage,
  createBattle,
  Ctx,
  deploy,
  DEPLOY_DEPTH,
  effectiveAtk,
  endPlayerTurn,
  findTarget,
  furyBonus,
  isDeployCell,
  placeUnit,
  ROWS,
} from '../src/core/battle';
import { aiDeploy } from '../src/core/ai';
import { pileCount, totalCards } from '../src/core/deck';
import type { BattleState, CardInstance } from '../src/core/types';

const c = (charId: string, _level = 1, stars = 1, plus = 0): CardInstance => ({ charId, stars, plus });

function emptyBattle(): BattleState {
  return createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1, cols: 7 /* arena compacta de teste: mesmas regras */ });
}

describe('arena', () => {
  it('tem 2 fileiras × 12 colunas (v0.16.0)', () => {
    const s = createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });
    expect([ROWS, COLS]).toEqual([2, 12]);
    expect([s.rows, s.cols]).toEqual([2, 12]);
  });
  it('zona de invocação = 3 primeiras colunas de cada lado', () => {
    const s = createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });
    expect(DEPLOY_DEPTH).toBe(3);
    for (let col = 0; col < 12; col++) {
      expect(isDeployCell(s, 'player', 0, col)).toBe(col <= 2);
      expect(isDeployCell(s, 'enemy', 1, col)).toBe(col >= 9);
    }
  });
});

describe('dano e resistência', () => {
  it('resistência física 1 reduz 3 de dano físico para 2', () => {
    expect(computeDamage(3, 'fisico', { physRes: 1, magRes: 0 })).toBe(2);
  });
  it('dano mágico ignora resistência física', () => {
    expect(computeDamage(3, 'magico', { physRes: 5, magRes: 0 })).toBe(3);
  });
  it('dano mínimo é 1', () => {
    expect(computeDamage(1, 'fisico', { physRes: 4, magRes: 0 })).toBe(1);
  });
  it('Gorath (resist. física 2) recebe menos dano físico em combate', () => {
    const s = emptyBattle();
    const a = placeUnit(s, c('riku'), 'player', 0, 3, { atk: 5 });
    const g = placeUnit(s, c('gorath', 1, 2), 'enemy', 0, 4);
    const hp = g.hp;
    attack(s, new Ctx(), a, g);
    expect(g.hp).toBe(hp - 3);
  });
});

describe('movimento', () => {
  it('unidade básica anda 2 casas', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('nara'), 'player', 0, 0);
    act(s, new Ctx(), u);
    expect(u.col).toBe(2);
  });
  it('não atravessa um inimigo sem derrotá-lo', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('riku', 1, 1), 'player', 0, 0, { atk: 1 });
    u.abilities = [];
    placeUnit(s, c('gorath'), 'enemy', 0, 1, { hp: 99 });
    act(s, new Ctx(), u);
    expect(u.col).toBe(0);
  });
  it('anda até ficar de frente para o inimigo e ataca', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('nara'), 'player', 0, 1);
    const e = placeUnit(s, c('gorath'), 'enemy', 0, 4, { hp: 99 });
    act(s, new Ctx(), u);
    expect(u.col).toBe(3);
    expect(e.hp).toBeLessThan(99);
  });
  it('salto pula por cima de uma unidade e anda até 3 casas (v0.15.0)', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('riku'), 'player', 1, 0);
    placeUnit(s, c('gorath'), 'player', 1, 1);
    act(s, new Ctx(), u);
    expect(u.col).toBe(3);
  });
  it('inimigo anda para a esquerda', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('nara'), 'enemy', 0, 6);
    act(s, new Ctx(), u);
    expect(u.col).toBe(4);
  });
});

describe('alcance e mira', () => {
  it('físico só atinge a casa logo à frente (alcance 1)', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('nara'), 'player', 0, 3);
    const e = placeUnit(s, c('riku'), 'enemy', 0, 4);
    expect(findTarget(s, u)).toBe(e);
    const far = emptyBattle();
    const u2 = placeUnit(far, c('riku'), 'player', 0, 3);
    placeUnit(far, c('riku'), 'enemy', 0, 5);
    expect(findTarget(far, u2)).toBeNull();
  });
  it('físico ataca o herói só na última coluna', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('riku'), 'player', 0, 5);
    expect(findTarget(s, u)).toBeNull();
    u.col = 6;
    expect(findTarget(s, u)).toBe('hero');
    const e = placeUnit(s, c('riku'), 'enemy', 1, 0);
    expect(findTarget(s, e)).toBe('hero');
  });
  it('ao chegar na última coluna bate no herói inimigo', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('riku'), 'player', 0, 5);
    act(s, new Ctx(), u);
    expect(u.col).toBe(6);
    expect(s.heroes.enemy.hp).toBe(30 - u.atk);
  });
  it('corte diagonal atinge só a diagonal adjacente à frente', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('nara'), 'player', 0, 3);
    const e = placeUnit(s, c('riku'), 'enemy', 1, 4);
    expect(findTarget(s, u)).toBe(e);
    e.col = 5;
    expect(findTarget(s, u)).toBeNull();
  });
  it('unidade comum NÃO ataca na diagonal', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('riku'), 'player', 0, 3);
    placeUnit(s, c('riku'), 'enemy', 1, 4);
    expect(findTarget(s, u)).toBeNull();
  });
  it('golpe reverso atinge a diagonal adjacente atrás', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('toru'), 'player', 0, 4);
    const e = placeUnit(s, c('riku'), 'enemy', 1, 3);
    expect(findTarget(s, u)).toBe(e);
    e.col = 2;
    expect(findTarget(s, u)).toBeNull();
  });
});

describe('herói como alvo (coluna virtual após a arena)', () => {
  it('corpo a corpo (incl. diagonais) só ataca o herói da última coluna, nas duas fileiras', () => {
    for (const id of ['riku', 'nara', 'toru', 'gorath', 'kenji']) {
      for (const row of [0, 1]) {
        const s = emptyBattle();
        const u = placeUnit(s, c(id, 1, 4), 'player', row, 5);
        expect(findTarget(s, u)).toBeNull();
        u.col = 6;
        expect(findTarget(s, u)).toBe('hero');
      }
    }
  });
  it('vale para o inimigo também (herói do jogador à esquerda)', () => {
    const s = emptyBattle();
    const z = placeUnit(s, c('zarek', 1, 3), 'enemy', 0, 1);
    const n = placeUnit(s, c('nara'), 'enemy', 1, 1);
    expect(findTarget(s, z)).toBe('hero');
    expect(findTarget(s, n)).toBeNull();
  });
  it('unidade de alcance 2 para de avançar quando o herói entra no alcance e ataca', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('yume', 1, 3), 'player', 0, 3);
    act(s, new Ctx(), u);
    expect(u.col).toBe(5);
    expect(s.heroes.enemy.hp).toBe(30 - u.atk);
  });
  it('não atravessa inimigo para chegar ao herói (exceto salto)', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('nara'), 'player', 0, 4, { atk: 1 });
    placeUnit(s, c('gorath'), 'enemy', 0, 5, { hp: 99 });
    act(s, new Ctx(), u);
    expect(u.col).toBe(4);
    expect(s.heroes.enemy.hp).toBe(30);
    const s2 = emptyBattle();
    const r = placeUnit(s2, c('riku'), 'player', 0, 4);
    placeUnit(s2, c('gorath'), 'player', 0, 5);
    act(s2, new Ctx(), r);
    expect(r.col).toBe(6);
    expect(s2.heroes.enemy.hp).toBe(30 - r.atk);
  });
  it('fúria pode ser desligada (para simulações)', () => {
    const s = createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1, fury: false, cols: 7 });
    const a = placeUnit(s, c('riku'), 'player', 0, 0, { atk: 3 });
    s.turn = 20;
    expect(effectiveAtk(s, a)).toBe(3);
  });
});

describe('habilidades únicas', () => {
  it('Punho Espelhado não reage a dano mágico', () => {
    const s = emptyBattle();
    placeUnit(s, c('kenji', 1, 4), 'enemy', 1, 5, { hp: 50 });
    const m = placeUnit(s, c('lyra', 1, 2), 'player', 1, 4, { hp: 20 });
    act(s, new Ctx(), m);
    expect(m.hp).toBe(20);
  });
  it('Punho Espelhado não reage a ataque pela diagonal de trás', () => {
    const s = emptyBattle();
    placeUnit(s, c('kenji', 1, 4), 'enemy', 1, 3, { hp: 50 });
    const t = placeUnit(s, c('toru'), 'player', 0, 4, { hp: 20 });
    act(s, new Ctx(), t);
    expect(t.hp).toBe(20);
  });
});

describe('fúria de batalha (anti-empate)', () => {
  it('sem bônus antes do turno 8; depois +1 a cada 3 turnos', () => {
    expect(furyBonus(7)).toBe(0);
    expect(furyBonus(8)).toBe(1);
    expect(furyBonus(10)).toBe(1);
    expect(furyBonus(11)).toBe(2);
  });
  it('soma ao ataque efetivo', () => {
    const s = emptyBattle();
    const a = placeUnit(s, c('riku'), 'player', 0, 0, { atk: 3 });
    s.turn = 11;
    expect(effectiveAtk(s, a)).toBe(5);
  });
});

describe('mão e baralho', () => {
  const deck10 = ['riku', 'nara', 'toru', 'aiko', 'gorath', 'lyra', 'mei', 'yume', 'zarek', 'kenji'].map((id) => c(id, 1, id === 'kenji' ? 5 : 3));
  it('começa com 6 cartas na mão, baralho de 30 (10 × 3, v0.17); compra o que falta para voltar a 6 e cartas não usadas ficam', () => {
    const s = createBattle({ playerDeck: deck10, enemyDeck: deck10, playerHeroHp: 30, enemyHeroHp: 30, seed: 5 });
    expect(s.decks.player.hand).toHaveLength(6);
    expect(new Set(s.decks.player.hand.map((x) => x.charId)).size).toBe(6);
    expect(totalCards(s.decks.player)).toBe(30);
    expect(pileCount(s.decks.player)).toBe(24);
    // mão cheia: a rodada não compra
    endPlayerTurn(s, () => {});
    expect(s.decks.player.hand).toHaveLength(6);
    s.decks.player.hand.forEach((h) => (h.wait = 0));
    const before = s.decks.player.hand.slice(3).map((x) => x.charId);
    expect(deploy(s, 'player', 0, 0, 0).ok).toBe(true);
    s.decks.player.hand.forEach((h) => (h.wait = 0));
    expect(deploy(s, 'player', 0, 1, 0).ok).toBe(true);
    s.decks.player.hand.forEach((h) => (h.wait = 0));
    expect(deploy(s, 'player', 0, 0, 1).ok).toBe(true);
    expect(s.decks.player.hand).toHaveLength(3);
    const step = s.decks.player.step;
    endPlayerTurn(s, () => {});
    // jogou 3 → comprou 3 numa compra só
    expect(s.decks.player.hand).toHaveLength(6);
    expect(s.decks.player.step).toBe(step + 1);
    expect(s.decks.player.hand.slice(0, 3).map((x) => x.charId)).toEqual(before);
  });
  it('v0.17: só começa a batalha com baralho de 20 a 40 cartas, sem entradas repetidas', () => {
    const six = deck10.slice(0, 6); // 6 × 3 = 18
    expect(() => createBattle({ playerDeck: six, enemyDeck: deck10, playerHeroHp: 30, enemyHeroHp: 30, seed: 1 })).toThrow(/18 de no mínimo 20/);
    expect(() => createBattle({ playerDeck: deck10, enemyDeck: six, playerHeroHp: 30, enemyHeroHp: 30, seed: 1 })).toThrow();
    expect(() => createBattle({ playerDeck: deck10.slice(0, 9).concat([c('riku')]), enemyDeck: deck10, playerHeroHp: 30, enemyHeroHp: 30, seed: 1 })).toThrow(/repetidas/);
    expect(() => createBattle({ playerDeck: deck10.slice(0, 7), enemyDeck: deck10, playerHeroHp: 30, enemyHeroHp: 30, seed: 1 })).not.toThrow();
  });
  it('cópia jogada fica em campo; quando a unidade morre vai para as derrotadas e não volta', () => {
    const s = createBattle({ playerDeck: deck10, enemyDeck: deck10, playerHeroHp: 30, enemyHeroHp: 30, seed: 5 });
    s.decks.player.hand.forEach((h) => (h.wait = 0));
    const card = s.decks.player.hand[0];
    expect(deploy(s, 'player', 0, 0, 2).ok).toBe(true);
    expect(pileCount(s.decks.player) + s.decks.player.hand.length).toBe(29);
    const u = s.units.find((x) => x.side === 'player')!;
    expect(u.slot).toBe(card.slot);
    const killer = placeUnit(s, c('nara'), 'enemy', 0, 3, { atk: 99 });
    act(s, new Ctx(), killer);
    expect(s.units.includes(u)).toBe(false);
    expect(s.decks.player.defeated.map((x) => x.charId)).toEqual([card.charId]);
    expect(s.decks.player.slots[card.slot!].copies - s.decks.player.slots[card.slot!].defeated).toBe(2);
    expect(pileCount(s.decks.player) + s.decks.player.hand.length).toBe(29);
  });
  it('a mão não esvazia de vez e o mesmo personagem pode estar em campo mais de uma vez', () => {
    const s = createBattle({ playerDeck: deck10, enemyDeck: deck10, playerHeroHp: 999, enemyHeroHp: 999, seed: 2, maxTurns: 99 });
    let maxSame = 0;
    for (let t = 0; t < 12 && !s.winner; t++) {
      s.decks.player.hand.forEach((h) => (h.wait = 0));
      for (let k = 0; k < 6; k++) {
        const cells: [number, number][] = [];
        for (let r = 0; r < 2; r++) for (let col = 0; col < 3; col++) cells.push([r, col]);
        const free = cells.find(([r, col]) => !s.units.some((u) => u.row === r && u.col === col));
        if (!free || !s.decks.player.hand.length) break;
        deploy(s, 'player', 0, free[0], free[1]);
      }
      endPlayerTurn(s, () => {});
      expect(s.decks.player.hand.length).toBeGreaterThan(0);
      const counts: Record<string, number> = {};
      for (const u of s.units.filter((x) => x.side === 'player')) counts[u.charId] = (counts[u.charId] ?? 0) + 1;
      maxSame = Math.max(maxSame, ...Object.values(counts), 0);
    }
    expect(maxSame).toBeGreaterThan(1);
  });
});

describe('fluxo de batalha', () => {
  it('invocar exige carta pronta (contagem 0) e só vale na zona de invocação', () => {
    const ten = ['riku', 'nara', 'toru', 'daichi', 'sora', 'tobi', 'kael', 'suri', 'hana', 'jin'].map((id) => c(id));
    const s = createBattle({ playerDeck: ten, enemyDeck: ten, playerHeroHp: 30, enemyHeroHp: 30, seed: 3 });
    const idx = s.decks.player.hand.findIndex((x) => x.charId === 'riku' || x.charId === 'nara');
    expect(s.decks.player.hand[idx].wait).toBe(0);
    expect(deploy(s, 'player', idx, 0, 3).ok).toBe(false);
    expect(deploy(s, 'player', idx, 0, 2).ok).toBe(true);
  });
  it('vitória ao zerar a vida do herói inimigo', () => {
    const s = createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 2, seed: 1 });
    placeUnit(s, c('nara'), 'player', 0, s.cols - 1);
    endPlayerTurn(s, aiDeploy);
    expect(s.winner).toBe('player');
  });
  it('partida completa contra a IA termina', () => {
    const deck = ['riku', 'nara', 'toru', 'aiko', 'gorath', 'lyra', 'daichi', 'kael', 'ren', 'kuro'].map((id) => c(id, 5, 2));
    const s = createBattle({ playerDeck: deck, enemyDeck: deck, playerHeroHp: 30, enemyHeroHp: 30, seed: 42 });
    for (let i = 0; i < 100 && !s.winner; i++) {
      aiDeploy(s, new Ctx(), 'player');
      endPlayerTurn(s, aiDeploy);
    }
    expect(s.winner).not.toBeNull();
  });
});
