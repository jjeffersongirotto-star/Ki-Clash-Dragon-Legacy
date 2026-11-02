import { XP_ITEMS } from '../core/progression';
import { esc, gemHTML, goldHTML, orbHTML } from './components';

/** v0.59.4: prêmios em tópicos (ícone + nome + quantidade), só o que for maior que zero. */
export function rewardListHTML(t: { gold: number; gems: number; xp: number; orbs?: Record<string, number>; count?: number }) {
  const rows: string[] = [];
  const row = (icon: string, name: string, q: string) => rows.push(`<li class="rw-row"><span class="rw-ico">${icon}</span><span class="rw-name">${name}</span><b class="rw-q">${q}</b></li>`);
  if (t.gold) row(goldHTML(), 'Ouro de Dragão', `+${t.gold}`);
  if (t.gems) row(gemHTML(), 'Gemas', `+${t.gems}`);
  if (t.xp) row('👤', 'XP de perfil', `+${t.xp}`);
  for (const o of XP_ITEMS) { const n = t.orbs?.[o.id] ?? 0; if (n) row(orbHTML(o.id), esc(o.name), `x${n}`); }
  const cnt = t.count != null ? `<p class="rw-count">${t.count} prêmio${t.count === 1 ? '' : 's'} resgatado${t.count === 1 ? '' : 's'}</p>` : '';
  return `<div class="rw-list-wrap"><ul class="rw-list">${rows.join('')}</ul>${cnt}</div>`;
}
