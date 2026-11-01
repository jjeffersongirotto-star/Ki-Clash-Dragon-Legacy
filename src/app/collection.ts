import { bindCardEditor } from './tempCardBalanceEditor'; // TEMP card balance editor
/**
 * Coleção & Baralho, Comandante (evoluir) e detalhes das cartas.
 * v0.28.1: separado do main.ts (organização do código, sem mudar o jogo).
 */
import { bakeCards } from '../ui/cardBake';
import { waitFor } from '../core/battle';
import { CATEGORY_INFO, PLAYABLE, RACE_INFO, getChar, isComingSoon } from '../core/characters';
import { cardMatches, toggleSel } from '../core/cardFilter';
import { MAX_STEP, TIER_NAMES, statsFor, stepOf, tierLabel } from '../core/progression';
import { playerLeaderImg, unitSpriteHTML } from '../ui/art';
import { cardPower } from '../core/power';
import { canEvolve, evolveLeader, leaderHp, leaderMaxLevel, nextRequirement } from '../core/leaders';
import { abilityListHTML, cardHTML, raceIcon, catIcon, categoryHTML, dmgLabel, esc, raceHTML, reachLabel, spellCardHTML, spellCastersLabel, spellInfoHTML, starStyle, tierHTML, gemHTML } from '../ui/components';
import { ico } from '../ui/icons';
import { SPELLS, getSpell, isSpell } from '../core/spells';
import { gameAlert, showDialog } from '../ui/dialog';
import { leaveBattleMode } from '../ui/orientation';
import { MAX_COPIES, addToDeck, deckMin, copiesIn, spellCopies, maxCopiesFor, deckCount, deckIssue, deckMax, profileLevel, removeFromDeck, setCopies } from '../ui/save';
import { app, save, setTrainSel, persist, unlockStage, entryName, teamPower, activeLeader, leaderLevel, fmt } from './state';
import { topbar, bindNav, modal, closeModal, bakeAllGrid } from './ui';
import { train } from './train';

// v0.55.1: filtros com várias escolhas — OU dentro do mesmo filtro, E entre filtros (ex.: Humano + DPS)
const raceSel = new Set<string>();
const typeSel = new Set<string>();

export function leaderPanelHTML(): string {
  const def = activeLeader();
  const lv = leaderLevel();
  const max = leaderMaxLevel(def);
  const hp = leaderHp(def, lv);
  const power = teamPower();
  const req = nextRequirement(def, lv);
  const ready = canEvolve(def, lv, power);
  const prev = def.thresholds[lv - 1];
  const pct = req == null ? 100 : Math.max(0, Math.min(100, ((power - prev) / Math.max(1, req - prev)) * 100));
  return `<section class="leader-panel ${ready ? 'ready' : ''}">
    <div class="lp-fig"><div class="hero-aura"></div>${playerLeaderImg()}</div>
    <div class="lp-info">
      <div class="lp-name"><b>👑 Comandante ${esc(def.name)}</b> <span class="lp-lvl">Nv.${lv}/${max}</span></div>
      <div class="lp-hp">❤ <b>${hp}</b> de vida máxima${req != null ? ` <small>→ ${leaderHp(def, lv + 1)} no Nv.${lv + 1}</small>` : ''}</div>
      <div class="lp-power"><span class="lp-power-label">Poder do baralho</span><span class="lp-power-val">⚡ ${fmt(power)}</span></div>
      ${req != null
        ? `<div class="lp-req"><div class="lp-bar"><i style="width:${pct.toFixed(1)}%"></i></div><small>${ready ? `Pronto! Requisito do Nv.${lv + 1}: ⚡ ${fmt(req)}` : `Próximo nível: ⚡ ${fmt(req)} <span class="warn">(faltam ${fmt(req - power)})</span>`}</small></div>`
        : '<div class="lp-req"><small>Nível máximo!</small></div>'}
      <button class="btn small ${ready ? 'primary' : ''}" id="lpEvolve" ${req == null ? 'disabled' : ''}>${ico('evoluir', '⬆')} Evoluir</button>
    </div>
  </section>`;
}

