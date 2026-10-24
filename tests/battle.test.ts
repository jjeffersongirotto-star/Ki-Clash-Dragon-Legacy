import { describe, expect, it } from 'vitest';
import {
  act,
  attack,
  computeDamage,
  createBattle,
  Ctx,
  deploy,
  effectiveAtk,
  endPlayerTurn,
  findTarget,
  placeUnit,
  resolveSide,
} from '../src/core/battle';
import { aiDeploy } from '../src/core/ai';
import type { BattleState, CardInstance } from '../src/core/types';

const c = (charId: string, level = 1, stars = 1): CardInstance => ({ charId, level, stars });

function emptyBattle(): BattleState {
  const s = createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });
  return s;
}

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
    const a = placeUnit(s, c('riku'), 'player', 2, 3, { atk: 5 });
    const g = placeUnit(s, c('gorath', 1, 2), 'enemy', 2, 4);
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
    const u = placeUnit(s, c('nara'), 'player', 0, 0, { atk: 1 });
    placeUnit(s, c('gorath'), 'enemy', 0, 1, { hp: 99 });
    act(s, new Ctx(), u);
    expect(u.col).toBe(0);
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
    const u = placeUnit(s, c('nara'), 'enemy', 0, 8);
    act(s, new Ctx(), u);
    expect(u.col).toBe(6);
  });
});

describe('alcance e mira', () => {
  it('ataque básico tem alcance 2 na mesma fileira', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('nara'), 'player', 0, 3);
    const e = placeUnit(s, c('riku'), 'enemy', 0, 5);
    expect(findTarget(s, u)).toBe(e);
    const far = emptyBattle();
    const u2 = placeUnit(far, c('riku'), 'player', 0, 3);
    placeUnit(far, c('riku'), 'enemy', 0, 6);
    expect(findTarget(far, u2)).toBeNull();
  });
  it('longo alcance (+2) ataca a 4 casas e não avança após atacar', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('aiko', 1, 2), 'player', 2, 1);
    const e = placeUnit(s, c('riku'), 'enemy', 2, 5, { hp: 50 });
    act(s, new Ctx(), u);
    expect(u.col).toBe(1);
    expect(e.hp).toBeLessThan(50);
  });
  it('arqueiro para de andar assim que tem alvo no alcance', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('aiko', 1, 2), 'player', 2, 0);
    placeUnit(s, c('riku'), 'enemy', 2, 5, { hp: 50 });
    act(s, new Ctx(), u);
    expect(u.col).toBe(1);
  });
  it('corte diagonal ataca na diagonal à frente', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('nara'), 'player', 2, 3);
    const e = placeUnit(s, c('riku'), 'enemy', 3, 4);
    expect(findTarget(s, u)).toBe(e);
  });
  it('unidade comum NÃO ataca na diagonal', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('riku'), 'player', 2, 3);
    placeUnit(s, c('riku'), 'enemy', 3, 4);
    expect(findTarget(s, u)).toBeNull();
  });
  it('golpe reverso ataca na diagonal para trás', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('toru'), 'player', 2, 5);
    const e = placeUnit(s, c('riku'), 'enemy', 1, 4);
    expect(findTarget(s, u)).toBe(e);
  });
  it('tiro perfurante atinge o último inimigo da fileira', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('lyra', 1, 2), 'player', 0, 0);
    placeUnit(s, c('riku'), 'enemy', 0, 3);
    const last = placeUnit(s, c('riku'), 'enemy', 0, 8);
    expect(findTarget(s, u)).toBe(last);
  });
  it('emboscada atinge a retaguarda (mais recuado) em qualquer fileira', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('zarek', 1, 3), 'player', 0, 0);
    placeUnit(s, c('riku'), 'enemy', 0, 4);
    const back = placeUnit(s, c('riku'), 'enemy', 4, 8);
    expect(findTarget(s, u)).toBe(back);
  });
  it('instinto predador atinge o inimigo com menos vida', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('yume', 1, 3), 'player', 0, 0);
    placeUnit(s, c('gorath'), 'enemy', 0, 4);
    const weak = placeUnit(s, c('riku'), 'enemy', 3, 7, { hp: 2 });
    expect(findTarget(s, u)).toBe(weak);
  });
  it('ataca o herói inimigo quando chega ao alcance', () => {
    const s = emptyBattle();
    const u = placeUnit(s, c('riku'), 'player', 0, 7);
    act(s, new Ctx(), u);
    expect(s.heroes.enemy.hp).toBe(30 - u.atk);
  });
});

