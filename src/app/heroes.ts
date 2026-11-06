/**
 * v0.59.0 — tela Heróis (álbum): personagens por grupo (raça) e tipo, uma linha por personagem com as raridades
 * lado a lado (escuras até obter aquela raridade), contadores, prêmios com Resgatar e os feitiços.
 * O editor TEMP de balanceamento (segurar a carta) mora aqui agora.
 */
import { bindCardEditor } from './tempCardBalanceEditor'; // TEMP card balance editor
import { CATEGORY_INFO, CHAR_BY_ID, RACE_INFO } from '../core/characters';
import { SPELLS } from '../core/spells';
import { addProfileXp } from '../core/profile';
import { statsFor, type XpItemId } from '../core/progression';
import { filterHeroes, showSpellsFor, heroCells, ATK_RANGES, HP_RANGES, WAIT_VALUES, type HeroFilter, RACE_ORDER, CAT_ORDER, claimAll, claimableCount, claimGoal, claimVariant, goalClaimed, hasRarity, heroGoals, heroGroups, spellOwned, syncSeen, variantClaimable, VARIANT_REWARD, type Goal, type Reward } from '../core/heroes';
import { abilityListHTML, reachLabel, cardHTML, catIcon, esc, gemHTML, goldHTML, orbHTML, raceIcon, spellCardHTML } from '../ui/components';
import { showDialog } from '../ui/dialog';
import { rewardListHTML } from '../ui/rewardList';
import { leaveBattleMode } from '../ui/orientation';
import { app, persist, prof, save } from './state';
import { bindNav, topbar } from './ui';

type R = Reward & { orb?: string; orbs?: number };
export const rewardHTML = (r: R) =>
  [r.gold ? goldHTML(`+${r.gold}`) : '', r.gems ? gemHTML(`+${r.gems}`) : '', r.xp ? `👤 +${r.xp} XP` : '', r.orb ? orbHTML(r.orb as XpItemId, `+${r.orbs ?? 1}`) : ''].filter(Boolean).join(' ');

const rewardModal = (title: string, html: string) => void showDialog({ title, icon: '🏆', html, buttons: [{ label: 'Entendi', value: 'ok', kind: 'primary' }] });

function give(r: R) {
  prof().gold += r.gold;
  save.gems = (save.gems ?? 0) + r.gems;
  if (r.xp) addProfileXp(prof(), r.xp);
  if (r.orb) save.items[r.orb as XpItemId] = (save.items[r.orb as XpItemId] ?? 0) + (r.orbs ?? 1);
}

const goalHTML = (g: Goal) => {
  const done = g.done >= g.total;
  const claimed = goalClaimed(save, g.key);
  return `<div class="hr-goal${done ? ' done' : ''}"><span class="hr-count">${g.done}/${g.total}</span><span class="hr-rw">${rewardHTML(g.reward)}</span>${claimed ? '<span class="hr-ok">✔ Resgatado</span>' : `<button class="btn small ${done ? 'primary' : ''}" data-goal="${g.key}" ${done ? '' : 'disabled'}>Resgatar</button>`}</div>`;
};

// v0.59.6: filtros (sessão); v0.64.0: + Raridade, Ataque, Vida e Rodadas — todos valem juntos
const F: HeroFilter = {};
type FKey = keyof HeroFilter;
const FLABEL: Record<FKey, string> = { race: 'Grupo', cat: 'Tipo', rarity: 'Raridade', atk: 'Ataque', hp: 'Vida', wait: 'Rodadas' };
const RAR_NAMES = ['', 'Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Mítico'];
const chips = (kind: FKey, keys: (string | number)[], label: (k: string) => string) => {
  const cur = F[kind];
  return `<div class="hr-chips" role="radiogroup"><span class="hr-chips-l">${FLABEL[kind]}</span><button type="button" class="hr-chip${cur ? '' : ' on'}" data-fk="${kind}" data-fv="">Todos</button>${keys.map((k) => `<button type="button" class="hr-chip${String(cur ?? '') === String(k) ? ' on' : ''}" data-fk="${kind}" data-fv="${k}">${label(String(k))}</button>`).join('')}</div>`;
};
const anyFilter = () => Object.values(F).some((v) => v);

