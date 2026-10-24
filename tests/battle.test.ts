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
import type { BattleState, CardInstance } from '../src/core/types';

const c = (charId: string, level = 1, stars = 1): CardInstance => ({ charId, level, stars });

function emptyBattle(): BattleState {
  return createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });
}

describe('arena', () => {
  it('tem 2 fileiras × 7 colunas', () => {
    const s = emptyBattle();
    expect([ROWS, COLS]).toEqual([2, 7]);
    expect([s.rows, s.cols]).toEqual([2, 7]);
  });
  it('zona de invocação = 3 primeiras colunas de cada lado', () => {
    const s = emptyBattle();
    expect(DEPLOY_DEPTH).toBe(3);
    for (let col = 0; col < 7; col++) {
      expect(isDeployCell(s, 'player', 0, col)).toBe(col <= 2);
      expect(isDeployCell(s, 'enemy', 1, col)).toBe(col >= 4);
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
  it('salto pula por cima de uma unidade (2 casas)', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('riku'), 'player', 1, 0);
    placeUnit(s, c('gorath'), 'player', 1, 1);
    act(s, new Ctx(), u);
    expect(u.col).toBe(2);
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
  it('longo alcance atinge no máximo 2 casas à frente e não avança após atacar', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('aiko', 1, 2), 'player', 1, 1);
    const e = placeUnit(s, c('riku'), 'enemy', 1, 3, { hp: 50 });
    act(s, new Ctx(), u);
    expect(u.col).toBe(1);
    expect(e.hp).toBeLessThan(50);
    const far = emptyBattle();
    const u2 = placeUnit(far, c('aiko', 1, 2), 'player', 1, 1);
    placeUnit(far, c('riku'), 'enemy', 1, 4);
    expect(findTarget(far, u2)).toBeNull();
  });
  it('arqueiro para de andar assim que tem alvo no alcance', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('aiko', 1, 2), 'player', 1, 0);
    placeUnit(s, c('riku'), 'enemy', 1, 3, { hp: 50 });
    act(s, new Ctx(), u);
    expect(u.col).toBe(1);
  });
  it('longo alcance atinge o herói a partir da penúltima coluna', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('aiko', 1, 2), 'player', 0, 5);
    expect(findTarget(s, u)).toBe('hero');
    u.col = 4;
    expect(findTarget(s, u)).toBeNull();
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
  it('tiro perfurante atinge o inimigo mais distante da fileira, até 2 casas', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('lyra', 1, 2), 'player', 0, 2);
    placeUnit(s, c('riku'), 'enemy', 0, 3);
    const second = placeUnit(s, c('riku'), 'enemy', 0, 4);
    placeUnit(s, c('riku'), 'enemy', 0, 6);
    expect(findTarget(s, u)).toBe(second);
  });
  it('tiro perfurante não atinge de longe', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('lyra', 1, 2), 'player', 0, 0);
    placeUnit(s, c('riku'), 'enemy', 0, 6);
    expect(findTarget(s, u)).toBeNull();
  });
  it('emboscada atinge o mais recuado entre os inimigos até 2 colunas à frente', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('zarek', 1, 3), 'player', 0, 2);
    placeUnit(s, c('riku'), 'enemy', 0, 3);
    const back = placeUnit(s, c('riku'), 'enemy', 1, 4);
    placeUnit(s, c('riku'), 'enemy', 1, 6);
    expect(findTarget(s, u)).toBe(back);
  });
  it('emboscada não atinge de longe', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('zarek', 1, 3), 'player', 0, 0);
    placeUnit(s, c('riku'), 'enemy', 1, 5);
    expect(findTarget(s, u)).toBeNull();
  });
  it('instinto predador atinge o de menos vida até 2 colunas à frente', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('yume', 1, 3), 'player', 0, 2);
    placeUnit(s, c('gorath'), 'enemy', 0, 3);
    const weak = placeUnit(s, c('riku'), 'enemy', 1, 4, { hp: 2 });
    placeUnit(s, c('riku'), 'enemy', 1, 6, { hp: 1 });
    expect(findTarget(s, u)).toBe(weak);
  });
  it('instinto predador não atinge de longe', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('yume', 1, 3), 'player', 0, 0);
    placeUnit(s, c('riku'), 'enemy', 1, 6, { hp: 1 });
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
  it('Lyra, Zarek, Yume e longo alcance atacam o herói da penúltima coluna', () => {
    for (const id of ['lyra', 'zarek', 'yume', 'aiko', 'nyx']) {
      const s = emptyBattle();
      const u = placeUnit(s, c(id, 1, 4), 'player', 1, 5);
      expect(findTarget(s, u)).toBe('hero');
      u.col = 4;
      expect(findTarget(s, u)).toBeNull();
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
  it('unidade inimiga válida tem prioridade sobre o herói', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('lyra', 1, 2), 'player', 0, 5);
    const e = placeUnit(s, c('riku'), 'enemy', 0, 6);
    expect(findTarget(s, u)).toBe(e);
    const y = placeUnit(s, c('yume', 1, 3), 'player', 1, 5);
    expect(findTarget(s, y)).toBe(e);
  });
  it('mira especial sem alvo válido ataca o herói com o alcance normal', () => {
    const s = emptyBattle();
    const l = placeUnit(s, c('lyra', 1, 2), 'player', 1, 5);
    placeUnit(s, c('riku'), 'enemy', 0, 2); // inimigo atrás, fora da mira
    expect(findTarget(s, l)).toBe('hero');
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
    const s = createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1, fury: false });
    const a = placeUnit(s, c('riku'), 'player', 0, 0, { atk: 3 });
    s.turn = 20;
    expect(effectiveAtk(s, a)).toBe(3);
  });
});

