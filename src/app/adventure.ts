/**
 * Aventura: mapa, janela da fase, batalha da fase e recompensas.
 * v0.28.1: separado do main.ts (organização do código, sem mudar o jogo).
 */
import { STAR_COLORS, getChar } from '../core/characters';
import { STAGES, stageCommander, type Stage } from '../core/campaign';
import { XP_ITEMS, playXp, feedXp, stepOf, type OrbBag } from '../core/progression';
import { leaderHp } from '../core/leaders';
import { BattleView } from '../ui/battleView';
import { energyHTML, goldHTML, gearHTML, orbBagHTML, orbHTML, cardHTML, categoryHTML, esc, raceHTML, starStyle, tierHTML } from '../ui/components';
import { getSpell, isSpell } from '../core/spells';
import { gameAlert, showDialog } from '../ui/dialog';
import { enterBattleMode, leaveBattleMode } from '../ui/orientation';
import { MAX_COPIES, addToDeck, deckMin, deckCards, deckCount, deckIssue, deckMax, teamReady } from '../ui/save';
import { GEAR_DROP, GEAR_RARE_CHANCE, STAGE_GEAR, addGear, stageGearDrop } from '../core/gear';
import { DAILY_LIMIT, DIFFICULTIES, DIFFICULTY_ICON, FIRST_WIN_XP_MULT, DIFFICULTY_LABEL, HARD_LEGENDARY_CHANCE, HARD_MYTHIC_CHANCE, STAR_COUNT, starGoals, addStars, type WinResult, rewardsFor, canPlay, canRepeat, dailyLeft, difficultyUnlocked, isCleared, markCleared, stageFor, stageUnlocked, starCount, starsForWin, starsOf, useDaily, type Difficulty } from '../core/adventure';
import { enemyCommanderArt } from '../ui/art';
import { grantCard, type GrantResult } from '../core/banner';
import { ENERGY_COST, energyMax, goldFor, profileXpFor, spendEnergy } from '../core/profile';
import { app, save, persist, activeLeader, leaderLevel, fmt, prof, energyNow, levelNote, grantProfileAndGold, pendingLevelNote, setPendingLevelNote, noEnergy } from './state';
import { topbar, bindNav, modal, closeModal } from './ui';
import { collection } from './collection';
import { train } from './train';

// ---------------- AVENTURA ----------------
/** v0.20.0: posição de cada fase no mapa (fração da largura), da fase 1 (embaixo) à 10 (em cima) */
export const MAP_X = [0.27, 0.72, 0.3, 0.7, 0.28, 0.72, 0.31, 0.69, 0.28, 0.5];
export const MAP_STEP = 168;
export const MAP_BOTTOM = 92;
export const MAP_TOP = 150;
export const advDiff = (): Difficulty => save.difficulty ?? 'facil';
/** v0.21.0: ⭐ da fase (cheias = conquistadas, vazias = faltam); `fresh` destaca as recém-ganhas */
export const starsHTML = (mask: number, fresh = 0) =>
  `<span class="stars-row" aria-label="${starCount(mask)} de ${STAR_COUNT} estrelas">${[0, 1, 2].map((i) => `<i class="${mask & (1 << i) ? 'on' : ''} ${fresh & (1 << i) ? 'new' : ''}">★</i>`).join('')}</span>`;
export type NodeState = 'done' | 'next' | 'lock';
export const nodeState = (diff: Difficulty, id: number): NodeState => (isCleared(save, diff, id) ? 'done' : stageUnlocked(save, diff, id) ? 'next' : 'lock');