export async function evolveDialog() {
  const def = activeLeader();
  const lv = leaderLevel();
  const power = teamPower();
  const req = nextRequirement(def, lv);
  if (req == null) return;
  const ready = canEvolve(def, lv, power);
  const v = await showDialog({
    title: ready ? `Evoluir o Comandante ${def.name}?` : 'Poder insuficiente',
    html: `<div class="evo-leader">
        <div class="lp-fig evo-fig"><div class="hero-aura"></div>${playerLeaderImg()}</div>
        <div class="evo-rows">
          <div class="evo-row"><span>Nível</span><b>${lv}</b><i>→</i><b class="up">${lv + 1}</b></div>
          <div class="evo-row"><span>❤ Vida</span><b>${leaderHp(def, lv)}</b><i>→</i><b class="up">${leaderHp(def, lv + 1)}</b></div>
          <div class="evo-row"><span>⚡ Poder</span><b class="${ready ? 'up' : 'warn'}">${fmt(power)}</b><i>/</i><b>${fmt(req)}</b></div>
        </div>
      </div>
      <p class="dialog-msg">${ready
        ? 'O Poder do baralho só é conferido <b>agora</b>. Depois de evoluir, pode trocar cartas à vontade: o Comandante <b>nunca perde o nível</b>. Evoluir é grátis.'
        : `Faltam <b>⚡ ${fmt(req - power)}</b> de Poder na equipe para evoluir o Comandante. Treine e desperte as cartas (ou coloque cartas mais fortes na equipe) e volte aqui.`}</p>`,
    icon: ready ? '👑' : '⚡',
    buttons: ready
      ? [{ label: 'Agora não', value: 'cancel', kind: 'ghost' }, { label: '⬆ Evoluir', value: 'ok', kind: 'primary' }]
      : [{ label: 'Entendi', value: 'cancel', kind: 'primary' }],
  });
  if (v !== 'ok') return;
  const r = evolveLeader(def, lv, teamPower());
  if (!r.ok) return;
  save.leaders = { ...(save.leaders ?? {}), [def.id]: { level: Math.max(lv, r.level) } };
  persist();
  collection();
  await gameAlert(`Comandante ${def.name} Nv.${r.level}!`, `Vida máxima do Comandante: ${leaderHp(def, r.level)}.`, '👑');
}