export function heroes() {
  leaveBattleMode();
  syncSeen(save, CHAR_BY_ID);
  const goals = Object.fromEntries(heroGoals(save).map((g) => [g.key, g]));
  const row = (id: string) => {
    const d = CHAR_BY_ID[id];
    const cells: string[] = [];
    for (const st of heroCells(d, F)) {
      const has = hasRarity(save, id, st);
      const can = variantClaimable(save, id, st);
      cells.push(`<div class="hr-cell">${cardHTML({ charId: id, stars: st, plus: 0 }, { grid: true, locked: false, extraClass: has ? '' : 'hr-dark', attrs: `data-card="${id}" data-stars="${st}"` })}${can ? `<button class="btn small primary hr-claim" data-var="${id}:${st}">Resgatar ${rewardHTML(VARIANT_REWARD[st])}</button>` : ''}</div>`);
    }
    return `<div class="hr-row"><div class="hr-name">${esc(d.name)}</div><div class="hr-cards">${cells.join('')}</div><div class="hr-info" hidden></div></div>`;
  };
  const all = goals['all'];
  const sp = goals['spells'];
  const nClaim = claimableCount(save);
  app.innerHTML = `<div class="screen heroes">${topbar('Heróis')}
    ${nClaim ? `<div class="hr-claimall"><button class="btn primary" id="hrClaimAll">🎁 Resgatar todos (${nClaim})</button></div>` : ''}
    <section class="hr-head"><b>Todos os personagens</b>${goalHTML(all)}</section>
    <div class="hr-filters">${chips('race', RACE_ORDER, (k) => `${raceIcon(k)} ${RACE_INFO[k as keyof typeof RACE_INFO].label}`)}${chips('cat', CAT_ORDER, (k) => `${catIcon(k)} ${CATEGORY_INFO[k as keyof typeof CATEGORY_INFO].label}`)}${chips('rarity', [1, 2, 3, 4, 5, 6], (k) => `<i class="hr-rdot s${k}"></i>${RAR_NAMES[+k]}`)}${chips('atk', ATK_RANGES, (k) => `⚔️ ${k}`)}${chips('hp', HP_RANGES, (k) => `❤️ ${k}`)}${chips('wait', WAIT_VALUES, (k) => `💧 ${k}`)}${anyFilter() ? '<button type="button" class="btn small" id="hrClearF">Limpar filtros</button>' : ''}</div>
    <p class="hint">Cada raridade acende sozinha: ter a Comum não acende a Incomum. Toda raridade nova dá um prêmio para resgatar.</p>
    ${filterHeroes(heroGroups(), F).length ? '' : '<p class="hint">Nenhum personagem com esse filtro.</p>'}
    ${filterHeroes(heroGroups(), F).map((g) => `<section class="hr-group"><h3 class="sec-title">${raceIcon(g.race)} ${RACE_INFO[g.race as keyof typeof RACE_INFO].label}${goalHTML(goals[`g:${g.race}`])}</h3>
      ${g.types.map((t) => `<div class="hr-type"><h4>${catIcon(t.cat)} ${CATEGORY_INFO[t.cat as keyof typeof CATEGORY_INFO].label}${goalHTML(goals[`t:${g.race}:${t.cat}`])}</h4><div class="hr-rows">${t.chars.map((c) => row(c.id)).join('')}</div></div>`).join('')}
    </section>`).join('')}
    ${showSpellsFor(F) ? `<section class="hr-group"><h3 class="sec-title">✦ Feitiços${goalHTML(sp)}</h3>
      <div class="card-grid spell-grid">${[...SPELLS].filter((s) => !F.rarity || s.rarity === F.rarity).sort((a, b) => a.rarity - b.rarity).map((s) => spellCardHTML(s.id, { locked: false, extraClass: `grid-card${spellOwned(save, s.id) ? '' : ' hr-dark'}` })).join('')}</div>
    </section>` : ''}
  </div>`;
  bindNav();
  app.querySelectorAll<HTMLButtonElement>('[data-fk]').forEach((b) =>
    b.addEventListener('click', () => {
      const k = b.dataset.fk as FKey;
      const v = b.dataset.fv || null;
      (F as Record<string, string | number | null>)[k] = v && (k === 'rarity' || k === 'wait') ? +v : v;
      heroes();
    }),
  );
  app.querySelector('#hrClearF')?.addEventListener('click', () => {
    for (const k of Object.keys(F)) delete F[k as FKey];
    heroes();
  });
  // v0.64.1: tocar numa carta mostra as habilidades dela no espaço ao lado (tocar em outra troca; na mesma, fecha)
  app.querySelectorAll<HTMLElement>('.hr-row [data-card]').forEach((el) =>
    el.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.hr-claim')) return;
      const row = el.closest('.hr-row')!;
      const info = row.querySelector<HTMLElement>('.hr-info')!;
      const was = el.classList.contains('hr-sel');
      row.querySelectorAll('.hr-sel').forEach((x) => x.classList.remove('hr-sel'));
      if (was) {
        info.hidden = true;
        return;
      }
      el.classList.add('hr-sel');
      const d = CHAR_BY_ID[el.dataset.card!];
      const st = +el.dataset.stars!;
      const s = statsFor(d, st, 0);
      info.innerHTML = `<div class="hr-info-h"><b>${esc(d.name)}</b> · ${RAR_NAMES[st]}<span>⚔️ ${s.atk} · ❤️ ${s.hp} · 💧 ${d.wait ?? ''} · 🎯 alcance ${reachLabel(d)}</span></div>${abilityListHTML(d, st, 0)}`;
      info.hidden = false;
    }),
  );
  app.querySelectorAll<HTMLButtonElement>('[data-goal]').forEach((b) =>
    b.addEventListener('click', () => {
      const r = claimGoal(save, goals[b.dataset.goal!]);
      if (!r) return;
      give(r);
      persist();
      heroes();
      rewardModal('Prêmio resgatado!', `<p class="rw-count">${esc(goals[b.dataset.goal!].label)}</p>${rewardListHTML(r)}`);
    }),
  );
  app.querySelectorAll<HTMLButtonElement>('[data-var]').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const [id, st] = b.dataset.var!.split(':');
      const r = claimVariant(save, id, +st);
      if (!r) return;
      give(r);
      persist();
      b.replaceWith(Object.assign(document.createElement('span'), { className: 'hr-ok', textContent: '✔' }));
      const ca = app.querySelector<HTMLButtonElement>('#hrClaimAll');
      if (ca) { const n = claimableCount(save); if (n) ca.textContent = `🎁 Resgatar todos (${n})`; else ca.parentElement!.remove(); }
    }),
  );
  app.querySelector<HTMLButtonElement>('#hrClaimAll')?.addEventListener('click', () => {
    const t = claimAll(save);
    if (!t.count) return;
    give({ gold: t.gold, gems: t.gems, xp: t.xp });
    for (const [o, n] of Object.entries(t.orbs)) give({ gold: 0, gems: 0, xp: 0, orb: o, orbs: n });
    persist();
    heroes();
    rewardModal('Prêmios resgatados!', rewardListHTML(t));
  });
  bindCardEditor(app, heroes); // TEMP card balance editor
}