/** v0.20.0: Aventura em mapa — abas de dificuldade no topo e as fases como bolinhas num caminho pontilhado. */
export function adventure() {
  leaveBattleMode();
  const diff = advDiff();
  app.innerHTML = `<div class="screen adventure">${topbar('Aventura')}
    <div class="diff-tabs" role="tablist">${DIFFICULTIES.map((d) => {
      const open = difficultyUnlocked(save, d);
      return `<button class="diff-tab ${d === diff ? 'on' : ''} ${open ? '' : 'locked'}" role="tab" aria-selected="${d === diff}" data-diff="${d}">${open ? DIFFICULTY_ICON[d] : '🔒'} ${DIFFICULTY_LABEL[d]}</button>`;
    }).join('')}</div>
    ${teamReady(save) ? '' : `<p class="warn-bar">⚠ Baralho inválido: ${esc(deckIssue(save) ?? '')}. <button class="btn small" data-nav="collection">Arrumar baralho</button></p>`}
    <div class="adv-map" id="advMap"><div class="adv-track" id="advTrack"></div></div>
  </div>`;
  bindNav();
  app.querySelectorAll<HTMLElement>('[data-diff]').forEach((el) =>
    el.addEventListener('click', () => {
      const d = el.dataset.diff as Difficulty;
      if (!difficultyUnlocked(save, d)) {
        const prev = DIFFICULTIES[DIFFICULTIES.indexOf(d) - 1];
        void gameAlert(`${DIFFICULTY_LABEL[d]} bloqueado`, `Vença a fase 1 no ${DIFFICULTY_LABEL[prev]} para liberar o ${DIFFICULTY_LABEL[d]}. Cada fase do ${DIFFICULTY_LABEL[d]} abre quando você vence a mesma fase no ${DIFFICULTY_LABEL[prev]} e a fase anterior no ${DIFFICULTY_LABEL[d]}.`, '🔒');
        return;
      }
      save.difficulty = d;
      persist();
      adventure();
    }),
  );
  drawMap(true);
}

/** Desenha o caminho e as fases com a largura atual (de novo ao girar/redimensionar a tela). */
export function drawMap(scrollToNext = false) {
  const map = app.querySelector<HTMLElement>('#advMap');
  const track = app.querySelector<HTMLElement>('#advTrack');
  if (!map || !track) return;
  const diff = advDiff();
  const w = track.clientWidth || 360;
  const h = MAP_TOP + MAP_STEP * (STAGES.length - 1) + MAP_BOTTOM;
  const pos = STAGES.map((_, i) => [Math.round(MAP_X[i] * w), h - MAP_BOTTOM - i * MAP_STEP] as const);
  const states = STAGES.map((st) => nodeState(diff, st.id));
  const segs = pos.slice(0, -1).map(([x1, y1], i) => {
    const [x2, y2] = pos[i + 1];
    const my = (y1 + y2) / 2;
    // o trecho acende quando a fase de baixo já foi vencida
    return `<path class="adv-path ${states[i] === 'done' ? 'lit' : ''}" d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}"/>`;
  });
  track.style.height = `${h}px`;
  track.innerHTML = `<svg class="adv-paths" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${segs.join('')}</svg>
    ${STAGES.map((st, i) => {
      const state = states[i];
      const left = state === 'done' ? dailyLeft(save.daily, diff, st.id) : 0;
      return `<button class="adv-node ${state}" data-st="${st.id}" style="left:${pos[i][0]}px;top:${pos[i][1]}px" aria-label="Fase ${st.id}: ${esc(st.name)}">
        ${enemyCommanderArt(stageCommander(stageFor(st.id, diff)), 'adv-cmd', `animation-delay:-${(i * 0.37).toFixed(2)}s`)}
        <span class="adv-ball">${state === 'done' ? '✓' : state === 'next' ? st.id : '🔒'}</span>
        ${state === 'done' ? `<span class="adv-stars">${starsHTML(starsOf(save, diff, st.id))}</span>` : ''}
        <span class="adv-name">${st.id}. ${esc(st.name)}</span>
        ${state === 'done' ? `<span class="adv-left ${left ? '' : 'out'}">${left}/${DAILY_LIMIT} hoje</span>` : ''}
        ${state === 'next' ? '<span class="adv-tag">PRÓXIMA</span>' : ''}
      </button>`;
    }).join('')}`;
  track.querySelectorAll<HTMLElement>('[data-st]').forEach((el) => el.addEventListener('click', () => stageDialog(+el.dataset.st!)));
  if (scrollToNext) {
    // a próxima fase (ou a última vencida) fica visível, mais para baixo da tela
    const k = Math.max(0, states.indexOf('next') >= 0 ? states.indexOf('next') : states.lastIndexOf('done'));
    map.scrollTop = Math.max(0, pos[k][1] - map.clientHeight * 0.62);
  }
}
let mapResize = 0;
window.addEventListener('resize', () => {
  clearTimeout(mapResize);
  mapResize = window.setTimeout(() => drawMap(), 150);
});