// ---------------- COLEÇÃO ----------------
export function collection() {
  leaveBattleMode();
  void bakeAllGrid();
  const byPower = (a: string, b: string) => {
    const A = save.cards[a], B = save.cards[b];
    return cardPower(B) - cardPower(A) || B.stars - A.stars || stepOf(B) - stepOf(A) || getChar(a).cost - getChar(b).cost;
  };
  const matchRace = (id: string) => cardMatches(getChar(id).race, [getChar(id).category], raceSel, typeSel);
  const owned = PLAYABLE.filter((d) => save.cards[d.id] && matchRace(d.id)).map((d) => d.id).sort(byPower);
  const lockOrder = (id: string) => (isComingSoon(getChar(id)) ? 999 : unlockStage(id) ?? 99);
  const locked = PLAYABLE.filter((d) => !save.cards[d.id] && matchRace(d.id)).sort((a, b) => lockOrder(a.id) - lockOrder(b.id));
  const lockBadge = (id: string) => (unlockStage(id) ? `🔒 Fase ${unlockStage(id)}` : `${ico('banner', '🎴')} Banner`); // v0.33.0: sem pacote de fase, tudo vem do Banner
  // v0.41.0: feitiços que você tem primeiro; os outros aparecem bloqueados (vêm do Banner e das fases)
  const spellOk = (sp: (typeof SPELLS)[number]) => cardMatches(null, sp.categories, raceSel, typeSel);
  const ownedSpells = SPELLS.filter((sp) => spellOk(sp) && spellCopies(save, sp.id) > 0);
  const lockedSpells = SPELLS.filter((sp) => spellOk(sp) && spellCopies(save, sp.id) <= 0).sort((a, b) => a.rarity - b.rarity);
  const count = deckCount(save);
  const max = deckMax(save);
  const issue = deckIssue(save);
  const entryHTML = (id: string) => {
    const n = copiesIn(save, id);
    const card = isSpell(id)
      ? spellCardHTML(id, { compact: true, extraClass: 'grid-card', attrs: `data-card="${id}"` })
      : cardHTML(save.cards[id], { compact: true, grid: true, attrs: `data-card="${id}"`, power: cardPower(save.cards[id]) });
    return `<div class="deck-entry">${card}<div class="copies" data-copies="${id}"><button class="cp-btn" data-cp="-1" aria-label="Menos uma cópia" ${n <= 1 ? 'disabled' : ''}>−</button><b>×${n}</b><button class="cp-btn" data-cp="1" aria-label="Mais uma cópia" title="${n >= maxCopiesFor(save, id) && n < MAX_COPIES ? `Você tem ${maxCopiesFor(save, id)} cópia(s) desta carta` : ''}" ${n >= maxCopiesFor(save, id) || count >= max ? 'disabled' : ''}>+</button></div></div>`;
  };
  app.innerHTML = `<div class="screen">${topbar('Coleção & Baralho')}
    ${leaderPanelHTML()}
    <section class="deck-bar">
      <div class="deck-title"><span class="deck-power" title="Poder do baralho = soma do Poder de cada personagem do baralho (uma vez cada; feitiços não contam)">⚡ ${fmt(teamPower())}</span> Baralho <b>${count}/${max}</b> <small>(nível de perfil ${profileLevel(save)} · mínimo ${deckMin(save)} · até ${MAX_COPIES} cópias por carta${issue ? ` · <span class="warn">${esc(issue)}</span>` : ''})</small></div>
      <div class="deck-slots deck-copies">${save.deck.map(entryHTML).join('')}${count < max ? '<div class="slot">+</div>' : ''}</div>
    </section>
    <div class="race-filters">
      <button class="rf-btn ${raceSel.size + typeSel.size === 0 ? 'active' : ''}" data-rf="all">🌟 Todos (${PLAYABLE.length})</button>
      ${Object.entries(RACE_INFO).map(([k, r]) => `<button class="rf-btn ${raceSel.has(k) ? 'active' : ''}" data-rf="${k}" style="--race-c:${r.color}">${raceIcon(k)} ${r.label}</button>`).join('')}
    </div>
    <div class="race-filters type-filters">
      <span class="rf-lbl">Tipo:</span>
      ${Object.entries(CATEGORY_INFO).map(([k, c]) => `<button class="rf-btn ${typeSel.has(k) ? 'active' : ''}" data-tf="${k}">${catIcon(k)} ${c.label}</button>`).join('')}
    </div>
    <p class="hint">Toque numa carta para inspecionar a evolução visual de raridade em raridade (Comum → Mítico), ver o sprite de arena e editar a equipe.</p>
    <h3 class="sec-title">Seus personagens <small>(${owned.length})</small></h3>
    <div class="card-grid">${owned.map((id) => cardHTML(save.cards[id], { grid: true, power: cardPower(save.cards[id]), attrs: `data-card="${id}"`, badge: save.deck.includes(id) ? `✔ ×${copiesIn(save, id)}` : undefined, extraClass: save.deck.includes(id) ? 'in-deck' : '' })).join('')}</div>
    <h3 class="sec-title">✦ Feitiços <small>(${ownedSpells.length}/${SPELLS.length} · ocupam vagas do baralho; precisam de um aliado da categoria em campo)</small></h3>
    <div class="card-grid spell-grid">${ownedSpells.map((sp) => spellCardHTML(sp.id, { attrs: `data-card="${sp.id}"`, badge: save.deck.includes(sp.id) ? `✔ ×${copiesIn(save, sp.id)}` : `×${spellCopies(save, sp.id)}`, extraClass: save.deck.includes(sp.id) ? 'grid-card in-deck' : 'grid-card' })).join('')}</div>
    ${lockedSpells.length ? `<div class="divider"><span>${ico('bloqueado', '🔒')} Feitiços ainda não obtidos (${lockedSpells.length})</span></div>
    <div class="card-grid spell-grid locked-grid">${lockedSpells.map((sp) => spellCardHTML(sp.id, { locked: true, extraClass: 'grid-card', attrs: `data-card="${sp.id}"`, badge: `${ico('bloqueado', '🔒')} ${TIER_NAMES[sp.rarity]}` })).join('')}</div>
    <p class="hint soon-note">✦ <b>Feitiços:</b> saem no ${ico('banner', '🎴')} Banner (na raridade de cada um) e na 1ª vitória das fases 2, 5 e 8 de cada região.</p>` : ''}
    ${locked.length ? `<div class="divider"><span>${ico('bloqueado', '🔒')} Ainda não obtidos (${locked.length})</span></div>
    <div class="card-grid locked-grid">${locked.map((def) => cardHTML({ charId: def.id, stars: def.minStars }, { locked: true, grid: true, extraClass: isComingSoon(def) ? 'soon' : '', attrs: `data-card="${def.id}"`, badge: lockBadge(def.id) })).join('')}</div>
    ${locked.length ? `<p class="hint soon-note">${ico('banner', '🎴')} <b>No Banner:</b> ${locked.length > 3 ? `${locked.length} personagens` : locked.map((d) => esc(d.name)).join(' e ')} — compre cartas no Banner da 🏪 Loja (com Ouro de Dragão ou ${gemHTML()} Gemas de Invocação).</p>` : ''}` : ''}
  </div>`;
  bindNav();
  app.querySelectorAll<HTMLElement>('[data-rf]').forEach((el) =>
    el.addEventListener('click', () => {
      const k = el.dataset.rf!;
      if (k === 'all') {
        raceSel.clear();
        typeSel.clear();
      } else toggleSel(raceSel, k);
      collection();
    }),
  );
  app.querySelectorAll<HTMLElement>('[data-tf]').forEach((el) =>
    el.addEventListener('click', () => {
      toggleSel(typeSel, el.dataset.tf!);
      collection();
    }),
  );
  bindCardEditor(app, collection); // TEMP card balance editor
  app.querySelectorAll<HTMLElement>('[data-card]').forEach((el) => el.addEventListener('click', () => (isSpell(el.dataset.card!) ? spellDetail(el.dataset.card!) : cardDetail(el.dataset.card!))));
  app.querySelectorAll<HTMLElement>('[data-copies]').forEach((box) =>
    box.querySelectorAll<HTMLButtonElement>('[data-cp]').forEach((b) =>
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = box.dataset.copies!;
        setCopies(save, id, copiesIn(save, id) + +b.dataset.cp!);
        persist();
        collection();
      }),
    ),
  );
  app.querySelector('#lpEvolve')?.addEventListener('click', () => void evolveDialog());
  bakeCards(app); // v0.47.0: cartas da grade viram uma imagem só (rolagem sem buracos)
}

