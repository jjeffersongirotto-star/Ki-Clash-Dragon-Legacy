import { beforeEach, describe, expect, it } from 'vitest';
import { Ctx, applyDamage, attack, createBattle, placeUnit } from '../../src/core/battle';
import { BALANCE_V2 } from '../../src/core/balanceV2';
import { PLAYABLE, abilitiesAt, getChar } from '../../src/core/characters';
import { cardHTML } from '../../src/ui/components';
import { defaultSave, loadSave } from '../../src/ui/save';
import type { BattleState, CardInstance } from '../../src/core/types';

const KEY = 'kicdl-save-v1';
const c = (id: string, stars = getChar(id).minStars): CardInstance => ({ charId: id, stars });
const empty = (): BattleState => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });
const total = (id: string, r: number) => BALANCE_V2[id].stats[r][0] + BALANCE_V2[id].stats[r][1];

describe('v0.63.0 — trocas de raridade, Regra de Origem, Espera e habilidades novas', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    (globalThis as unknown as { localStorage: Storage }).localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    } as Storage;
  });

  it('trocas de vaga pedidas pelo jogador', () => {
    const range = (id: string) => [getChar(id).minStars, getChar(id).maxStars];
    expect(range('hayato')).toEqual([6, 6]);
    expect(range('aya')).toEqual([5, 6]);
    expect(range('daisuke')).toEqual([5, 6]);
    expect(range('rin')).toEqual([2, 4]);
    expect(range('zarek')).toEqual([6, 6]);
    expect(range('nhyra')).toEqual([4, 6]);
    expect(range('zynna')).toEqual([3, 5]);
    expect(range('trokk')).toEqual([5, 6]);
    expect(range('ghor')).toEqual([6, 6]);
    expect(range('thane')).toEqual([4, 6]);
    expect([range('wex'), range('lamenta'), range('nocturna'), range('pira'), range('vorax')]).toEqual([[1, 4], [2, 4], [4, 6], [5, 6], [6, 6]]);
    expect(getChar('ysmera').category).toBe('suporte');
    expect(getChar('odo').category).toBe('suporte');
    expect(getChar('kael').category).toBe('dps');
    expect(getChar('kael').abilities).not.toContain('longoAlcance');
    expect(getChar('vesna').category).toBe('arqueiro');
  });

  it('Regra de Origem: na mesma raça e função, quem nasce acima tem +1 ou mais em cada raridade', () => {
    // os exemplos do jogador
    expect(total('akemi', 3)).toBeGreaterThan(total('riku', 3));
    expect(total('masao', 4)).toBeGreaterThan(total('akemi', 4));
    for (const a of PLAYABLE)
      for (const b of PLAYABLE) {
        if (a.race !== b.race || a.category !== b.category || a.minStars >= b.minStars) continue;
        if (BALANCE_V2[a.id].manual || BALANCE_V2[b.id].manual) continue; // v0.64.5: ajustadas à mão pelo jogador
        for (let r = b.minStars; r <= Math.min(a.maxStars, b.maxStars); r++) expect(total(b.id, r), `${b.id} > ${a.id} @${r}`).toBeGreaterThan(total(a.id, r));
      }
    // todos crescem +1 por raridade
    for (const d of PLAYABLE.filter((x) => !BALANCE_V2[x.id].manual)) for (let r = d.minStars + 1; r <= d.maxStars; r++) expect(total(d.id, r) - total(d.id, r - 1), d.id).toBe(1);
  });

  it('Espera pela força: até 6, e 7–8 só para quem nasce Mítico', () => {
    for (const d of PLAYABLE) {
      expect(d.wait!, d.id).toBeGreaterThanOrEqual(1);
      expect(d.wait!, d.id).toBeLessThanOrEqual(d.minStars >= 6 ? 8 : 6);
    }
    expect(getChar('zarek').wait).toBe(5); // v0.65.2: ajustado pelo jogador
    expect(getChar('zynna').wait).toBeLessThan(7);
    expect(getChar('velka').wait).toBeLessThanOrEqual(3);
  });

  it('habilidades: Épico/Lendário ganham +1 ao subir; Mítico tem 3', () => {
    expect(abilitiesAt(getChar('ryuji'), 4)).not.toContain('contraCrescente');
    expect(abilitiesAt(getChar('ryuji'), 5)).toContain('contraCrescente');
    for (const d of PLAYABLE.filter((x) => x.minStars >= 6 && !BALANCE_V2[x.id].manual)) expect(d.abilities.filter((a) => a !== 'longoAlcance').length, d.id).toBeGreaterThanOrEqual(3);
    // a unidade em campo só tem o que já foi desbloqueado
    const s = empty();
    expect(placeUnit(s, c('ryuji', 4), 'player', 0, 0).abilities).not.toContain('contraCrescente');
    expect(placeUnit(s, c('ryuji', 6), 'player', 1, 0).abilities).toContain('contraCrescente');
    // a carta mostra a habilidade bloqueada apagada
    expect(cardHTML(c('ryuji', 4))).toContain('ck-ab lk');
    expect(cardHTML(c('ryuji', 5))).not.toContain('ck-ab lk');
  });

  it('Contra-ataque Crescente: golpeia antes, ganha +1 de ataque por contra-ataque e empurra 2 casas', () => {
    const s = empty();
    const d = placeUnit(s, c('ryuji', 5), 'enemy', 0, 6, { atk: 3, hp: 50 });
    const a = placeUnit(s, c('riku'), 'player', 0, 5, { atk: 2, hp: 3 });
    attack(s, new Ctx(), a, d);
    // golpe antes: Riku (3 de vida) cai e não chega a bater
    expect(a.hp).toBeLessThanOrEqual(0);
    expect(d.hp).toBe(50);
    expect(d.atkMod).toBe(2); // +1 do contra-ataque e +1 da Fúria (derrubou o Riku)
    const b = placeUnit(s, c('toru'), 'player', 0, 5, { atk: 2, hp: 40 });
    attack(s, new Ctx(), b, d);
    expect(d.atkMod).toBe(3); // sem limite: soma a cada contra-ataque
    expect(d.hp).toBeLessThan(50); // o agressor bate depois
    expect(b.col).toBe(3); // empurrado 2 casas
  });

  it('Casca Reativa (sem limite) e Pulso Vital', () => {
    const s = empty();
    const t = placeUnit(s, c('titanx'), 'player', 0, 3, { hp: 60 });
    const src = { side: 'enemy' as const, unit: placeUnit(s, c('riku'), 'enemy', 0, 9) };
    const r0 = t.physRes;
    for (let i = 0; i < 5; i++) applyDamage(s, new Ctx(), t, 10, 'fisico', src);
    expect(t.physRes).toBe(r0 + 5);
    const g = placeUnit(s, c('grendar', 6), 'player', 1, 5, { hp: 60 });
    const ally = placeUnit(s, c('riku'), 'player', 1, 4, { hp: 3 });
    const far = placeUnit(s, c('riku'), 'player', 1, 1, { hp: 3 });
    applyDamage(s, new Ctx(), g, 2, 'fisico', src);
    expect([ally.hp, ally.maxHp]).toEqual([4, 4]);
    expect(far.hp).toBe(3);
  });

  it('save antigo: quem subiu de raridade vai para a nova mínima; quem desceu volta ao topo com reembolso', () => {
    const s = defaultSave();
    s.cards = { kael: { stars: 2, plus: 1, xp: 0 }, aya: { stars: 6, plus: 2, xp: 0 }, riku: { stars: 1, plus: 0, xp: 0 } } as never;
    s.dupes = { kael: { 1: 2 } };
    delete (s as { v63?: boolean }).v63;
    localStorage.setItem(KEY, JSON.stringify(s));
    const l = loadSave();
    expect(l.cards.kael.stars).toBe(6);
    expect(l.cards.aya.stars).toBe(6); // Aya vai até Mítico (Lendário → Mítico)
    expect(l.dupes!.kael[6]).toBe(2);
    expect(l.v63).toBe(true);
  });
});