/** Janela da fase: informações, Jogar (em cima) e Repetir (embaixo), com o limite do dia. */
export function stageDialog(stageId: number) {
  const diff = advDiff();
  const state = nodeState(diff, stageId);
  if (state === 'lock') {
    void gameAlert('Fase bloqueada', `Vença a fase ${stageId - 1} no ${DIFFICULTY_LABEL[diff]} para liberar esta.`, '🔒');
    return;
  }
  const st = stageFor(stageId, diff);
  const foes = st.enemyDeck.filter((c) => !isSpell(c.charId));
  const foeSpells = st.enemyDeck.filter((c) => isSpell(c.charId)).map((c) => getSpell(c.charId));
  const r = rewardsFor(stageId, diff, () => 1); // só a parte fixa; as chances aparecem escritas
  const done = state === 'done';
  const left = dailyLeft(save.daily, diff, stageId);
  const play = canPlay(save, save.daily, diff, stageId);
  const repeat = canRepeat(save, save.daily, diff, stageId);
  const mask = starsOf(save, diff, stageId);
  const full = starCount(mask) === STAR_COUNT;
  void showDialog({
    title: `Fase ${st.id} · ${st.name}`,
    html: `<button class="stage-close" data-x aria-label="Fechar">✕</button>
      ${enemyCommanderArt(stageCommander(st), 'stage-cmd')}
      <p class="stage-diff">Dificuldade <b>${DIFFICULTY_LABEL[diff]}</b></p>
      <p class="stage-line">Comandante inimigo ❤${st.enemyHeroHp} · Inimigos até ${(() => { const top = foes.reduce((a, c) => (c.stars * 3 + stepOf(c) > a.stars * 3 + stepOf(a) ? c : a)); return tierHTML(top.stars, stepOf(top)); })()}${foeSpells.length ? ` · ✦ ${foeSpells.map((sp) => `<span title="${esc(sp.name)}">${sp.icon}</span>`).join('')}` : ''}</p>
      <p class="stage-line">Recompensa: ✴${r.essencias} ${orbBagHTML(r.orbs)}${diff === 'dificil' ? ` · chance: ${orbHTML('orbe5')} ${HARD_LEGENDARY_CHANCE * 100}% ${orbHTML('orbe6')} ${HARD_MYTHIC_CHANCE * 100}%` : ''}${!done && st.pack.some((id) => !save.cards[id]) ? ` · 🎁 pacote: <b>${st.pack.filter((id) => !save.cards[id]).map((id) => esc(getChar(id).name)).join(', ')}</b>` : ''}</p>
      <p class="stage-line">Itens: ${STAGE_GEAR[stageId - 1].map((id) => gearHTML(id, GEAR_DROP[diff][0])).join(' ')} <small>${100 - GEAR_RARE_CHANCE[diff] * 100}% ${STAR_COLORS[GEAR_DROP[diff][0]].label} · ${GEAR_RARE_CHANCE[diff] * 100}% ${STAR_COLORS[GEAR_DROP[diff][1]].label}</small></p>
      <ul class="stage-goals">${starGoals(diff, stageId).map((g, i) => `<li class="${mask & (1 << i) ? 'on' : ''}"><i>★</i> ${esc(g.text)}</li>`).join('')}</ul>
      <p class="stage-line">Por vitória ou Repetir: ${goldHTML(goldFor(stageId, diff))} · 👤 +${profileXpFor(stageId, diff)} XP de perfil${done ? '' : ' <small>(em dobro na primeira vitória)</small>'} · você tem ${energyHTML(energyNow(), energyMax(prof()))}</p>
      ${done ? `<p class="stage-left ${left ? '' : 'out'}">${left ? `Hoje: <b>${left}/${DAILY_LIMIT}</b> restantes` : 'Limite de hoje atingido. Volta amanhã.'}</p>` : ''}
      <div class="stage-actions">
        <button class="btn primary big" data-act="play" ${play ? '' : 'disabled'}>⚔ Jogar <span class="cost">⚡${ENERGY_COST[diff]}</span></button>
        ${done ? `<button class="btn big" data-act="repeat" ${repeat ? '' : 'disabled'}>⟲ Repetir <span class="cost">⚡${ENERGY_COST[diff]}</span></button>` : ''}
      </div>
      ${done && !full ? `<p class="stage-note">⟲ Repetir libera com as ${STAR_COUNT} ⭐ desta fase.</p>` : ''}`,
    buttons: [],
    onMount: (root, close) => {
      root.querySelector('.dialog')?.classList.add('stage-dialog');
      root.querySelector('[data-x]')!.addEventListener('click', () => close('cancel'));
      root.querySelector('[data-act=play]')!.addEventListener('click', () => {
        close('play');
        startBattle(stageId, diff);
      });
      root.querySelector('[data-act=repeat]')?.addEventListener('click', () => {
        close('repeat');
        repeatStage(stageId, diff);
      });
    },
  });
}

