import { getChar } from './characters';
import { BANNERS, BANNER_EXCLUSIVE, rollRarity } from './banner';
import { isSpell } from './spells';
import { stepOf } from './progression';

/**
 * v0.52.1: na PRIMEIRA vitória de uma fase o jogador escolhe 1 entre 3 cartas do rival.
 * Cada uma das 3 vagas sorteia a raridade com as chances do pacote (Banner); entra a carta do rival
 * com a raridade mais próxima da sorteada. Dentro da mesma raridade (ou quando o rival só tem um tipo),
 * a carta mais forte no rival é mais difícil de aparecer: peso 1 / (1 + força).
 */
export interface FoeEntry { charId: string; stars: number; plus?: number | boolean }

export const FIRST_PICK_COUNT = 3;
export const FIRST_PICK_ODDS = BANNERS[0].odds;

export const foePower = (c: FoeEntry) => c.stars * 3 + stepOf(c);

export function firstClearOffer(deck: FoeEntry[], rng: () => number = Math.random, odds: Record<number, number> = FIRST_PICK_ODDS): string[] {
  // a força de cada personagem = a cópia mais forte dele no baralho do rival
  const best = new Map<string, number>();
  for (const c of deck) {
    if (isSpell(c.charId) || BANNER_EXCLUSIVE.includes(c.charId)) continue;
    best.set(c.charId, Math.max(best.get(c.charId) ?? -1, foePower(c)));
  }
  const pool = [...best.keys()];
  const out: string[] = [];
  while (out.length < FIRST_PICK_COUNT && out.length < pool.length) {
    const left = pool.filter((id) => !out.includes(id));
    const target = rollRarity(odds, rng);
    const dist = (id: string) => Math.abs(getChar(id).minStars - target);
    const d = Math.min(...left.map(dist));
    const group = left.filter((id) => dist(id) === d);
    const w = group.map((id) => 1 / (1 + best.get(id)!));
    let x = rng() * w.reduce((a, b) => a + b, 0);
    let pick = group[group.length - 1];
    for (let i = 0; i < group.length; i++) if ((x -= w[i]) < 0) { pick = group[i]; break; }
    out.push(pick);
  }
  return out;
}
