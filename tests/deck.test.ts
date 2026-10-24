import { describe, expect, it } from 'vitest';
import {
  buildSlots,
  COPIES,
  createDeck,
  defeatCopy,
  drawOpening,
  drawStep,
  HAND_SIZE,
  inRotation,
  pileCount,
  playFromHand,
  totalCards,
  type DeckState,
} from '../src/core/deck';
import type { CardInstance } from '../src/core/types';

const IDS = ['riku', 'nara', 'toru', 'aiko', 'lyra', 'gorath', 'mei', 'yume', 'zarek', 'kenji'];
const team = (): CardInstance[] => IDS.map((charId) => ({ charId, level: 1, stars: 3 }));

/** Simula: a cada compra joga a carta mais antiga da mão (a mão nunca enche), e registra cada compra por grupo. */
function run(seed: number, steps: number, opts: { keepFull?: boolean } = {}) {
  const rng = { seed };
  const d = createDeck(team(), rng);
  drawOpening(d, rng);
  const history: number[][] = [[...d.hand.map((h) => h.slot)]];
  for (let i = 0; i < steps; i++) {
    if (!opts.keepFull) playFromHand(d, 0);
    history.push(drawStep(d, rng).map((h) => h.slot));
  }
  return { d, history };
}

/** compras (índices de compra) em que cada grupo veio */
function drawsOf(history: number[][], slot: number) {
  return history.flatMap((s, i) => (s.includes(slot) ? [i] : []));
}

describe('baralho: estrutura', () => {
  it('10 grupos × 4 cópias = 40; mão de 6', () => {
    const rng = { seed: 1 };
    const d = createDeck(team(), rng);
    expect(d.slots).toHaveLength(10);
    expect(totalCards(d)).toBe(40);
    drawOpening(d, rng);
    expect(d.hand).toHaveLength(HAND_SIZE);
    expect(new Set(d.hand.map((h) => h.slot)).size).toBe(6);
    expect(pileCount(d)).toBe(34);
  });
  it('equipe com menos de 10: grupos extras repetem a equipe em ordem', () => {
    const nine = team().slice(0, 9);
    const s = buildSlots(nine);
    expect(s).toHaveLength(10);
    expect(s[9].charId).toBe(nine[0].charId);
    expect(buildSlots([{ charId: 'riku', level: 1, stars: 1 }, { charId: 'nara', level: 1, stars: 1 }]).map((c) => c.charId)).toEqual(
      ['riku', 'nara', 'riku', 'nara', 'riku', 'nara', 'riku', 'nara', 'riku', 'nara'],
    );
    expect(buildSlots([])).toEqual([]);
  });
});