/** v0.27.0: mostra uma carta recebida (personagem novo ou cópia repetida que virou XP). */
export function grantedHTML(g: GrantResult): string {
  const def = getChar(g.charId);
  if (g.isNew) {
    const joined = addToDeck(save, def.id) > 0;
    return `<div class="unlock" style="${starStyle(g.stars)}">${cardHTML(save.cards[def.id], { compact: true })}<div><b>Novo personagem!</b><br>${esc(def.name)} — ${raceHTML(def)} ${categoryHTML(def, true)} · ${tierHTML(g.stars)}${joined ? '<br><small>Entrou direto no seu baralho.</small>' : ''}</div></div>`;
  }
  return `<div class="unlock dup" style="${starStyle(g.stars)}">${cardHTML({ charId: g.charId, stars: g.stars }, { compact: true })}<div><b>Repetido:</b> ${esc(def.name)} ${tierHTML(g.stars)}<br>📈 virou <b>+${fmt(g.xp)} XP</b>${g.mult > 1 ? ` <b class="dup-luck">×${g.mult}!</b>` : ''}${g.filled ? '<br><small>Barra cheia: suba o degrau em Treinar.</small>' : g.wasted > 0 ? `<br><small>${fmt(g.wasted)} XP passaram da barra cheia.</small>` : ''}${refundHTML(g.refund)}</div></div>`;
}

/** v0.28.3: Orbes devolvidos pelo XP que passou da barra cheia (25%). */
function refundHTML(refund: OrbBag): string {
  const n = Object.values(refund).reduce((a, k) => a + (k ?? 0), 0);
  return n > 0 ? `<br><small>XP que passou: +${n} ${n === 1 ? 'Orbe' : 'Orbes'}</small> ${orbBagHTML(refund, '+')}` : '';
}

/** v0.25.0: dá os personagens do pacote (entram direto no baralho se couber). v0.27.0: o repetido vira XP. */
export function grantPack(ids: string[]): string {
  return ids.map((id) => grantedHTML(grantCard(save.cards, { charId: id, stars: getChar(id).minStars }, Math.random, save.items))).join('');
}

