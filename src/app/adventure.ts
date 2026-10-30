/**
 * Aventura: mapa, janela da fase, batalha da fase e recompensas.
 * v0.28.1: separado do main.ts (organização do código, sem mudar o jogo).
 */
import { STAR_COLORS, getChar } from '../core/characters';
import { getStage, stageCommander, type Stage } from '../core/campaign';
import { REGIONS, REGION_COUNT, STAGES_PER_REGION, localOf, regionOf, regionStageIds, stageLabel } from '../core/world';
import { XP_ITEMS, playXp, feedXp, stepOf } from '../core/progression';
import { leaderHp } from '../core/leaders';
import { BattleView } from '../ui/battleView';
import { spellMiniHTML, energyHTML, gemHTML, goldHTML, gearHTML, orbBagHTML, orbHTML, cardHTML, categoryHTML, esc, raceHTML, spellCardHTML, spellCastersLabel, starStyle, tierHTML, essIcon } from '../ui/components';
import { getSpell, isSpell } from '../core/spells';
import { gameAlert, showDialog } from '../ui/dialog';
import { enterBattleMode, leaveBattleMode } from '../ui/orientation';
import { MAX_COPIES, addToDeck, copiesIn, maxCopiesFor, setCopies, deckMin, deckCards, deckCount, deckIssue, deckMax, teamReady } from '../ui/save';
import { GEAR_RARE_CHANCE, addGear, stageGearDrop, stageGearIds, stageGearRarity } from '../core/gear';
import { DAILY_LIMIT, DIFFICULTIES, DIFFICULTY_ICON, FIRST_WIN_XP_MULT, DIFFICULTY_LABEL, gemsFor, spellRewardFor, HARD_LEGENDARY_CHANCE, HARD_MYTHIC_CHANCE, STAR_COUNT, starGoals, goalPlain, addStars, type WinResult, rewardsFor, canPlay, canRepeat, dailyLeft, difficultyUnlocked, isCleared, regionUnlocked, markCleared, stageFor, stageUnlocked, starCount, starsForWin, starsOf, useDaily, type Difficulty } from '../core/adventure';
import { enemyCommanderArt, faceUrl } from '../ui/art';
import { ico } from '../ui/icons';
import { arenaAttrs } from '../ui/arenas';
const regionIcon = (r: { id: number; icon: string }) => ico(`regiao-${r.id}`, r.icon);
const LOCK = () => ico('bloqueado', '🔒');
import { grantCard, type GrantResult } from '../core/banner';
import { firstClearOffer } from '../core/firstPick';
import { ENERGY_COST, energyMax, goldFor, profileXpFor, spendEnergy } from '../core/profile';
import { app, save, persist, activeLeader, leaderLevel, prof, energyNow, levelNote, grantProfileAndGold, pendingLevelNote, setPendingLevelNote, noEnergy } from './state';
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
  `<span class="stars-row" aria-label="${starCount(mask)} de ${STAR_COUNT} estrelas">${[0, 1, 2].map((i) => `<i class="${mask & (1 << i) ? 'on' : ''} ${fresh & (1 << i) ? 'new' : ''}">${ico(mask & (1 << i) ? 'estrela' : 'estrela-vazia', '★')}</i>`).join('')}</span>`;
export type NodeState = 'done' | 'next' | 'lock';
export const nodeState = (diff: Difficulty, id: number): NodeState => (isCleared(save, diff, id) ? 'done' : stageUnlocked(save, diff, id) ? 'next' : 'lock');

/**
 * v0.39.0: Aventura = MAPA DO MUNDO — as 10 regiões num caminho pontilhado na horizontal (abas de dificuldade no topo).
 * Tocar numa região liberada abre o mapa dela (as 10 fases num caminho na vertical, como antes). `region` abre direto
 * o mapa da região (ex.: ao voltar de uma batalha).
 */
export function adventure(region?: number): void {
  leaveBattleMode();
  if (region) return regionMap(region);
  const diff = advDiff();
  app.innerHTML = `<div class="screen adventure">${topbar('Aventura')}
    ${diffTabs(diff)}
    ${teamReady(save) ? '' : `<p class="warn-bar">⚠ Baralho inválido: ${esc(deckIssue(save) ?? '')}. <button class="btn small" data-nav="collection">Arrumar baralho</button></p>`}
    <p class="world-title">${ico('mapa', '🗺')} Mapa do mundo</p>
    <div class="world-map" id="worldMap"><div class="world-track" id="worldTrack"></div></div>
  </div>`;
  bindNav();
  bindDiffTabs(() => adventure());
  drawWorld(true);
}