describe('baralho: fila de compra semi-aleatória', () => {
  it('exceção inicial: compras 1–4 trazem as 4 que ficaram fora da mão; as 6 iniciais voltam a partir da 5ª', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const { history } = run(seed, 12);
      const opening = new Set(history[0]);
      for (let k = 1; k <= 4; k++) expect(opening.has(history[k][0])).toBe(false);
      expect(new Set(history.slice(1, 5).flat()).size).toBe(4);
      // 5ª, 6ª e 7ª compras só podem trazer cartas da mão inicial (as outras ainda estão bloqueadas)
      for (let k = 5; k <= 7; k++) expect(opening.has(history[k][0])).toBe(true);
    }
  });
  it('as cartas iniciais ficam garantidas na 8ª compra, em fila (8ª, 9ª, 10ª...)', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const { history } = run(seed, 12);
      for (const slot of history[0]) {
        const again = drawsOf(history, slot)[1];
        expect(again).toBeGreaterThanOrEqual(5);
        expect(again).toBeLessThanOrEqual(10);
      }
    }
  });
  it('janela normal: bloqueada nas 6 compras seguintes, sorteável na 7ª–9ª, garantida até a 10ª (ou fila)', () => {
    const gaps: number[] = [];
    for (let seed = 1; seed <= 60; seed++) {
      const { history } = run(seed, 120);
      for (let slot = 0; slot < 10; slot++) {
        const ds = drawsOf(history, slot).filter((i) => i >= 1); // depois da exceção inicial
        for (let j = 1; j < ds.length; j++) gaps.push(ds[j] - ds[j - 1]);
      }
    }
    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(7);
    // com 1 compra por rodada e 10 grupos, a fila nunca atrasa muito
    expect(Math.max(...gaps)).toBeLessThanOrEqual(12);
  });
  it('a ordem é sorteada: partidas diferentes têm sequências diferentes', () => {
    const seqs = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) seqs.add(run(seed, 20).history.map((h) => h.map((x) => team()[x].charId)).join('|'));
    expect(seqs.size).toBeGreaterThan(20);
  });
  it('com grupos fora do rodízio (menos de 10), a janela 7–9 sorteia de verdade', () => {
    const gaps: number[] = [];
    for (let seed = 1; seed <= 40; seed++) {
      const rng = { seed };
      const d = createDeck(team().slice(0, 9).concat([{ charId: 'riku', level: 1, stars: 3 }]), rng);
      drawOpening(d, rng);
      // dois grupos perdem as 4 cópias logo no começo → 8 no rodízio
      for (const slot of [d.hand[0].slot, d.hand[1].slot]) d.slots[slot].defeated = COPIES;
      d.hand = d.hand.filter((h) => d.slots[h.slot].defeated < COPIES);
      const last: Record<number, number> = {};
      for (let i = 0; i < 80; i++) {
        // as unidades morrem logo: a cópia sai do campo (sem contar como derrotada, para manter o rodízio)
        for (const s of d.slots) s.onField = 0;
        if (d.hand.length >= HAND_SIZE) playFromHand(d, 0);
        for (const h of drawStep(d, rng)) {
          if (last[h.slot] != null && d.step > 12) gaps.push(d.step - last[h.slot]);
          last[h.slot] = d.step;
        }
        if (d.hand.length) playFromHand(d, 0);
      }
    }
    // quase sempre respeita o bloqueio (só fura quando não há nenhuma liberada)
    expect(gaps.filter((g) => g >= 7).length / gaps.length).toBeGreaterThan(0.9);
    expect(Math.max(...gaps)).toBeLessThanOrEqual(10);
    for (const g of [7, 8, 9]) expect(gaps).toContain(g);
  });
  it('garantida na 10ª compra se não veio na 7ª, 8ª e 9ª', () => {
    const rng = { seed: 3 };
    const d = createDeck(team(), rng);
    drawOpening(d, rng);
    for (let i = 0; i < 20; i++) {
      playFromHand(d, 0);
      drawStep(d, rng);
    }
    // força um grupo a ficar "esquecido": todos os outros acabaram de sair
    const target = d.slots[0];
    target.eligibleAt = d.step + 1;
    target.dueAt = d.step + 4;
    target.seq = -1;
    for (const s of d.slots.slice(1)) {
      s.eligibleAt = d.step + 1;
      s.dueAt = d.step + 50;
    }
    const got: number[] = [];
    for (let k = 1; k <= 4; k++) {
      playFromHand(d, 0);
      got.push(drawStep(d, rng)[0].slot);
      if (got[got.length - 1] === 0) break;
    }
    expect(got).toContain(0);
    expect(got.length).toBeLessThanOrEqual(4);
  });
  it('várias garantias vencidas ao mesmo tempo saem em fila, uma por compra (10ª, 11ª, 12ª)', () => {
    const rng = { seed: 9 };
    const d = createDeck(team(), rng);
    drawOpening(d, rng);
    d.step = 50;
    for (const s of d.slots) {
      s.eligibleAt = 999;
      s.dueAt = 999;
    }
    // três grupos ficaram garantidos na mesma compra; quem foi comprado antes sai antes
    [4, 7, 2].forEach((slot, i) => {
      d.slots[slot].dueAt = 51;
      d.slots[slot].eligibleAt = 48;
      d.slots[slot].seq = 4000 + i;
    });
    d.hand.length = 0;
    for (const s of d.slots) s.inHand = 0;
    const order = [drawStep(d, rng)[0].slot, drawStep(d, rng)[0].slot, drawStep(d, rng)[0].slot];
    expect(order).toEqual([4, 7, 2]);
  });
  it('uma compra que traz 2 cartas atende 2 garantias da fila', () => {
    const rng = { seed: 9 };
    const d = createDeck(team(), rng);
    drawOpening(d, rng);
    d.hand.length = 0;
    for (const s of d.slots) Object.assign(s, { inHand: 0, eligibleAt: 999, dueAt: 999 });
    d.step = 50;
    [1, 5, 8].forEach((slot, i) => Object.assign(d.slots[slot], { dueAt: 51, eligibleAt: 48, seq: 10 + i }));
    expect(drawStep(d, rng, 2).map((h) => h.slot)).toEqual([1, 5]);
    expect(drawStep(d, rng, 1).map((h) => h.slot)).toEqual([8]);
  });
  it('a fila conta da compra, não da jogada: ficar na mão não pausa o ciclo', () => {
    const rng = { seed: 4 };
    const d = createDeck(team(), rng);
    drawOpening(d, rng);
    const held = d.hand[d.hand.length - 1].slot; // nunca será jogada
    const at: number[] = [];
    for (let i = 0; i < 30; i++) {
      const idx = d.hand.findIndex((h) => h.slot !== held);
      playFromHand(d, idx >= 0 ? idx : 0);
      const got = drawStep(d, rng);
      if (got.some((h) => h.slot === held)) at.push(d.step);
    }
    // mesmo parada na mão desde a compra 0, ela volta a vir (2ª cópia) dentro da janela da exceção inicial
    expect(at[0]).toBeGreaterThanOrEqual(5);
    expect(at[0]).toBeLessThanOrEqual(10);
  });
  it('mão cheia: não compra e a fila não anda', () => {
    const rng = { seed: 2 };
    const d = createDeck(team(), rng);
    drawOpening(d, rng);
    expect(drawStep(d, rng)).toEqual([]);
    expect(d.step).toBe(0);
    playFromHand(d, 0);
    expect(drawStep(d, rng, 3)).toHaveLength(1); // só cabe 1
    expect(d.hand).toHaveLength(6);
  });
});

