import { describe, expect, it } from 'vitest';
import { act, attack, createBattle, Ctx, effectiveAtk, findTarget, makeUnit, placeUnit, rangeOf } from '../../src/core/battle';
import { ABILITIES, abilityPower, AURA_CAP, MINION_CAP, RES_CAP } from '../../src/core/abilities';
import { CATEGORY_INFO, PLAYABLE, STAR_COLORS, getChar } from '../../src/core/characters';
import { statsFor } from '../../src/core/progression';
import type { BattleState, CardInstance } from '../../src/core/types';

const c = (charId: string, _level = 1, stars = 1, plus = 0): CardInstance => ({ charId, stars, plus });
const empty = (): BattleState => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1, cols: 7 /* arena compacta de teste: mesmas regras */ });

describe('sem passo da vitória (v0.15.0)', () => {
  it('quem derrota NÃO avança, mesmo com a casa livre', () => {
    const s = empty();
    const u = placeUnit(s, c('toru'), 'player', 0, 2, { atk: 9 });
    placeUnit(s, c('nara'), 'enemy', 0, 3, { hp: 1 });
    act(s, new Ctx(), u);
    expect(s.units.filter((x) => x.side === 'enemy')).toHaveLength(0);
    expect(u.col).toBe(2);
  });
  it('não avança se a casa estiver ocupada', () => {
    const s = empty();
    const a = placeUnit(s, c('aiko', 1, 2), 'player', 0, 1, { atk: 9 });
    placeUnit(s, c('gorath'), 'player', 0, 2);
    placeUnit(s, c('nara'), 'enemy', 0, 3, { hp: 1 });
    act(s, new Ctx(), a);
    expect(a.col).toBe(1);
  });
  it('à distância também não avança ao derrotar', () => {
    const s = empty();
    const l = placeUnit(s, c('lyra', 1, 5), 'player', 1, 1, { atk: 9 });
    placeUnit(s, c('riku'), 'enemy', 1, 3, { hp: 1 });
    placeUnit(s, c('riku'), 'enemy', 1, 4, { hp: 1 });
    act(s, new Ctx(), l);
    expect(s.units.filter((u) => u.side === 'enemy')).toHaveLength(0);
    expect(l.col).toBe(1);
  });
});

describe('longo alcance = 4 casas (v0.16.0), alvo mais próximo', () => {
  it('ranged têm alcance 4 e corpo a corpo 1', () => {
    const s = empty();
    for (const d of PLAYABLE) {
      const u = makeUnit(s, c(d.id, 1, d.minStars), 'player', 0, 0);
      const ranged = d.category === 'mago' || d.category === 'arqueiro' || d.abilities.includes('longoAlcance');
      expect(rangeOf(u)).toBe(ranged ? 4 : 1);
    }
  });
  it('atinge até 4 casas, não 5', () => {
    const s = empty();
    const u = placeUnit(s, c('aiko', 1, 2), 'player', 1, 0);
    const e = placeUnit(s, c('riku'), 'enemy', 1, 4);
    expect(findTarget(s, u)).toBe(e);
    e.col = 5;
    expect(findTarget(s, u)).toBeNull();
  });
  it('escolhe o inimigo mais próximo no alcance', () => {
    const s = empty();
    const u = placeUnit(s, c('aiko', 1, 2), 'player', 0, 1);
    placeUnit(s, c('riku'), 'enemy', 0, 4, { hp: 1 });
    const near = placeUnit(s, c('gorath'), 'enemy', 0, 2);
    expect(findTarget(s, u)).toBe(near);
  });
  it('não avança após atacar e para assim que tem alvo', () => {
    const s = empty();
    const u = placeUnit(s, c('aiko', 1, 2), 'player', 1, 0);
    placeUnit(s, c('gorath'), 'enemy', 1, 5, { hp: 50 });
    act(s, new Ctx(), u);
    expect(u.col).toBe(1);
  });
  it('herói (coluna virtual) é atingido a 4 casas: da coluna 4 de 7 (índice 3)', () => {
    const s = empty();
    const u = placeUnit(s, c('lyra', 1, 2), 'player', 0, 3);
    expect(findTarget(s, u)).toBe('hero');
    u.col = 2;
    expect(findTarget(s, u)).toBeNull();
  });
  it('unidade inimiga no alcance tem prioridade sobre o herói', () => {
    const s = empty();
    const u = placeUnit(s, c('aiko', 1, 2), 'player', 0, 5);
    const e = placeUnit(s, c('riku'), 'enemy', 0, 6);
    expect(findTarget(s, u)).toBe(e);
  });
});