/** Dá a recompensa inteira da fase na dificuldade (vitória ou Repetir; v0.22.0: Orbes pela dificuldade, com as chances do Difícil). */
export function grantRewards(st: Stage, diff: Difficulty, first = false) {
  const r = rewardsFor(st.id, diff);
  // v0.24.1: a primeira vitória dá os itens da fase de novo (bônus), então ganha 2 de cada
  if (first) r.gear.push(...stageGearDrop(st.id, diff));
  for (const o of XP_ITEMS) save.items[o.id] += r.orbs[o.id] ?? 0;
  save.essencias += r.essencias;
  for (const g of r.gear) addGear((save.gear ??= {}), g.id, g.rarity);
  return `<div class="res big"><span>✴ +${r.essencias}</span>${XP_ITEMS.filter((o) => r.orbs[o.id]).map((o) => `<span class="orb-pill">${orbHTML(o.id, `+${r.orbs[o.id]}`)}</span>`).join('')}${r.gear.map((g) => gearHTML(g.id, g.rarity, '+1')).join('')}</div>`;
}

/** v0.22.0: XP por jogar — ao vencer jogando, todo o baralho ganha XP. */
export function grantPlayXp(stageId: number, first = false): string {
  // v0.24.1: na primeira vitória o XP por jogar vem em dobro
  const xp = playXp(stageId) * (first ? FIRST_WIN_XP_MULT : 1);
  let full = 0;
  for (const id of save.deck) if (!isSpell(id) && save.cards[id] && feedXp(save.cards[id], xp).filled) full++;
  return `<p class="hint">📈 +${xp} XP para cada personagem do baralho${full ? ` · ${full} barra(s) cheia(s): suba o degrau em Treinar` : ''}</p>`;
}

/** Repetir: recompensa na hora, sem jogar a batalha (gasta 1 vez do dia). */
export function repeatStage(stageId: number, diff: Difficulty) {
  if (!canRepeat(save, save.daily, diff, stageId)) return;
  // v0.26.0: o Repetir gasta energia (e dá 1 XP de perfil por energia)
  const cost = ENERGY_COST[diff];
  const before = deckMax(save);
  const spent = spendEnergy(prof(), cost);
  if (!spent.ok) return void noEnergy(cost);
  const st = stageFor(stageId, diff);
  save.daily = useDaily(save.daily, diff, stageId);
  const got = grantRewards(st, diff) + levelNote(spent, before) + grantProfileAndGold(stageId, diff);
  persist();
  resultModal(`<h2 class="win">⟲ Fase ${st.id} repetida</h2><p>${esc(st.name)} · ${DIFFICULTY_LABEL[diff]}</p>${got}<p class="hint">Hoje: <b>${dailyLeft(save.daily, diff, stageId)}/${DAILY_LIMIT}</b> restantes nesta fase.</p>`);
}

export function resultModal(html: string) {
  modal(`${html}<div class="row"><button class="btn primary" data-m="adv">Continuar</button><button class="btn" data-m="train">Treinar</button></div>`, (m) => {
    m.querySelector('[data-m=adv]')!.addEventListener('click', () => {
      closeModal();
      adventure();
    });
    m.querySelector('[data-m=train]')!.addEventListener('click', () => {
      closeModal();
      train();
    });
  });
}

/** Regra v0.17: o baralho precisa ter de 20 ao máximo do nível de perfil (janela do jogo, nunca alerta do navegador). */
export async function teamWarning(): Promise<void> {
  const v = await showDialog({
    title: 'Baralho inválido',
    icon: '🃏',
    html: `<p class="dialog-msg">Para lutar, o baralho precisa ter de <b>${deckMin(save)}</b> a <b>${deckMax(save)}</b> cartas (até ${MAX_COPIES} cópias de cada carta) e pelo menos 1 personagem.</p>
      <p class="dialog-msg">Agora: <b>${deckCount(save)}</b> cartas — ${esc(deckIssue(save) ?? '')}.</p>`,
    buttons: [
      { label: 'Agora não', value: 'cancel', kind: 'ghost' },
      { label: 'Ir para o baralho', value: 'team', kind: 'primary' },
    ],
  });
  if (v === 'team') collection();
}