describe('baralho: derrotadas', () => {
  it('cópia derrotada sai para sempre; grupo com as 4 derrotadas sai do rodízio', () => {
    const rng = { seed: 7 };
    const d: DeckState = createDeck(team(), rng);
    drawOpening(d, rng);
    const slot = d.hand[0].slot;
    for (let k = 0; k < COPIES; k++) {
      // joga a cópia e a unidade morre
      const s = d.slots[slot];
      s.inHand++; // coloca uma cópia na mão para jogar
      d.hand.unshift({ ...s.card, slot });
      playFromHand(d, 0);
      defeatCopy(d, slot);
      expect(s.copies - s.defeated).toBe(COPIES - 1 - k);
    }
    expect(d.defeated).toHaveLength(4);
    expect(inRotation(d).some((s) => s.slot === slot)).toBe(false);
    // continua comprando normalmente sem esse grupo, mesmo com ele "garantido"
    d.slots[slot].dueAt = 0;
    for (let i = 0; i < 40; i++) {
      if (d.hand.length) {
        const idx = d.hand.findIndex((h) => h.slot !== slot);
        playFromHand(d, idx >= 0 ? idx : 0);
      }
      const got = drawStep(d, rng);
      expect(got.some((h) => h.slot === slot)).toBe(false);
    }
  });
  it('sem nenhuma carta liberada, compra a mais próxima de liberar (a mão não fica sem compra)', () => {
    const rng = { seed: 5 };
    const d = createDeck(team(), rng);
    drawOpening(d, rng);
    playFromHand(d, 0);
    for (const s of d.slots) Object.assign(s, { eligibleAt: 999, dueAt: 999 });
    d.slots[6].eligibleAt = 500;
    const got = drawStep(d, rng);
    expect(got).toHaveLength(1);
  });
});
