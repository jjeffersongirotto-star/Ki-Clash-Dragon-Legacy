import type { Unit } from '../core/types';

/**
 * v0.45.1: cor do número de vida na arena.
 * - verde: vida máxima aumentada (escudo ativo ou vida máxima acima da base);
 * - vermelho: SÓ enquanto um debuff ativo reduz a vida máxima abaixo da base;
 * - branco: normal. Vida baixa por dano NÃO deixa vermelho.
 */
export function hpStatClass(u: Pick<Unit, 'maxHp' | 'effects'> & { baseMaxHp?: number }): '' | 'buff' | 'debuff' {
  const base = u.baseMaxHp ?? u.maxHp;
  const shield = u.effects?.some((e) => e.kind === 'escudo' && e.turns > 0 && e.amount > 0);
  if (u.maxHp < base) return 'debuff';
  if (shield || u.maxHp > base) return 'buff';
  return '';
}