describe('só a própria fileira (exceto diagonais)', () => {
  it('ninguém sem habilidade diagonal ataca a outra fileira', () => {
    for (const d of PLAYABLE) {
      if (d.abilities.includes('diagFrente') || d.abilities.includes('diagTras')) continue;
      const s = empty();
      const u = placeUnit(s, c(d.id, 1, d.minStars), 'player', 0, 2);
      for (let col = 0; col < 7; col++) placeUnit(s, c('riku'), 'enemy', 1, col, { hp: 1 });
      expect(findTarget(s, u)).toBeNull();
    }
  });
  it('Emboscada (Zarek): o mais distante da fileira até 2 casas', () => {
    const s = empty();
    const z = placeUnit(s, c('zarek', 1, 3), 'player', 0, 2);
    placeUnit(s, c('riku'), 'enemy', 0, 3);
    const far = placeUnit(s, c('riku'), 'enemy', 0, 4);
    placeUnit(s, c('riku'), 'enemy', 0, 5);
    expect(findTarget(s, z)).toBe(far);
  });
  it('Emboscada perfura resistência conforme estrelas', () => {
    const s = empty();
    const z = placeUnit(s, c('zarek', 1, 5), 'player', 0, 2, { atk: 4 });
    const g = placeUnit(s, c('gorath', 1, 2), 'enemy', 0, 3, { hp: 50 });
    attack(s, new Ctx(), z, g);
    expect(g.hp).toBe(50 - 4); // resist. 2 totalmente perfurada (perfura 3)
  });
  it('Instinto Predador (Yume): menor vida da fileira até 2 casas + execução', () => {
    const s = empty();
    const y = placeUnit(s, c('yume', 1, 3), 'player', 0, 2, { atk: 4 });
    placeUnit(s, c('gorath'), 'enemy', 0, 3, { hp: 20 });
    const weak = placeUnit(s, c('riku'), 'enemy', 0, 4, { hp: 10 });
    expect(findTarget(s, y)).toBe(weak);
    weak.hp = 5; // metade da vida
    attack(s, new Ctx(), y, weak);
    expect(weak.hp).toBe(5 - 5); // 4 + execução 1 (3★)
  });
  it('Feixe Perfurante (Lyra): acerta o mais próximo e os de trás na fileira', () => {
    const s = empty();
    const l = placeUnit(s, c('lyra', 1, 2), 'player', 0, 1, { atk: 4 });
    const a = placeUnit(s, c('gorath'), 'enemy', 0, 2, { hp: 50 });
    const b = placeUnit(s, c('gorath'), 'enemy', 0, 4, { hp: 50 });
    const other = placeUnit(s, c('gorath'), 'enemy', 1, 2, { hp: 50 });
    const far = placeUnit(s, c('gorath'), 'enemy', 0, 6, { hp: 50 });
    act(s, new Ctx(), l);
    expect(a.hp).toBe(46);
    expect(b.hp).toBe(48); // 50% (2★)
    expect(other.hp).toBe(50);
    expect(far.hp).toBe(50); // fora do alcance 4
  });
  it('Corte Diagonal 3★+ também corta a diagonal ao bater em frente', () => {
    const s = empty();
    const n = placeUnit(s, c('nara', 1, 4), 'player', 0, 2, { atk: 4 });
    const f = placeUnit(s, c('gorath'), 'enemy', 0, 3, { hp: 50 });
    const dg = placeUnit(s, c('riku'), 'enemy', 1, 3, { hp: 50 });
    act(s, new Ctx(), n);
    expect(f.hp).toBeLessThan(50);
    expect(dg.hp).toBe(48); // v0.15.1: 50% máx. (ceil(4 × 50%) = 2)
    const s2 = empty();
    const n2 = placeUnit(s2, c('nara', 1, 1), 'player', 0, 2, { atk: 4 });
    placeUnit(s2, c('gorath'), 'enemy', 0, 3, { hp: 50 });
    const dg2 = placeUnit(s2, c('riku'), 'enemy', 1, 3, { hp: 50 });
    act(s2, new Ctx(), n2);
    expect(dg2.hp).toBe(50);
  });
});