describe('habilidades únicas', () => {
  it('Prole Sombria: ao derrotar, surge uma cria (1 de vida, ataque mágico à distância)', () => {
    const s = emptyBattle();
    const v = placeUnit(s, c('vorax', 1, 4), 'player', 1, 3);
    placeUnit(s, c('riku'), 'enemy', 1, 4, { hp: 1 });
    act(s, new Ctx(), v);
    const cria = s.units.find((u) => u.charId === 'cria');
    expect(cria).toBeTruthy();
    expect(cria!.side).toBe('player');
    expect(cria!.hp).toBe(1);
    expect(cria!.atk).toBe(2);
    expect(cria!.damageType).toBe('magico');
    expect([cria!.row, cria!.col]).toEqual([1, 4]);
  });
  it('crias que derrotam alguém geram novas crias', () => {
    const s = emptyBattle();
    const cria = placeUnit(s, c('cria'), 'player', 1, 2, { minion: true, atk: 2, hp: 1 });
    placeUnit(s, c('riku'), 'enemy', 1, 4, { hp: 1 });
    act(s, new Ctx(), cria);
    expect(s.units.filter((u) => u.charId === 'cria')).toHaveLength(2);
  });
  it('ataque da cria escala com o nível do invocador', () => {
    const s = emptyBattle();
    const v = placeUnit(s, c('vorax', 21, 4), 'player', 1, 3);
    placeUnit(s, c('riku'), 'enemy', 1, 4, { hp: 1 });
    act(s, new Ctx(), v);
    expect(s.units.find((u) => u.charId === 'cria')!.atk).toBe(4);
  });
  it('Punho Espelhado: contra-ataca em dobro e empurra o agressor físico de frente', () => {
    const s = emptyBattle();
    const k = placeUnit(s, c('kenji', 1, 4), 'enemy', 1, 5, { atk: 3, hp: 50 });
    const a = placeUnit(s, c('nara'), 'player', 1, 4, { atk: 2, hp: 20 });
    act(s, new Ctx(), a);
    expect(a.hp).toBe(20 - 6);
    expect(a.col).toBe(3);
    expect(k.hp).toBe(50 - 1);
  });
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
  it('Sifão de Energia reduz o ataque de todos os inimigos', () => {
    const s = emptyBattle();
    const a = placeUnit(s, c('riku'), 'player', 0, 0, { atk: 4 });
    const b = placeUnit(s, c('nara'), 'player', 1, 0, { atk: 3 });
    expect(effectiveAtk(s, a)).toBe(4);
    placeUnit(s, c('nyx', 1, 4), 'enemy', 1, 6);
    expect(effectiveAtk(s, a)).toBe(3);
    expect(effectiveAtk(s, b)).toBe(2);
  });
  it('Sifão com 6★ reduz 2', () => {
    const s = emptyBattle();
    const a = placeUnit(s, c('riku'), 'player', 0, 0, { atk: 4 });
    placeUnit(s, c('nyx', 1, 6), 'enemy', 1, 6);
    expect(effectiveAtk(s, a)).toBe(2);
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
  const deck6 = ['riku', 'nara', 'toru', 'aiko', 'gorath', 'lyra'].map((id) => c(id, 1, 2));
  it('começa com 4 cartas e compra exatamente 1 por rodada; cartas não usadas ficam na mão', () => {
    const s = createBattle({ playerDeck: deck6, enemyDeck: deck6, playerHeroHp: 30, enemyHeroHp: 30, seed: 5 });
    expect(s.decks.player.hand).toHaveLength(4);
    const before = s.decks.player.hand.map((x) => x.charId);
    endPlayerTurn(s, () => {});
    expect(s.decks.player.hand).toHaveLength(5);
    expect(s.decks.player.hand.slice(0, 4).map((x) => x.charId)).toEqual(before);
  });
  it('carta usada volta ao fim do baralho na hora (mesmo com a unidade viva)', () => {
    const s = createBattle({ playerDeck: deck6, enemyDeck: deck6, playerHeroHp: 30, enemyHeroHp: 30, seed: 5 });
    const card = s.decks.player.hand[0];
    const def = card.charId;
    const i = s.decks.player.hand.findIndex((x) => x.charId === def);
    s.energy.player = 10;
    expect(deploy(s, 'player', i, 0, 0).ok).toBe(true);
    expect(s.decks.player.draw[s.decks.player.draw.length - 1].charId).toBe(def);
    expect(s.decks.player.hand.length + s.decks.player.draw.length).toBe(6);
  });
  it('a mão nunca esvazia de vez e o mesmo personagem pode estar em campo mais de uma vez', () => {
    const deck3 = ['riku', 'nara', 'toru'].map((id) => c(id));
    const s = createBattle({ playerDeck: deck3, enemyDeck: deck3, playerHeroHp: 999, enemyHeroHp: 999, seed: 2, maxTurns: 99 });
    let maxSame = 0;
    for (let t = 0; t < 12 && !s.winner; t++) {
      // joga tudo que puder
      s.energy.player = 10;
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
  it('invocar gasta energia e só vale na zona de invocação', () => {
    const s = createBattle({ playerDeck: [c('riku'), c('nara'), c('toru'), c('riku')], enemyDeck: [c('riku')], playerHeroHp: 30, enemyHeroHp: 30, seed: 3 });
    expect(s.energy.player).toBe(3);
    const idx = s.decks.player.hand.findIndex((x) => x.charId === 'riku' || x.charId === 'nara');
    expect(deploy(s, 'player', idx, 0, 3).ok).toBe(false);
    expect(deploy(s, 'player', idx, 0, 2).ok).toBe(true);
    expect(s.energy.player).toBe(1);
  });
  it('vitória ao zerar a vida do herói inimigo', () => {
    const s = createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 2, seed: 1 });
    placeUnit(s, c('riku'), 'player', 0, 6);
    endPlayerTurn(s, aiDeploy);
    expect(s.winner).toBe('player');
  });
  it('partida completa contra a IA termina', () => {
    const deck = ['riku', 'nara', 'toru', 'aiko', 'gorath', 'lyra'].map((id) => c(id, 5, 2));
    const s = createBattle({ playerDeck: deck, enemyDeck: deck, playerHeroHp: 30, enemyHeroHp: 30, seed: 42 });
    for (let i = 0; i < 100 && !s.winner; i++) {
      aiDeploy(s, new Ctx(), 'player');
      endPlayerTurn(s, aiDeploy);
    }
    expect(s.winner).not.toBeNull();
  });
});