/** Abas de dificuldade (iguais no mapa do mundo e no mapa da região). */
const diffTabs = (diff: Difficulty) => `<div class="diff-tabs" role="tablist">${DIFFICULTIES.map((d) => {
  const open = difficultyUnlocked(save, d);
  return `<button class="diff-tab ${d === diff ? 'on' : ''} ${open ? '' : 'locked'}" role="tab" aria-selected="${d === diff}" data-diff="${d}">${open ? ico(`dif-${d}`, DIFFICULTY_ICON[d]) : LOCK()} ${DIFFICULTY_LABEL[d]}</button>`;
}).join('')}</div>`;
function bindDiffTabs(redraw: () => void) {
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
      redraw();
    }),
  );
}

/** Estado da região no mapa do mundo: concluída (fase 10 vencida), a próxima (liberada) ou bloqueada. */
export const regionState = (diff: Difficulty, region: number): NodeState =>
  isCleared(save, diff, region * STAGES_PER_REGION) ? 'done' : regionUnlocked(save, diff, region) ? 'next' : 'lock';
/** Posição vertical de cada região no caminho do mundo (fração da altura), para o caminho ondular. */
export const WORLD_Y = [0.62, 0.36, 0.6, 0.34, 0.62, 0.38, 0.6, 0.34, 0.6, 0.4];
export const WORLD_STEP = 150;

/** Desenha o caminho das regiões com a altura atual (de novo ao girar/redimensionar a tela). */
export function drawWorld(scrollToNext = false) {
  const map = app.querySelector<HTMLElement>('#worldMap');
  const track = app.querySelector<HTMLElement>('#worldTrack');
  if (!map || !track) return;
  const diff = advDiff();
  const h = Math.max(240, track.clientHeight || 300);
  const w = WORLD_STEP * REGION_COUNT;
  const pos = REGIONS.map((_, i) => [WORLD_STEP / 2 + i * WORLD_STEP, Math.round(WORLD_Y[i] * h)] as const);
  const states = REGIONS.map((r) => regionState(diff, r.id));
  const segs = pos.slice(0, -1).map(([x1, y1], i) => {
    const [x2, y2] = pos[i + 1];
    const mx = (x1 + x2) / 2;
    return `<path class="adv-path ${states[i] === 'done' ? 'lit' : ''}" d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}"/>`;
  });
  track.style.width = `${w}px`;
  track.innerHTML = `<svg class="adv-paths" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${segs.join('')}</svg>
    ${REGIONS.map((r, i) => {
      const state = states[i];
      const ids = regionStageIds(r.id);
      const won = ids.filter((id) => isCleared(save, diff, id)).length;
      const stars = ids.reduce((n, id) => n + starCount(starsOf(save, diff, id)), 0);
      return `<button class="world-node ${state}" data-region="${r.id}" style="left:${pos[i][0]}px;top:${pos[i][1]}px" aria-label="Região ${r.id}: ${esc(r.name)}">
        <span class="world-ball">${state === 'lock' ? LOCK() : regionIcon(r)}</span>
        <span class="world-name">${r.id}. ${esc(r.name)}</span>
        ${state === 'lock' ? '' : `<span class="world-prog">${won}/${STAGES_PER_REGION} fases · ${ico('estrela', '★')} ${stars}/${STAGES_PER_REGION * STAR_COUNT}</span>`}
        ${state === 'next' ? '<span class="adv-tag">ATUAL</span>' : ''}
      </button>`;
    }).join('')}`;
  track.querySelectorAll<HTMLElement>('[data-region]').forEach((el) =>
    el.addEventListener('click', () => {
      const r = +el.dataset.region!;
      if (!regionUnlocked(save, diff, r)) {
        void gameAlert('Região bloqueada', `Vença a fase 10 de ${REGIONS[r - 2].name} no ${DIFFICULTY_LABEL[diff]} para liberar ${REGIONS[r - 1].name}.`, '🔒');
        return;
      }
      regionMap(r);
    }),
  );
  if (scrollToNext) {
    const k = Math.max(0, states.indexOf('next') >= 0 ? states.indexOf('next') : states.lastIndexOf('done'));
    map.scrollLeft = Math.max(0, pos[k][0] - map.clientWidth / 2);
  }
}