describe('habilidades por estrela/nível (com teto)', () => {
  it('toda habilidade com power respeita teto ao máximo', () => {
    expect(abilityPower('salto', 6, 99)).toBeLessThanOrEqual(3);
    expect(abilityPower('flechaDupla', 6, 99)).toBeLessThanOrEqual(3);
    expect(abilityPower('retaguarda', 6, 99)).toBeLessThanOrEqual(3);
    expect(abilityPower('menorVida', 6, 99)).toBeLessThanOrEqual(3);
    expect(abilityPower('lotus', 6, 99)).toBeLessThanOrEqual(4);
    expect(abilityPower('contraGolpe', 6, 99)).toBeLessThanOrEqual(2.5);
    expect(abilityPower('sifao', 6, 99)).toBeLessThanOrEqual(AURA_CAP);
  });
  it('habilidades crescem com estrelas', () => {
    expect(abilityPower('flechaDupla', 3, 0)).toBeGreaterThan(abilityPower('flechaDupla', 2, 0));
    expect(abilityPower('contraGolpe', 6, 0)).toBeGreaterThan(abilityPower('contraGolpe', 4, 0));
    expect(abilityPower('perfurante', 5, 0)).toBeGreaterThan(abilityPower('perfurante', 2, 0));
    expect(abilityPower('lotus', 4, 0)).toBeGreaterThan(abilityPower('lotus', 2, 0));
  });
  it('resistência nunca passa de 3 (dano mínimo 1 sempre)', () => {
    const s = empty();
    const g = makeUnit(s, c('gorath', 50, 5), 'player', 0, 0);
    expect(g.physRes).toBeLessThanOrEqual(RES_CAP);
    const t = makeUnit(s, c('toru', 50, 5), 'player', 0, 0);
    expect(t.physRes).toBe(3);
  });
  it('Sifão: −1 (4★), −2 (5★), total limitado a 2 mesmo com vários Nyx', () => {
    const s = empty();
    const a = placeUnit(s, c('riku'), 'player', 0, 0, { atk: 6 });
    placeUnit(s, c('nyx', 1, 4), 'enemy', 1, 6);
    expect(effectiveAtk(s, a)).toBe(5);
    placeUnit(s, c('nyx', 1, 5), 'enemy', 0, 6);
    placeUnit(s, c('nyx', 1, 5), 'enemy', 1, 5);
    expect(effectiveAtk(s, a)).toBe(4);
  });
  it('Flecha Dupla: 2ª flecha a partir de 3★ (escala com estrelas)', () => {
    const s = empty();
    const a = placeUnit(s, c('aiko', 1, 4), 'player', 0, 1, { atk: 3 });
    const e = placeUnit(s, c('gorath'), 'enemy', 0, 3, { hp: 50 });
    e.physRes = 0;
    act(s, new Ctx(), a);
    expect(e.hp).toBe(50 - 3 - abilityPower('flechaDupla', 4, 0));
    expect(abilityPower('flechaDupla', 2, 0)).toBe(1);
    expect(abilityPower('flechaDupla', 2, 2)).toBe(1);
    // v0.23.0: o +1 do antigo nível 25 vem junto com o Raro (todo Raro já passava do nível 25)
    expect(abilityPower('flechaDupla', 3, 0)).toBe(3);
    expect(abilityPower('flechaDupla', 4, 0)).toBe(3);
  });
  it('Bênção do Lótus cura aliados vizinhos (inclusive outra fileira)', () => {
    const s = empty();
    const m = placeUnit(s, c('mei', 1, 2), 'player', 0, 1);
    const a = placeUnit(s, c('gorath'), 'player', 1, 2, { hp: 10 });
    a.hp = 5;
    const far = placeUnit(s, c('gorath'), 'player', 1, 4, { hp: 10 });
    far.hp = 5;
    act(s, new Ctx(), m);
    expect(a.hp).toBe(7);
    expect(far.hp).toBe(5);
  });
  it('Punho Espelhado ×2 em 4★: contra-ataca e empurra', () => {
    const s = empty();
    const k = placeUnit(s, c('kenji', 1, 4), 'enemy', 1, 5, { atk: 3, hp: 50 });
    const a = placeUnit(s, c('nara'), 'player', 1, 4, { atk: 2, hp: 20 });
    act(s, new Ctx(), a);
    expect(a.hp).toBe(20 - 6);
    expect(a.col).toBe(3);
    expect(k.hp).toBe(50 - 2); // v0.17: Kenji não tem mais resistência física de atributo
  });
  it('Prole Sombria: cria maga com vida pelas estrelas; máximo 3 por lado', () => {
    const s = empty();
    const v = placeUnit(s, c('vorax', 1, 5), 'player', 1, 1, { atk: 9 });
    placeUnit(s, c('riku'), 'enemy', 1, 3, { hp: 1 });
    act(s, new Ctx(), v);
    const cria = s.units.find((u) => u.charId === 'cria')!;
    expect(cria.hp).toBe(1);
    expect(cria.damageType).toBe('magico');
    expect(rangeOf(cria)).toBe(2);
    expect(cria.atk).toBe(2);
    for (let i = 0; i < 5; i++) {
      v.col = 1;
      placeUnit(s, c('riku'), 'enemy', 1, 3, { hp: 1 });
      act(s, new Ctx(), v);
    }
    expect(s.units.filter((u) => u.charId === 'cria').length).toBeLessThanOrEqual(MINION_CAP);
  });
  it('Cria Sombria: ataque 2 com Vorax 5★ e 3 com Vorax 6★', () => {
    for (const [stars, atk, hp] of [[5, 2, 1], [6, 3, 2]]) {
      const s = empty();
      const v = placeUnit(s, c('vorax', 60, stars), 'player', 1, 1, { atk: 9 });
      placeUnit(s, c('riku'), 'enemy', 1, 3, { hp: 1 });
      act(s, new Ctx(), v);
      const cria = s.units.find((u) => u.charId === 'cria')!;
      expect([cria.atk, cria.hp]).toEqual([atk, hp]);
    }
  });
  it('Cria Sombria: ataque mágico no inimigo mais próximo até 2 casas, só na própria fileira', () => {
    const s = empty();
    const cria = placeUnit(s, c('cria'), 'player', 0, 1, { minion: true, atk: 2, hp: 1 });
    const far = placeUnit(s, c('toru'), 'enemy', 0, 4, { hp: 30 });
    expect(findTarget(s, cria)).toBeNull();
    const near = placeUnit(s, c('toru'), 'enemy', 0, 3, { hp: 30 });
    placeUnit(s, c('toru'), 'enemy', 1, 2, { hp: 30 });
    expect(findTarget(s, cria)).toBe(near);
    act(s, new Ctx(), cria);
    expect(cria.col).toBe(1);
    expect(near.hp).toBe(30 - 2);
    expect(far.hp).toBe(30);
  });
  it('crias que derrotam alguém geram novas crias', () => {
    const s = empty();
    const cria = placeUnit(s, c('cria'), 'player', 1, 1, { minion: true, atk: 2, hp: 1 });
    placeUnit(s, c('riku'), 'enemy', 1, 4, { hp: 1 });
    act(s, new Ctx(), cria);
    expect(s.units.filter((u) => u.charId === 'cria')).toHaveLength(2);
  });
  it('unidade totalmente evoluída não é invencível: 6★ nv60 ainda morre para dano mínimo acumulado', () => {
    const s = empty();
    const k = placeUnit(s, c('kenji', 60, 6), 'player', 0, 3);
    expect(k.physRes).toBeLessThanOrEqual(3);
    const weakest = placeUnit(s, c('riku'), 'enemy', 0, 4, { atk: 1 });
    const before = k.hp;
    attack(s, new Ctx(), weakest, k);
    expect(k.hp).toBeLessThan(before);
  });
});

