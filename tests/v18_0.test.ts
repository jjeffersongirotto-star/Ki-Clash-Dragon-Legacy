import { describe, expect, it } from 'vitest';
import { createBattle, deployCells, spellTargets, waitOf } from '../src/core/battle';
import { ENEMY_SPELLS, STAGES } from '../src/core/campaign';
import { getChar } from '../src/core/characters';
import { claimOf, playerAuto, playerEndTurn, playerUse, replayMatch, verifyMatch } from '../src/core/match';
import { getSpell, isSpell } from '../src/core/spells';
import type { BattleState, CardInstance, MatchRecord } from '../src/core/types';

const c = (id: string): CardInstance => ({ charId: id, stars: getChar(id).minStars });
const myDeck: CardInstance[] = [
  ...['riku', 'nara', 'toru', 'daichi', 'sora', 'tobi', 'kael', 'suri', 'hana', 'jin'].map((id) => c(id)),
  { charId: 'f-chuva', stars: 1, copies: 2 },
  { charId: 'f-giratoria', stars: 1, copies: 2 },
];

/** joga uma partida inteira: no Auto, ou "à mão" (primeira carta pronta na primeira casa válida). */
function play(stage: number, seed: number, mode: 'auto' | 'mao' | 'misto'): BattleState {
  const st = STAGES[stage];
  const s = createBattle({ playerDeck: myDeck, enemyDeck: st.enemyDeck, playerHeroHp: 60, enemyHeroHp: st.enemyHeroHp, seed });
  for (let guard = 0; guard < 200 && !s.winner; guard++) {
    const manual = mode === 'mao' || (mode === 'misto' && s.turn % 2 === 0);
    if (!manual) playerAuto(s);
    else
      for (let k = 0; k < 6; k++) {
        const i = s.decks.player.hand.findIndex((h) => !waitOf(h) && (isSpell(h.charId) ? spellTargets(s, 'player', h.charId).length : deployCells(s, 'player').length));
        if (i < 0) break;
        const h = s.decks.player.hand[i];
        const [r, col] = isSpell(h.charId) ? spellTargets(s, 'player', h.charId)[0] : deployCells(s, 'player')[0];
        if (!playerUse(s, i, r, col).ok) break;
      }
    playerEndTurn(s);
  }
  return s;
}

describe('v0.18.0 — partidas verificáveis (gravar, refazer e conferir)', () => {
  it('a gravação guarda a semente INICIAL e as jogadas do jogador', () => {
    const s = play(0, 123, 'mao');
    expect(s.record!.setup.seed).toBe(123);
    expect(s.seed).not.toBe(123);
    expect(s.record!.actions.some((a) => a.t === 'use')).toBe(true);
    // cada LUTAR gravado é um turno jogado (o último pode terminar a partida antes de virar o turno)
    expect(s.record!.actions.filter((a) => a.t === 'end').length).toBeGreaterThanOrEqual(s.turn - 1);
  });
  for (const mode of ['auto', 'mao', 'misto'] as const)
    it(`refazer a partida (${mode}) chega exatamente ao mesmo resultado, em várias fases e sementes`, () => {
      for (const stage of [0, 4, 9])
        for (const seed of [1, 77, 4242]) {
          const s = play(stage, seed, mode);
          expect(s.winner).not.toBeNull();
          const record: MatchRecord = JSON.parse(JSON.stringify(s.record));
          const r = replayMatch(record);
          expect(r.error).toBeUndefined();
          expect(claimOf(r.state)).toEqual(claimOf(s));
          expect(r.state.log).toEqual(s.log);
          expect(verifyMatch(record, claimOf(s))).toEqual({ ok: true });
        }
    });
  it('resultado adulterado não confere', () => {
    const s = play(4, 9, 'auto');
    const claim = claimOf(s);
    const fake = { ...claim, winner: claim.winner === 'player' ? 'enemy' : 'player' } as const;
    const res = verifyMatch(s.record!, fake);
    expect(res.ok).toBe(false);
    expect(verifyMatch(s.record!, { ...claim, enemyHp: claim.enemyHp + 1 }).ok).toBe(false);
  });
  it('gravação adulterada não confere: jogada inválida, baralho trocado, jogada depois do fim', () => {
    const s = play(0, 5, 'mao');
    const claim = claimOf(s);
    const badMove: MatchRecord = JSON.parse(JSON.stringify(s.record));
    const i = badMove.actions.findIndex((a) => a.t === 'use');
    badMove.actions[i] = { t: 'use', hand: 0, row: 0, col: 11 };
    const r1 = verifyMatch(badMove, claim);
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.reason).toContain('inválida');
    const strongDeck: MatchRecord = JSON.parse(JSON.stringify(s.record));
    strongDeck.setup.playerDeck = strongDeck.setup.playerDeck.map((x) => ({ ...x, stars: 6, plus: 2 }));
    expect(verifyMatch(strongDeck, claim).ok).toBe(false);
    const extra: MatchRecord = JSON.parse(JSON.stringify(s.record));
    extra.actions.push({ t: 'end' });
    const r3 = verifyMatch(extra, claim);
    expect(r3.ok).toBe(false);
    if (!r3.ok) expect(r3.reason).toContain('depois do fim');
  });
  it('jogada recusada não é gravada', () => {
    const s = createBattle({ playerDeck: myDeck, enemyDeck: STAGES[0].enemyDeck, playerHeroHp: 30, enemyHeroHp: 30, seed: 3 });
    expect(playerUse(s, 0, 0, 11).ok).toBe(false);
    expect(s.record!.actions).toEqual([]);
  });
});

describe('v0.18.0 — a IA inimiga usa feitiços', () => {
  it('as fases com feitiços têm 30 personagens + 2 cópias de cada feitiço, sempre com conjurador da categoria', () => {
    STAGES.forEach((st, i) => {
      const spells = st.enemyDeck.filter((x) => isSpell(x.charId));
      expect(spells.map((x) => x.charId)).toEqual(ENEMY_SPELLS[i]);
      for (const sp of spells) {
        expect(sp.copies).toBe(2);
        expect(st.enemyDeck.some((x) => !isSpell(x.charId) && getSpell(sp.charId).categories.includes(getChar(x.charId).category))).toBe(true);
      }
    });
    expect(STAGES[0].enemyDeck.some((x) => isSpell(x.charId))).toBe(false);
    expect(STAGES[9].enemyDeck.filter((x) => isSpell(x.charId))).toHaveLength(2); // v0.28.0: 2 feitiços (antes 3)
  });
  it('na fase 10 o inimigo lança feitiços durante a partida', () => {
    let casts = 0;
    for (const seed of [1, 2, 3, 4, 5]) {
      const st = STAGES[9];
      const s = createBattle({ playerDeck: myDeck, enemyDeck: st.enemyDeck, playerHeroHp: 200, enemyHeroHp: 200, seed });
      for (let g = 0; g < 30 && !s.winner; g++) {
        playerAuto(s);
        casts += playerEndTurn(s).filter((e) => e.type === 'cast' && e.side === 'enemy').length;
      }
    }
    expect(casts).toBeGreaterThan(0);
  });
});