describe('habilidades únicas', () => {
  it('Prole Sombria: ao derrotar, surge uma cria (1 de vida, ataque mágico à distância)', () => {
    const s = emptyBattle();
    const v = placeUnit(s, c('vorax', 1, 4), 'player', 2, 3);
    placeUnit(s, c('riku'), 'enemy', 2, 4, { hp: 1 });
    act(s, new Ctx(), v);
    const cria = s.units.find((u) => u.charId === 'cria');
    expect(cria).toBeTruthy();
    expect(cria!.side).toBe('player');
    expect(cria!.hp).toBe(1);
    expect(cria!.atk).toBe(2);
    expect(cria!.damageType).toBe('magico');
    expect([cria!.row, cria!.col]).toEqual([2, 4]);
  });
  it('crias que derrotam alguém geram novas crias', () => {
    const s = emptyBattle();
    const cria = placeUnit(s, c('cria'), 'player', 1, 2, { minion: true, atk: 2, hp: 1 });
    placeUnit(s, c('riku'), 'enemy', 1, 5, { hp: 1 });
    act(s, new Ctx(), cria);
    expect(s.units.filter((u) => u.charId === 'cria')).toHaveLength(2);
  });
  it('ataque da cria escala com o nível do invocador', () => {
    const s = emptyBattle();
    const v = placeUnit(s, c('vorax', 21, 4), 'player', 2, 3);
    placeUnit(s, c('riku'), 'enemy', 2, 4, { hp: 1 });
    act(s, new Ctx(), v);
    expect(s.units.find((u) => u.charId === 'cria')!.atk).toBe(4);
  });
  it('Punho Espelhado: contra-ataca em dobro e empurra o agressor físico de frente', () => {
    const s = emptyBattle();
    const k = placeUnit(s, c('kenji', 1, 4), 'enemy', 2, 5, { atk: 3, hp: 50 });
    const a = placeUnit(s, c('nara'), 'player', 2, 4, { atk: 2, hp: 20 });
    act(s, new Ctx(), a);
    expect(a.hp).toBe(20 - 6);
    expect(a.col).toBe(3);
    expect(k.hp).toBe(50 - 1); // 2 de ataque - 1 de resistência física
  });
  it('Punho Espelhado não reage a dano mágico', () => {
    const s = emptyBattle();
    placeUnit(s, c('kenji', 1, 4), 'enemy', 2, 5, { hp: 50 });
    const m = placeUnit(s, c('lyra', 1, 2), 'player', 2, 4, { hp: 20 });
    act(s, new Ctx(), m);
    expect(m.hp).toBe(20);
  });
  it('Punho Espelhado não reage a ataque pelas costas', () => {
    const s = emptyBattle();
    placeUnit(s, c('kenji', 1, 4), 'enemy', 2, 5, { hp: 50 });
    const t = placeUnit(s, c('toru'), 'player', 1, 6, { hp: 20 });
    act(s, new Ctx(), t);
    expect(t.hp).toBe(20);
  });
  it('Sifão de Energia reduz o ataque de todos os inimigos', () => {
    const s = emptyBattle();
    const a = placeUnit(s, c('riku'), 'player', 0, 0, { atk: 4 });
    const b = placeUnit(s, c('nara'), 'player', 4, 0, { atk: 3 });
    expect(effectiveAtk(s, a)).toBe(4);
    placeUnit(s, c('nyx', 1, 4), 'enemy', 2, 8);
    expect(effectiveAtk(s, a)).toBe(3);
    expect(effectiveAtk(s, b)).toBe(2);
  });
  it('Sifão com 6★ reduz 2', () => {
    const s = emptyBattle();
    const a = placeUnit(s, c('riku'), 'player', 0, 0, { atk: 4 });
    placeUnit(s, c('nyx', 1, 6), 'enemy', 2, 8);
    expect(effectiveAtk(s, a)).toBe(2);
  });
});

describe('fluxo de batalha', () => {
  it('invocar gasta energia e só vale na zona de invocação', () => {
    const s = createBattle({ playerDeck: [c('riku'), c('nara'), c('toru'), c('riku')], enemyDeck: [c('riku')], playerHeroHp: 30, enemyHeroHp: 30, seed: 3 });
    expect(s.energy.player).toBe(3);
    const idx = s.decks.player.hand.findIndex((x) => x.charId === 'riku' || x.charId === 'nara');
    expect(deploy(s, 'player', idx, 0, 5).ok).toBe(false);
    expect(deploy(s, 'player', idx, 0, 1).ok).toBe(true);
    expect(s.energy.player).toBe(1);
  });
  it('carta de unidade derrotada volta para o baralho', () => {
    const s = emptyBattle();
    const a = placeUnit(s, c('riku'), 'player', 0, 3, { atk: 9 });
    placeUnit(s, c('nara'), 'enemy', 0, 4, { hp: 1 });
    resolveSide(s, new Ctx(), 'player');
    expect(s.decks.enemy.draw.some((x) => x.charId === 'nara')).toBe(true);
    expect(a.hp).toBeGreaterThan(0);
  });
  it('vitória ao zerar a vida do herói inimigo', () => {
    const s = createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 2, seed: 1 });
    placeUnit(s, c('riku'), 'player', 0, 8);
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