describe('categorias e cores', () => {
  it('todo personagem tem categoria válida e coerente', () => {
    for (const d of PLAYABLE) {
      expect(CATEGORY_INFO[d.category]).toBeTruthy();
      if (d.category === 'mago') expect(d.damageType).toBe('magico');
      if (d.category === 'arqueiro') expect(d.damageType).toBe('fisico');
      if (d.category === 'mago' || d.category === 'arqueiro') expect(d.abilities).toContain('longoAlcance');
    }
  });
  it('ranged têm menos vida; tanques mais vida e resistência e menos ataque', () => {
    const avg = (cat: string, f: (d: (typeof PLAYABLE)[number]) => number) => {
      const l = PLAYABLE.filter((d) => d.category === cat);
      return l.reduce((s, d) => s + f(d), 0) / l.length;
    };
    const hp = (d: (typeof PLAYABLE)[number]) => statsFor(d, 1, 1).hp;
    expect(avg('mago', hp)).toBeLessThan(avg('dps', hp));
    expect(avg('arqueiro', hp)).toBeLessThan(avg('dps', hp));
    expect(avg('tanque', hp)).toBeGreaterThan(avg('dps', hp));
    expect(avg('tanque', (d) => d.atk)).toBeLessThan(avg('dps', (d) => d.atk));
    // v0.17 (decisão 14): resistência só por habilidade — todo tanque tem uma
    expect(PLAYABLE.filter((d) => d.category === 'tanque').every((d) => d.abilities.some((a) => ABILITIES[a].resBonus))).toBe(true);
    expect(avg('assassino', hp)).toBeLessThan(avg('dps', hp));
  });
  it('cores por estrela: 1 cinza … 6 vermelho', () => {
    expect(Object.keys(STAR_COLORS)).toHaveLength(6);
    expect(STAR_COLORS[1].label).toBe('cinza');
    expect(STAR_COLORS[6].label).toBe('vermelho');
  });
  it('toda habilidade tem nome e descrição em pt-BR', () => {
    for (const a of Object.values(ABILITIES)) {
      expect(a.name.length).toBeGreaterThan(2);
      expect(a.description.length).toBeGreaterThan(10);
    }
    expect(getChar('mei').category).toBe('suporte');
  });
});