/** v0.20.0: mapa da região — as 10 fases como bolinhas num caminho pontilhado (v0.39.0: com o botão de voltar ao mundo). */
export function regionMap(region: number): void {
  leaveBattleMode();
  const diff = advDiff();
  if (!regionUnlocked(save, diff, region)) return adventure();
  save.region = region;
  persist();
  const r = REGIONS[region - 1];
  app.innerHTML = `<div class="screen adventure">${topbar('Aventura')}
    ${diffTabs(diff)}
    ${teamReady(save) ? '' : `<p class="warn-bar">⚠ Baralho inválido: ${esc(deckIssue(save) ?? '')}. <button class="btn small" data-nav="collection">Arrumar baralho</button></p>`}
    <div class="region-bar"><button class="btn small" data-world>${ico('mapa', '◀')} Mundo</button><b>${regionIcon(r)} Região ${r.id} · ${esc(r.name)}</b></div>
    <div class="adv-map" id="advMap"><div class="adv-track" id="advTrack"></div></div>
  </div>`;
  bindNav();
  bindDiffTabs(() => (regionUnlocked(save, advDiff(), region) ? regionMap(region) : adventure()));
  app.querySelector('[data-world]')!.addEventListener('click', () => adventure());
  drawMap(true);
}

/** Desenha o caminho e as fases da região aberta com a largura atual (de novo ao girar/redimensionar a tela). */
export function drawMap(scrollToNext = false) {
  const map = app.querySelector<HTMLElement>('#advMap');
  const track = app.querySelector<HTMLElement>('#advTrack');
  if (!map || !track) return;
  const diff = advDiff();
  const stages = regionStageIds(save.region ?? 1).map(getStage);
  const w = track.clientWidth || 360;
  const h = MAP_TOP + MAP_STEP * (stages.length - 1) + MAP_BOTTOM;
  const pos = stages.map((_, i) => [Math.round(MAP_X[i] * w), h - MAP_BOTTOM - i * MAP_STEP] as const);
  const states = stages.map((st) => nodeState(diff, st.id));
  const segs = pos.slice(0, -1).map(([x1, y1], i) => {
    const [x2, y2] = pos[i + 1];
    const my = (y1 + y2) / 2;
    // o trecho acende quando a fase de baixo já foi vencida
    return `<path class="adv-path ${states[i] === 'done' ? 'lit' : ''}" d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}"/>`;
  });
  track.style.height = `${h}px`;
  track.innerHTML = `<svg class="adv-paths" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${segs.join('')}</svg>
    ${stages.map((st, i) => {
      const state = states[i];
      const left = state === 'done' ? dailyLeft(save.daily, diff, st.id) : 0;
      const local = localOf(st.id);
      return `<button class="adv-node ${state}" data-st="${st.id}" style="left:${pos[i][0]}px;top:${pos[i][1]}px" aria-label="Fase ${stageLabel(st.id)}: ${esc(st.name)}">
        ${enemyCommanderArt(stageCommander(stageFor(st.id, diff)), 'adv-cmd', `animation-delay:-${(i * 0.37).toFixed(2)}s`)}
        <span class="adv-ball">${state === 'done' ? ico('concluida', '✓') : state === 'next' ? local : LOCK()}</span>
        ${state === 'done' ? `<span class="adv-stars">${starsHTML(starsOf(save, diff, st.id))}</span>` : ''}
        <span class="adv-name">${local}. ${esc(st.name)}</span>
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
  mapResize = window.setTimeout(() => {
    drawMap();
    drawWorld();
  }, 150);
});