export function cardDetail(id: string, previewStars?: number) {
  const def = getChar(id);
  const owned = save.cards[id];
  const curStars = owned?.stars ?? def.minStars;
  const curPlus = stepOf(owned);
  const stars = previewStars ?? curStars;
  // a prévia de outra raridade mostra o degrau base; a raridade atual mostra o "+"/"++" se você já tiver
  const plus = stars === curStars ? curPlus : 0;
  const st = statsFor(def, stars, plus);
  const pow = cardPower({ charId: id, stars, plus });
  const inDeck = save.deck.includes(id);
  const starTabs: string[] = [];
  for (let s = def.minStars; s <= def.maxStars; s++) {
    starTabs.push(`<button class="star-tab ${s === stars ? 'active' : ''}" data-pstar="${s}" style="${starStyle(s)}">${tierLabel(s, s === curStars ? curPlus : 0)}${s === curStars && owned ? ' <small>(atual)</small>' : ''}</button>`);
  }
  // v0.31.0: ações em "cards" ao lado da carta (Colocar no baralho / Treinar) e ✕ no canto; sem botões embaixo
  const actions = owned
    ? `<button class="act-tile primary" data-m="deck"><i>${inDeck ? ico('tirar', '📤') : ico('colecao', '🃏')}</i><span>${inDeck ? 'Tirar do baralho' : 'Colocar no baralho'}</span></button><button class="act-tile" data-m="train"><i>${ico('treinar', '🔥')}</i><span>Treinar</span></button>`
    : '';
  const lockNote = owned ? '' : !unlockStage(id) ? `<p class="hint">${ico('banner', '🎴')} Personagem ${tierLabel(def.minStars)}: sai no <b>Banner</b> da ${ico('loja', '🏪')} Loja (com Ouro de Dragão ou ${gemHTML()} Gemas de Invocação).</p>` : `<p class="hint">${ico('bloqueado', '🔒')} Vença a fase ${unlockStage(id)} pela primeira vez para desbloquear.</p>`;
  modal(`<button class="modal-x" data-m="close" aria-label="Fechar" title="Fechar">${ico('fechar', '✕')}</button><div class="detail" style="${starStyle(stars)}">
    <div class="detail-left">
      <div class="detail-acts">${actions}</div>
      ${cardHTML({ charId: id, stars, plus }, { extraClass: 'detail-card', locked: !owned && previewStars == null, power: pow })}
      <div class="detail-sprite-box">
        <div class="ds-sprite">${unitSpriteHTML(def, { stars, side: 'player' })}</div>
        <div class="ds-label">Visual na Arena (${tierLabel(stars, plus)})<br><small>ATQ ${st.atk} | VIDA ${st.hp}</small></div>
      </div>
    </div>
    <div class="detail-info">
      <div class="detail-badges">${tierHTML(stars, plus)} ${raceHTML(def, true)} ${categoryHTML(def, true)}</div>
      <h2>${esc(def.name)} <span class="name-pow" title="Poder = 10 × peso da habilidade × √(ataque × vida)">${ico('poder', '⚡')}${fmt(pow)}</span></h2><div class="subtitle">${esc(def.title)}</div>
      <div><small>Faixa: ${tierLabel(def.minStars)} a ${tierLabel(def.maxStars, MAX_STEP)}</small></div>
      <div class="star-preview-bar">
        <span class="sp-label">${ico('seta-evolucao', '👁')} Ver evolução por raridade (roupa/poder):</span>
        <div class="sp-tabs">${starTabs.join('')}</div>
      </div>
      <div class="stat-row"><span title="Rodadas que a carta espera na mão até poder ser invocada">Espera <b>⏳ ${waitFor(def.id)}</b></span><span>Ataque <b>${st.atk}</b></span><span>Vida <b>${st.hp}</b></span><span>${dmgLabel(def)}</span><span>Alcance <b>${reachLabel(def)}</b></span><span>Movimento <b>${def.move}</b></span></div>
      ${abilityListHTML(def, stars, plus)}
      ${lockNote}
      <p class="lore">${esc(def.lore)}</p>
    </div></div>`,
    (m) => {
      m.querySelector('.modal')?.classList.add('modal-detail');
      m.querySelector('[data-m=close]')!.addEventListener('click', closeModal);
      m.querySelectorAll<HTMLElement>('[data-pstar]').forEach((btn) =>
        btn.addEventListener('click', () => cardDetail(id, +btn.dataset.pstar!)),
      );
      m.querySelector('[data-m=train]')?.addEventListener('click', () => {
        setTrainSel(id);
        closeModal();
        train();
      });
      m.querySelector('[data-m=deck]')?.addEventListener('click', () => void toggleDeck(id, inDeck));
    });
}

