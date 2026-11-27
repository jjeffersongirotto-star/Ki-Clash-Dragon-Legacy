/**
 * v0.72.0 — 📜 Missões diárias: janela com as missões do dia, os prêmios para resgatar e o Baú (regras em core/missions.ts).
 */
import { CHEST_GEMS, CHEST_ITEMS, MISSIONS, chestMissions, chestReady, claimMission, freshMissions, missionReward, type MissionReward } from '../core/missions';
import { towerUnlocked } from '../core/tower';
import { XP_ITEMS } from '../core/progression';
import { addGear, markGearSeen } from '../core/gear';
import { showDialog } from '../ui/dialog';
import { esc, essIcon, gearHTML, gemHTML, goldHTML, orbHTML } from '../ui/components';
import { save, persist, prof, fmt } from './state';

const prizeHTML = (r: MissionReward, plus = '') =>
  `${r.gold ? goldHTML(`${plus}${fmt(r.gold)}`) : ''}${r.essencias ? `<span>${essIcon()} ${plus}${r.essencias}</span>` : ''}${XP_ITEMS.filter((o) => r.orbs[o.id]).map((o) => `<span class="orb-pill">${orbHTML(o.id, `${plus}${r.orbs[o.id]}`)}</span>`).join('')}${r.gems ? gemHTML(`${plus}${r.gems}`) : ''}${r.gear.map((g) => gearHTML(g.id, g.rarity, plus ? '+1' : '')).join('')}`;

function give(r: MissionReward) {
  prof().gold += r.gold;
  save.essencias += r.essencias;
  for (const o of XP_ITEMS) save.items[o.id] += r.orbs[o.id] ?? 0;
  save.gems = (save.gems ?? 0) + r.gems;
  for (const g of r.gear) {
    addGear((save.gear ??= {}), g.id, g.rarity);
    markGearSeen((save.gearSeen ??= []), g.id, g.rarity);
  }
}

function bodyHTML(note = ''): string {
  save.missions = freshMissions(save.missions);
  const m = save.missions;
  const open = towerUnlocked(save.cleared);
  const rows = MISSIONS.map((d) => {
    const n = m.prog[d.id] ?? 0;
    const done = n >= d.goal;
    const got = m.claimed.includes(d.id);
    const locked = d.event === 'tower' && !open;
    const r = missionReward(save, d.id, () => 0);
    return `<li class="ms-row${done ? ' done' : ''}${got ? ' got' : ''}${locked ? ' locked' : ''}">
      <span class="ms-ico">${d.icon}</span>
      <span class="ms-txt"><b>${esc(d.text)}</b>${locked ? '<small>Abre depois da Fácil 10</small>' : `<span class="ms-bar"><i style="width:${Math.round((100 * n) / d.goal)}%"></i></span><small>${n}/${d.goal}</small>`}</span>
      <span class="ms-prize">${prizeHTML(r)}</span>
      ${got ? '<span class="ms-ok">✔</span>' : `<button class="btn small ${done ? 'primary' : ''}" data-claim="${d.id}" ${done && !locked ? '' : 'disabled'}>Resgatar</button>`}
    </li>`;
  }).join('');
  const need = chestMissions(open).length;
  const have = chestMissions(open).filter((d) => (m.prog[d.id] ?? 0) >= d.goal).length;
  const ready = chestReady(m, open);
  const chestGot = m.claimed.includes('chest');
  return `${note}<ul class="ms-list">${rows}</ul>
    <div class="ms-chest${ready ? ' ready' : ''}${chestGot ? ' got' : ''}">
      <span class="ms-ico">🎁</span>
      <span class="ms-txt"><b>Baú do dia</b><small>Cumpra todas as missões (${have}/${need}): ${gemHTML(`${CHEST_GEMS}`)} Gema + ${CHEST_ITEMS} itens de ascensão</small></span>
      ${chestGot ? '<span class="ms-ok">✔</span>' : `<button class="btn small ${ready ? 'primary' : ''}" data-claim="chest" ${ready ? '' : 'disabled'}>Abrir</button>`}
    </div>
    <p class="hint">As missões e o Baú voltam todo dia à meia-noite (horário de Brasília). Os prêmios crescem com o seu progresso na Aventura.</p>`;
}

export function missionsDialog(after?: () => void) {
  let changed = false;
  void showDialog({
    title: '📜 Missões diárias',
    html: `<div class="ms-body">${bodyHTML()}</div>`,
    buttons: [],
    onMount: (root) => {
      root.querySelector('.dialog')?.classList.add('ms-dialog');
      const body = root.querySelector<HTMLElement>('.ms-body')!;
      const bind = () =>
        body.querySelectorAll<HTMLButtonElement>('[data-claim]').forEach((b) =>
          b.addEventListener('click', () => {
            const res = claimMission(save.missions, save, b.dataset.claim!, towerUnlocked(save.cleared));
            if (!res) return;
            save.missions = res.state;
            give(res.reward);
            changed = true;
            persist();
            body.innerHTML = bodyHTML(`<div class="res big ms-got">${prizeHTML(res.reward, '+')}</div>`);
            bind();
          }),
        );
      bind();
    },
  }).then(() => {
    if (changed) after?.();
  });
}