/** Janela da fase: informações, Jogar (em cima) e Repetir (embaixo), com o limite do dia. */
export function stageDialog(stageId: number) {
  const diff = advDiff();
  const state = nodeState(diff, stageId);
  if (state === 'lock') {
    void gameAlert('Fase bloqueada', `Vença a fase ${stageLabel(stageId - 1)} no ${DIFFICULTY_LABEL[diff]} para liberar esta.`, '🔒');
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
    title: `Fase ${stageLabel(st.id)} · ${st.name}`,
    html: `<button class="stage-close" data-x aria-label="Fechar">${ico('fechar', '✕')}</button>
      <div class="stage-cols"><div class="stage-col">${enemyCommanderArt(stageCommander(st), 'stage-cmd')}
      <p class="stage-diff">${regionIcon(REGIONS[regionOf(st.id) - 1])} ${esc(REGIONS[regionOf(st.id) - 1].name)} · Dificuldade <b>${DIFFICULTY_LABEL[diff]}</b></p>
      <div class="stage-foes"><span class="stage-foes-lbl">Destaques do rival</span>${[...foes].sort((a, b) => b.stars * 3 + stepOf(b) - (a.stars * 3 + stepOf(a))).filter((c, k, arr) => arr.findIndex((x) => x.charId === c.charId) === k).slice(0, 2).map((c) => `<span class="stage-foe" style="${starStyle(c.stars)}" title="${esc(getChar(c.charId).name)}">${faceUrl(c.charId) ? `<img src="${faceUrl(c.charId)}" alt="" draggable="false">` : ''}<small>${esc(getChar(c.charId).name.split(' ')[0])}</small></span>`).join('')}${foeSpells.length ? foeSpells.map((sp) => spellMiniHTML(sp.id)).join('') : ''}</div>
      <p class="stage-line">Recompensa: ${essIcon()}${r.essencias} ${orbBagHTML(r.orbs)}${diff === 'dificil' ? ` · chance de ${orbHTML('orbe5')} ${orbHTML('orbe6')}` : ''}${!done && gemsFor(st.id) ? ` · 1ª vitória: ${gemHTML(`+${gemsFor(st.id)}`)} ${gemsFor(st.id) > 1 ? 'Gemas' : 'Gema'} de Invocação` : ''}${!done && spellRewardFor(st.id, diff) ? (() => { const sp = getSpell(spellRewardFor(st.id, diff)!); return ` · 1ª vitória: <span class="spell-pill" style="${starStyle(sp.rarity)}">${spellMiniHTML(sp.id)} ${esc(sp.name)}</span> <small>(feitiço ${STAR_COLORS[sp.rarity].label})</small>`; })() : ''}</p>
      <p class="stage-line stage-items">Itens: ${stageGearIds(stageId).map((id) => gearHTML(id, stageGearRarity(stageId, diff)[0])).join(' ')} <button class="banner-info stage-info" data-dropinfo aria-label="Chances dos itens" title="Chances dos itens">i</button></p>
      </div><div class="stage-col">
      <ul class="stage-goals">${starGoals(diff, stageId).map((g, i) => `<li class="${mask & (1 << i) ? 'on' : ''}"><i>${ico(mask & (1 << i) ? 'estrela' : 'estrela-vazia', '★')}</i> ${esc(goalPlain(g.text))}</li>`).join('')}</ul>
      <p class="stage-line stage-xp">Por vitória ou Repetir: ${goldHTML(goldFor(stageId, diff))} · ${ico('perfil', '👤')} +${profileXpFor(stageId, diff)} XP de perfil${done ? '' : ' <small>(em dobro na primeira vitória)</small>'} · você tem ${energyHTML(energyNow(), energyMax(prof()))}</p>
      ${done ? `<p class="stage-left ${left ? '' : 'out'}">${left ? `Hoje: <b>${left}/${DAILY_LIMIT}</b> restantes` : 'Limite de hoje atingido. Volta amanhã.'}</p>` : ''}
      <div class="stage-actions">
        <button class="btn primary big" data-act="play" ${play ? '' : 'disabled'}>${ico('lutar', '⚔')} Jogar <span class="cost">${ico('energia', '⚡')}${ENERGY_COST[diff]}</span></button>
        ${done ? `<button class="btn big" data-act="repeat" ${repeat ? '' : 'disabled'}>${ico('atualizar', '⟲')} Repetir <span class="cost">${ico('energia', '⚡')}${ENERGY_COST[diff]}</span></button>` : ''}
      </div>
      ${done && !full ? `<p class="stage-note">${ico('atualizar', '⟲')} Repetir libera com as ${STAR_COUNT} ${ico('estrela', '⭐')} desta fase.</p>` : ''}</div></div>`,
    buttons: [],
    onMount: (root, close) => {
      root.querySelector('.dialog')?.classList.add('stage-dialog');
      root.querySelector('[data-x]')!.addEventListener('click', () => close('cancel'));
      root.querySelector('[data-dropinfo]')?.addEventListener('click', () => void dropInfo(stageId, diff));
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


/** v0.52.1: ⓘ dos itens da fase — as chances detalhadas, fora da frente da janela. */
function dropInfo(stageId: number, diff: Difficulty) {
  const [lo, hi] = stageGearRarity(stageId, diff);
  const ids = stageGearIds(stageId);
  const rare = GEAR_RARE_CHANCE[diff] * 100;
  return showDialog({
    title: 'Chances dos itens',
    html: `<p class="hint">Cada vitória dá ${ids.length} itens desta fase:</p>
      <div class="drop-info-items">${ids.map((id) => gearHTML(id, lo)).join(' ')}</div>
      <p>${hi > lo ? `<b>${100 - rare}%</b> ${STAR_COLORS[lo].label} · <b>${rare}%</b> ${STAR_COLORS[hi].label}` : `<b>100%</b> ${STAR_COLORS[lo].label}`}</p>
      ${diff === 'dificil' ? `<p>Orbes extras no Difícil: ${orbHTML('orbe5')} <b>${HARD_LEGENDARY_CHANCE * 100}%</b> · ${orbHTML('orbe6')} <b>${HARD_MYTHIC_CHANCE * 100}%</b></p>` : ''}`,
    buttons: [],
  });
}

/** v0.27.0: mostra uma carta recebida (personagem novo ou cópia repetida guardada, v0.32.0; v0.41.0: feitiço). */
export function grantedHTML(g: GrantResult): string {
  if (isSpell(g.charId)) {
    const sp = getSpell(g.charId);
    if (g.isNew) {
      // só entra sozinho no baralho se já houver lá quem conjure (senão ficaria parado na mão)
      const caster = save.deck.some((id) => !isSpell(id) && save.cards[id] && sp.categories.includes(getChar(id).category));
      const joined = caster && addToDeck(save, sp.id) > 0;
      return `<div class="unlock" style="${starStyle(g.stars)}">${spellCardHTML(sp.id, { compact: true })}<div><b>Novo feitiço!</b><br>${sp.icon} ${esc(sp.name)} · ${tierHTML(g.stars)}<br><small>Conjurador: ${esc(spellCastersLabel(sp))}${joined ? ' · entrou direto no seu baralho' : caster ? '' : ' · coloque no baralho (Coleção) quando tiver quem conjure'}</small></div></div>`;
    }
    const joined = save.deck.includes(sp.id) && g.copies <= MAX_COPIES && setCopiesIfRoom(sp.id);
    return `<div class="unlock dup" style="${starStyle(g.stars)}">${spellCardHTML(sp.id, { compact: true })}<div><b>Repetido:</b> ${sp.icon} ${esc(sp.name)} ${tierHTML(g.stars)}<br>${ico('colecao', '🃏')} <b>+1 cópia</b> · agora você tem <b>${g.copies}</b><br><small>${joined ? 'A cópia entrou no seu baralho.' : g.copies > MAX_COPIES ? `Sobra guardada no ${ico('inventario', '🎒')} Inventário (Desmanchar).` : 'Ajuste as cópias no baralho na Coleção.'}</small></div></div>`;
  }
  const def = getChar(g.charId);
  if (g.isNew) {
    const joined = addToDeck(save, def.id) > 0;
    return `<div class="unlock" style="${starStyle(g.stars)}">${cardHTML(save.cards[def.id], { compact: true })}<div><b>Novo personagem!</b><br>${esc(def.name)} — ${raceHTML(def)} ${categoryHTML(def, true)} · ${tierHTML(g.stars)}${joined ? '<br><small>Entrou direto no seu baralho.</small>' : ''}</div></div>`;
  }
  // v0.32.0: o repetido vira mais 1 cópia guardada (o Desmanchar, no 🎒 Inventário, decide o que fazer com ela)
  return `<div class="unlock dup" style="${starStyle(g.stars)}">${cardHTML({ charId: g.charId, stars: g.stars }, { compact: true })}<div><b>Repetido:</b> ${esc(def.name)} ${tierHTML(g.stars)}<br>${ico('colecao', '🃏')} <b>+1 cópia</b> · agora você tem <b>${g.copies}</b><br><small>Guardada no ${ico('inventario', '🎒')} Inventário (Desmanchar).</small></div></div>`;
}

/** v0.41.0: feitiço repetido que já está no baralho ganha +1 cópia nele, se couber. */
function setCopiesIfRoom(id: string): boolean {
  const cur = copiesIn(save, id);
  return cur < maxCopiesFor(save, id) && setCopies(save, id, cur + 1) > cur;
}

/** Entrega uma carta (personagem ou, v0.41.0, feitiço) na raridade inicial dela e mostra o que veio. */
export function grantOne(id: string): string {
  return grantedHTML(grantCard(save.cards, { charId: id, stars: isSpell(id) ? getSpell(id).rarity : getChar(id).minStars }, (save.dupes ??= {}), (save.spells ??= {})));
}

/** v0.25.0: dá as cartas do pacote (entram direto no baralho se couber). v0.32.0: o repetido vira mais 1 cópia guardada. */
export function grantPack(ids: string[]): string {
  return ids.map(grantOne).join('');
}

/** Dá a recompensa inteira da fase na dificuldade (vitória ou Repetir; v0.22.0: Orbes pela dificuldade, com as chances do Difícil). */
export function grantRewards(st: Stage, diff: Difficulty, first = false) {
  const r = rewardsFor(st.id, diff);
  // v0.24.1: a primeira vitória dá os itens da fase de novo (bônus), então ganha 2 de cada
  if (first) r.gear.push(...stageGearDrop(st.id, diff));
  for (const o of XP_ITEMS) save.items[o.id] += r.orbs[o.id] ?? 0;
  save.essencias += r.essencias;
  for (const g of r.gear) addGear((save.gear ??= {}), g.id, g.rarity);
  return `<div class="res big"><span>${essIcon()} +${r.essencias}</span>${XP_ITEMS.filter((o) => r.orbs[o.id]).map((o) => `<span class="orb-pill">${orbHTML(o.id, `+${r.orbs[o.id]}`)}</span>`).join('')}${r.gear.map((g) => gearHTML(g.id, g.rarity, '+1')).join('')}</div>`;
}

/** v0.22.0: XP por jogar — ao vencer jogando, todo o baralho ganha XP. */
export function grantPlayXp(stageId: number, first = false): string {
  // v0.24.1: na primeira vitória o XP por jogar vem em dobro
  const xp = playXp(stageId) * (first ? FIRST_WIN_XP_MULT : 1);
  let full = 0;
  for (const id of save.deck) if (!isSpell(id) && save.cards[id] && feedXp(save.cards[id], xp).filled) full++;
  return `<p class="hint">${ico('evoluir', '📈')} +${xp} XP para cada personagem do baralho${full ? ` · ${full} barra(s) cheia(s): suba o degrau em Treinar` : ''}</p>`;
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
  resultModal(`<h2 class="win">⟲ Fase ${stageLabel(st.id)} repetida</h2><p>${esc(st.name)} · ${DIFFICULTY_LABEL[diff]}</p>${got}<p class="hint">Hoje: <b>${dailyLeft(save.daily, diff, stageId)}/${DAILY_LIMIT}</b> restantes nesta fase.</p>`);
}

export function resultModal(html: string) {
  // v0.52.2: o ✕ do canto (e qualquer saída) leva para a seleção de fases, nunca de volta à batalha terminada
  modal(`${html}<div class="row"><button class="btn primary" data-m="adv">Continuar</button><button class="btn" data-m="train">Treinar</button><button data-m="close" hidden></button></div>`, (m) => {
    m.querySelector('[data-m=close]')!.addEventListener('click', () => {
      closeModal();
      adventure(save.region);
    });
    // v0.52.1: com escolha de carta pendente, Continuar/Treinar só liberam depois de escolher
    const box = m.querySelector<HTMLElement>('[data-pick-box]');
    if (box) {
      const btns = [...m.querySelectorAll<HTMLButtonElement>('[data-m=adv], [data-m=train], [data-m=close]')];
      btns.forEach((b) => (b.disabled = true));
      box.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach((el) =>
        el.addEventListener('click', () => {
          box.innerHTML = grantOne(el.dataset.pick!);
          persist();
          btns.forEach((b) => (b.disabled = false));
        }),
      );
    }
    m.querySelector('[data-m=adv]')!.addEventListener('click', () => {
      closeModal();
      adventure(save.region);
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
  const arena = arenaAttrs(stageId);
  app.innerHTML = `<div class="screen battle-screen${arena.cls}" id="bs"${arena.style}></div>`;
  new BattleView(app.querySelector('#bs')!, stage, deck, {
    speed: () => save.speed || 1,
    setSpeed: (n) => {
      save.speed = n;
      persist();
    },
    onExit: () => adventure(regionOf(stageId)),
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
    const starsLine = `<div class="win-stars">${starsHTML(mask, fresh)}</div><ul class="stage-goals">${starGoals(diff, stageId).map((g, i) => `<li class="${mask & (1 << i) ? 'on' : ''}"><i>${ico(mask & (1 << i) ? 'estrela' : 'estrela-vazia', '★')}</i> ${esc(goalPlain(g.text))}${fresh & (1 << i) ? ' <b class="new-tag">nova!</b>' : ''}</li>`).join('')}</ul>${fresh && starCount(mask) === STAR_COUNT ? '<p class="hint">⟲ Repetir liberado nesta fase!</p>' : ''}`;
    // v0.33.0: no lugar do pacote de personagens, 💠 Gemas de Invocação na primeira vitória (fases 3, 6, 9 e 10)
    const gems = first ? gemsFor(stageId) : 0;
    save.gems = (save.gems ?? 0) + gems;
    const gemLine = gems ? `<div class="res big"><span>${gemHTML(`+${gems}`)} ${gems > 1 ? 'Gemas' : 'Gema'} de Invocação</span></div><p class="hint">Use na ${ico('loja', '🏪')} Loja: cada gema compra 1 carta do ${ico('banner', '🎴')} Banner.</p>` : '';
    // v0.41.0: ✦ carta de feitiço na primeira vitória das fases 2, 5 e 8 de cada região
    const spell = first ? spellRewardFor(stageId, diff) : undefined;
    const unlocked = gemLine + (spell ? grantOne(spell) : '');
    // v0.28.0: vencer a fase N libera a mesma fase na dificuldade seguinte (se a anterior dela já foi vencida)
    const nextDiff = DIFFICULTIES[DIFFICULTIES.indexOf(diff) + 1];
    const opened = first && nextDiff && stageUnlocked(save, nextDiff, stageId) ? nextDiff : undefined;
    // v0.39.0: vencer a fase 10 de uma região libera a próxima região (nesta dificuldade)
    const nextRegion = first && localOf(stageId) === STAGES_PER_REGION && regionOf(stageId) < REGION_COUNT ? REGIONS[regionOf(stageId)] : undefined;
    const regionOpened = nextRegion ? `<p class="hint">${ico('liberado', '🗺')} Nova região liberada: <b>${regionIcon(nextRegion)} ${esc(nextRegion.name)}</b>!</p>` : '';
    // v0.52.1: primeira vitória — escolha 1 entre 3 cartas do rival
    const offer = first ? firstClearOffer(stage.enemyDeck) : [];
    const pickLine = offer.length ? `<div class="first-pick" data-pick-box><p class="first-pick-t">Escolha 1 carta do rival</p><div class="first-pick-row">${offer.map((id) => { const c = getChar(id); return `<button class="first-pick-opt" data-pick="${id}" style="${starStyle(c.minStars)}">${faceUrl(id) ? `<img src="${faceUrl(id)}" alt="" draggable="false">` : ''}<b>${esc(c.name.split(' ')[0])}</b><small>${tierHTML(c.minStars)}</small></button>`; }).join('')}</div></div>` : '';
    html = `<h2 class="win">${ico('vitoria', '🏆')} Vitória!</h2><p>${first ? 'Primeira vitória nesta fase!' : `Hoje: <b>${dailyLeft(save.daily, diff, stageId)}/${DAILY_LIMIT}</b> restantes nesta fase.`}</p>
      ${starsLine}${got}${opened ? `<p class="hint">🔓 Fase ${stageLabel(stageId)} liberada no <b>${DIFFICULTY_LABEL[opened]}</b>!</p>` : ''}${regionOpened}${unlocked}${pickLine}`;
  } else {
    save.items.orbe1 += 1;
    html = `<h2 class="lose">${winner === 'empate' ? `${ico('empate', '⏱')} Empate` : `${ico('derrota', '💀')} Derrota`}</h2><p>Treine seus personagens com Orbes e tente de novo! (+1 Orbe Comum)</p>`;
  }
  html += pendingLevelNote;
  setPendingLevelNote('');
  persist();
  resultModal(html);
}