export function startBattle(stageId: number, diff: Difficulty = advDiff()) {
  if (!teamReady(save)) {
    void teamWarning();
    return;
  }
  if (!canPlay(save, save.daily, diff, stageId)) return;
  // v0.26.0: a batalha gasta a energia ao começar (a derrota também gasta)
  const cost = ENERGY_COST[diff];
  const before = deckMax(save);
  const spent = spendEnergy(prof(), cost);
  if (!spent.ok) return void noEnergy(cost);
  setPendingLevelNote(levelNote(spent, before));
  persist();
  const stage = stageFor(stageId, diff);
  const deck = deckCards(save);
  window.scrollTo(0, 0);
  enterBattleMode();
  app.innerHTML = '<div class="screen battle-screen" id="bs"></div>';
  new BattleView(app.querySelector('#bs')!, stage, deck, {
    speed: () => save.speed || 1,
    setSpeed: (n) => {
      save.speed = n;
      persist();
    },
    onExit: () => adventure(),
    onFinish: (winner, end) => finishBattle(stageId, diff, winner, end),
    playerHeroHp: leaderHp(activeLeader(), leaderLevel()),
  });
}

/**
 * Fim da batalha. Vitória: recompensa inteira; a primeira vitória da fase (nesta dificuldade) não gasta
 * o limite do dia, as outras gastam 1. Derrota/empate: não gasta (e dá 1 Pergaminho de consolo).
 */
export function finishBattle(stageId: number, diff: Difficulty, winner: string, end?: WinResult) {
  const stage = stageFor(stageId, diff);
  const first = !isCleared(save, diff, stageId);
  let html = '';
  if (winner === 'player') {
    const got = grantRewards(stage, diff, first) + grantPlayXp(stageId, first) + grantProfileAndGold(stageId, diff, first);
    if (first) markCleared(save, diff, stageId);
    else save.daily = useDaily(save.daily, diff, stageId);
    // v0.21.0: ⭐ dos objetivos cumpridos nesta vitória (somam aos que a fase já tinha)
    const fresh = addStars(save, diff, stageId, end ? starsForWin(end, diff, stageId) : 1);
    const mask = starsOf(save, diff, stageId);
    const starsLine = `<div class="win-stars">${starsHTML(mask, fresh)}</div><ul class="stage-goals">${starGoals(diff, stageId).map((g, i) => `<li class="${mask & (1 << i) ? 'on' : ''}"><i>★</i> ${esc(g.text)}${fresh & (1 << i) ? ' <b class="new-tag">nova!</b>' : ''}</li>`).join('')}</ul>${fresh && starCount(mask) === STAR_COUNT ? '<p class="hint">⟲ Repetir liberado nesta fase!</p>' : ''}`;
    // v0.25.0: pacote da primeira vitória — o desbloqueio da fase e um personagem de Comum
    const unlocked = grantPack(stage.pack);
    // v0.28.0: vencer a fase N libera a mesma fase na dificuldade seguinte (se a anterior dela já foi vencida)
    const nextDiff = DIFFICULTIES[DIFFICULTIES.indexOf(diff) + 1];
    const opened = first && nextDiff && stageUnlocked(save, nextDiff, stageId) ? nextDiff : undefined;
    html = `<h2 class="win">🏆 Vitória!</h2><p>${first ? 'Primeira vitória nesta fase!' : `Hoje: <b>${dailyLeft(save.daily, diff, stageId)}/${DAILY_LIMIT}</b> restantes nesta fase.`}</p>
      ${starsLine}${got}${opened ? `<p class="hint">🔓 Fase ${stageId} liberada no <b>${DIFFICULTY_LABEL[opened]}</b>!</p>` : ''}${unlocked}`;
  } else {
    save.items.orbe1 += 1;
    html = `<h2 class="lose">${winner === 'empate' ? '⏱ Empate' : '💀 Derrota'}</h2><p>Treine seus personagens com Orbes e tente de novo! (+1 Orbe Comum)</p>`;
  }
  html += pendingLevelNote;
  setPendingLevelNote('');
  persist();
  resultModal(html);
}