/** v0.17.0: põe/tira a carta (personagem ou feitiço) do baralho, avisando em janela do jogo quando não cabe */
export async function toggleDeck(id: string, inDeck: boolean) {
  if (inDeck) {
    removeFromDeck(save, id);
    const issue = deckIssue(save);
    if (issue) void gameAlert('Baralho incompleto', `Sem ${entryName(id)} o baralho não vale para lutar: ${issue}.`, '🃏');
  } else if (!addToDeck(save, id)) {
    await gameAlert('Baralho cheio', `O baralho já tem ${deckCount(save)}/${deckMax(save)} cartas. Tire cópias (−) ou uma carta para abrir espaço. O limite cresce com o nível de perfil (vença fases).`, '🃏');
    return;
  }
  persist();
  closeModal();
  collection();
}

/** v0.17.0: detalhes do feitiço na Coleção */
export function spellDetail(id: string) {
  const sp = getSpell(id);
  const inDeck = save.deck.includes(id);
  const have = spellCopies(save, id);
  modal(`<div class="detail" style="--rc:#7c5cff;--rg:#b9a8ff">
    <div class="detail-left">${spellCardHTML(id, { extraClass: 'detail-card', locked: !have })}</div>
    <div class="detail-info">
      <div class="detail-badges"><span class="tier-tag" style="--rc:#7c5cff;--rg:#b9a8ff">✦ Feitiço</span> ${tierHTML(sp.rarity)}</div>
      <h2>${sp.icon} ${esc(sp.name)}</h2><div class="subtitle">Conjurador: ${esc(spellCastersLabel(sp))}</div>
      ${spellInfoHTML(id)}
      ${have ? `<p class="hint">Você tem <b>${have}</b> ${have === 1 ? 'cópia' : 'cópias'} (o baralho usa até ${MAX_COPIES}).${inDeck ? ` No baralho: <b>×${copiesIn(save, id)}</b> (ajuste com − / + na barra do baralho).` : ''}</p>` : `<p class="hint">${ico('bloqueado', '🔒')} Ainda não obtido. Feitiço ${TIER_NAMES[sp.rarity]}: sai no <b>${ico('banner', '🎴')} Banner</b> da ${ico('loja', '🏪')} Loja e na 1ª vitória das fases 2, 5 e 8 de cada região.</p>`}
    </div></div>
    <div class="row">${have ? `<button class="btn primary" data-m="deck">${inDeck ? 'Tirar do baralho' : 'Colocar no baralho'}</button>` : ''}<button class="btn ghost" data-m="close">Fechar</button></div>`,
    (m) => {
      m.querySelector('[data-m=close]')!.addEventListener('click', closeModal);
      m.querySelector('[data-m=deck]')?.addEventListener('click', () => void toggleDeck(id, inDeck));
    });
}
