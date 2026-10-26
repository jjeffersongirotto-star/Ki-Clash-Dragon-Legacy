import { waitFor } from './core/battle';
import './ui/style.css';
import { CATEGORY_INFO, PLAYABLE, RACE_INFO, STAR_COLORS, getChar, isComingSoon } from './core/characters';
import { STAGES } from './core/campaign';
import { TIER_NAMES, XP_ITEMS, ascend, ascendCost, ascendCostFor, canAscend, cardMaxLevel, cardXpToNext, feedXp, maxLevel, newOwned, nextTier, statsFor, stepXp, tierLabel, xpProgress, type XpItemId } from './core/progression';
import { playerLeaderImg, portraitImg, portraitSVG, unitSpriteSVG, warmLeader, warmPortraits } from './ui/art';
import { cardPower, deckPower } from './core/power';
import { canEvolve, evolveLeader, getLeader, leaderHp, leaderMaxLevel, nextRequirement } from './core/leaders';
import { BattleView } from './ui/battleView';
import { abilityListHTML, cardHTML, categoryHTML, dmgLabel, esc, raceHTML, reachLabel, spellCardHTML, spellCastersLabel, spellInfoHTML, starStyle, tierHTML } from './ui/components';
import { SPELLS, getSpell, isSpell } from './core/spells';
import { gameAlert, gameConfirm, showDialog } from './ui/dialog';
import { installPerfGuards } from './ui/perf';
import { enterBattleMode, leaveBattleMode } from './ui/orientation';
import { bakeGridArt } from './ui/gridArt';
import { DECK_MIN, MAX_COPIES, addToDeck, rawSaveHas, copiesIn, deckCards, deckCount, deckIssue, deckMax, hasSave, loadSave, migrateV17, profileLevel, removeFromDeck, resetSave, setCopies, setSaveKey, teamReady, writeSave, type SaveData } from './ui/save';
import { adminSave, createAccount, loadAccounts, login, logout, saveKeyFor, NAME_MAX, PASS_MIN } from './ui/accounts';

const app = document.getElementById('app')!;
// v0.16.0: contas locais — cada conta tem o seu progresso neste aparelho
const accounts = loadAccounts();
function openAccountSave(): SaveData {
  const id = accounts.current;
  setSaveKey(saveKeyFor(id));
  if (id && accounts.accounts[id]?.admin && !hasSave()) writeSave(adminSave());
  // v0.17.0: a ADM que já existia ganha uma vez o baralho de 40 com feitiços
  if (id && accounts.accounts[id]?.admin && !rawSaveHas('"v17":true')) {
    const d = loadSave();
    const a = adminSave();
    d.deck = a.deck;
    d.copies = a.copies;
    writeSave(d);
    return d;
  }
  return loadSave();
}
let save: SaveData = openAccountSave();
const firstChar = () => save.deck.find((id) => !isSpell(id) && save.cards[id]) ?? Object.keys(save.cards)[0];
let trainSel: string = firstChar();
let raceFilter: string = 'all';

const persist = () => writeSave(save);
const unlockStage = (charId: string) => STAGES.find((s) => s.unlock === charId)?.id;

// ---------------- v0.13: PODER e COMANDANTE ----------------
/** v0.17: o Poder do baralho soma cada personagem uma vez (cópias e feitiços não contam) */
const teamCards = () => save.deck.filter((id) => !isSpell(id) && save.cards[id]).map((id) => save.cards[id]);
const entryName = (id: string) => (isSpell(id) ? `${getSpell(id).icon} ${getSpell(id).name}` : getChar(id).name);
/** Poder do baralho = soma do Poder das cartas da equipe */
const teamPower = () => deckPower(teamCards());
const activeLeader = () => getLeader(save.activeLeader);
const leaderLevel = () => Math.max(1, save.leaders?.[activeLeader().id]?.level ?? 1);
const fmt = (n: number) => n.toLocaleString('pt-BR');

function leaderPanelHTML(): string {
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
      <button class="btn small ${ready ? 'primary' : ''}" id="lpEvolve" ${req == null ? 'disabled' : ''}>⬆ Evoluir</button>
    </div>
  </section>`;
}

async function evolveDialog() {
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

function topbar(title: string, back = true) {
  return `<header class="topbar">
    ${back ? '<button class="btn small ghost" data-nav="home">← Base</button>' : '<span></span>'}
    <h2>${title}</h2>
    <div class="res"><span title="Essências Estelares">✴ ${save.essencias}</span>${XP_ITEMS.map((i) => `<span title="${i.name}">${i.icon} ${save.items[i.id]}</span>`).join('')}</div>
  </header>`;
}

function bindNav() {
  app.querySelectorAll<HTMLElement>('[data-nav]').forEach((el) => el.addEventListener('click', () => go(el.dataset.nav!)));
}

function go(screen: string) {
  window.scrollTo(0, 0);
  if (screen === 'home') home();
  else if (screen === 'adventure') adventure();
  else if (screen === 'collection') collection();
  else if (screen === 'train') train();
  else if (screen === 'help') help();
}

// ---------------- BASE ----------------
function home() {
  leaveBattleMode();
  const next = STAGES.find((s) => !save.cleared.includes(s.id));
  const acc = accounts.current ? accounts.accounts[accounts.current] : null;
  app.innerHTML = `<div class="screen home">
    <div class="account-box">${acc
      ? `<span class="acc-name" title="Conta local deste aparelho">👤 <b>${esc(acc.name)}</b>${acc.admin ? ' <small>teste</small>' : ''}</span><button class="btn small ghost" id="accOut">Sair</button>`
      : `<button class="btn small" id="accIn">👤 Entrar / Criar conta</button>`}</div>
    <div class="logo">
      <div class="logo-ki">KI-CLASH</div>
      <div class="logo-sub">DRAGON LEGACY</div>
    </div>
    <div class="home-heroes">${['kenji', 'vorax', 'nyx'].map((id) => `<div class="home-hero" style="${starStyle(getChar(id).maxStars)}">${portraitImg(getChar(id), { stars: getChar(id).maxStars })}</div>`).join('')}</div>
    <div class="res big"><span>✴ ${save.essencias} Essências</span>${XP_ITEMS.map((i) => `<span>${i.icon} ${save.items[i.id]}</span>`).join('')}</div>
    <nav class="menu">
      <button class="btn primary" data-nav="adventure">⚔ Aventura <small>${next ? `Fase ${next.id}: ${esc(next.name)}` : 'Tudo concluído!'}</small></button>
      <button class="btn" data-nav="collection">🃏 Coleção & Baralho <small>${Object.keys(save.cards).length}/${PLAYABLE.length} personagens</small></button>
      <button class="btn" data-nav="train">🔥 Treinar & Despertar <small>Suba nível e evolua de cor</small></button>
      <button class="btn ghost" data-nav="help">❓ Como jogar</button>
    </nav>
    <button class="link-btn" id="reset">Apagar progresso</button>
  </div>`;
  bindNav();
  app.querySelector('#accIn')?.addEventListener('click', accountDialog);
  app.querySelector('#accOut')?.addEventListener('click', () => {
    persist();
    logout(accounts);
    save = openAccountSave();
    trainSel = firstChar();
    home();
  });
  app.querySelector('#reset')!.addEventListener('click', async () => {
    if (await gameConfirm('Apagar progresso?', 'Todo o progresso salvo (personagens, níveis, itens e fases) será apagado. Isso não pode ser desfeito.', 'Apagar tudo', true)) {
      resetSave();
      save = openAccountSave();
      home();
    }
  });
}

/** v0.16.0: janela do jogo para entrar ou criar uma conta local (nome + senha). */
async function accountDialog() {
  await showDialog({
    title: 'Conta',
    icon: '👤',
    html: `<form class="acc-form" autocomplete="off" onsubmit="return false">
        <label>Nome<input id="accUser" maxlength="${NAME_MAX}" autocapitalize="off" spellcheck="false"></label>
        <label>Senha<input id="accPass" type="password" minlength="${PASS_MIN}"></label>
        <p class="acc-err" id="accErr" role="alert"></p>
        <div class="dialog-btns"><button type="button" class="btn primary" id="accLogin">Entrar</button><button type="button" class="btn" id="accCreate">Criar conta</button></div>
      </form>
      <p class="acc-warn">⚠ Conta <b>só deste aparelho</b>, sem servidor: <b>não é segurança de verdade</b>. Cada conta guarda o próprio progresso aqui. Não use uma senha que você usa em outro lugar.</p>`,
    buttons: [{ label: 'Fechar', value: 'cancel', kind: 'ghost' }],
    onMount: (root, close) => {
      const user = root.querySelector('#accUser') as HTMLInputElement;
      const pass = root.querySelector('#accPass') as HTMLInputElement;
      const err = root.querySelector('#accErr') as HTMLElement;
      const done = (r: ReturnType<typeof login>) => {
        if (!r.ok) {
          err.textContent = r.error;
          return;
        }
        persist();
        save = openAccountSave();
        trainSel = firstChar();
        close('ok');
        home();
      };
      root.querySelector('#accLogin')!.addEventListener('click', () => done(login(accounts, user.value, pass.value)));
      root.querySelector('#accCreate')!.addEventListener('click', () => done(createAccount(accounts, user.value, pass.value)));
      pass.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') done(login(accounts, user.value, pass.value));
      });
      setTimeout(() => user.focus(), 30);
    },
  });
}

// ---------------- AVENTURA ----------------
function adventure() {
  leaveBattleMode();
  app.innerHTML = `<div class="screen">${topbar('Aventura')}
    <p class="hint">Seu Comandante: <b>${esc(activeLeader().name)} Nv.${leaderLevel()}</b> ❤${leaderHp(activeLeader(), leaderLevel())} · Poder do baralho <b>⚡ ${fmt(teamPower())}</b></p>
    <p class="hint">Nível de perfil <b>${profileLevel(save)}</b> · Seu baralho (<b>${deckCount(save)}/${deckMax(save)}</b>): ${save.deck.map((id) => `${esc(entryName(id))} ×${copiesIn(save, id)}`).join(', ')}</p>
    ${teamReady(save) ? '' : `<p class="warn-bar">⚠ Baralho inválido: ${esc(deckIssue(save) ?? '')}. <button class="btn small" data-nav="collection">Arrumar baralho</button></p>`}
    <div class="stages">${STAGES.map((s, i) => {
      const unlocked = i === 0 || save.cleared.includes(STAGES[i - 1].id);
      const done = save.cleared.includes(s.id);
      return `<div class="stage ${unlocked ? '' : 'locked'} ${done ? 'done' : ''}">
        <div class="stage-num">${s.id}</div>
        <div class="stage-info"><b>${esc(s.name)}</b>
          <small>Comandante inimigo ❤${s.enemyHeroHp} · Nível inimigo ~${s.enemyDeck[0].level}</small>
          <small>Recompensa: ✴${s.rewards.essencias} 📜${s.rewards.pergaminho}${s.rewards.cristal ? ` 💎${s.rewards.cristal}` : ''}${s.rewards.orbe ? ` 🔮${s.rewards.orbe}` : ''}${s.unlock && !save.cards[s.unlock] ? ` · desbloqueia <b>${esc(getChar(s.unlock).name)}</b>` : ''}</small>
        </div>
        <div class="stage-enemies">${s.enemyDeck.filter((c, k, a) => a.findIndex((x) => x.charId === c.charId) === k).slice(0, 5).map((c) => `<span class="mini" style="${starStyle(c.stars)}">${portraitImg(getChar(c.charId), { stars: c.stars })}</span>`).join('')}</div>
        <button class="btn small ${unlocked ? 'primary' : ''}" data-stage="${s.id}" ${unlocked ? '' : 'disabled'}>${done ? 'Repetir' : unlocked ? 'Lutar' : '🔒'}</button>
      </div>`;
    }).join('')}</div></div>`;
  bindNav();
  app.querySelectorAll<HTMLElement>('[data-stage]').forEach((el) => el.addEventListener('click', () => startBattle(+el.dataset.stage!)));
}

/** Regra v0.17: o baralho precisa ter de 20 ao máximo do nível de perfil (janela do jogo, nunca alerta do navegador). */
async function teamWarning(): Promise<void> {
  const v = await showDialog({
    title: 'Baralho inválido',
    icon: '🃏',
    html: `<p class="dialog-msg">Para lutar, o baralho precisa ter de <b>${DECK_MIN}</b> a <b>${deckMax(save)}</b> cartas (até ${MAX_COPIES} cópias de cada carta) e pelo menos 1 personagem.</p>
      <p class="dialog-msg">Agora: <b>${deckCount(save)}</b> cartas — ${esc(deckIssue(save) ?? '')}.</p>`,
    buttons: [
      { label: 'Agora não', value: 'cancel', kind: 'ghost' },
      { label: 'Ir para o baralho', value: 'team', kind: 'primary' },
    ],
  });
  if (v === 'team') collection();
}

function startBattle(stageId: number) {
  if (!teamReady(save)) {
    void teamWarning();
    return;
  }
  const stage = STAGES.find((s) => s.id === stageId)!;
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
    onFinish: (winner) => finishBattle(stageId, winner),
    playerHeroHp: leaderHp(activeLeader(), leaderLevel()),
  });
}

function finishBattle(stageId: number, winner: string) {
  const stage = STAGES.find((s) => s.id === stageId)!;
  const first = !save.cleared.includes(stageId);
  let html = '';
  if (winner === 'player') {
    const mult = first ? 1 : 0.5;
    const r = stage.rewards;
    const got = { pergaminho: Math.ceil(r.pergaminho * mult), cristal: Math.floor(r.cristal * mult), orbe: first ? r.orbe : 0, essencias: Math.ceil(r.essencias * mult) };
    save.items.pergaminho += got.pergaminho;
    save.items.cristal += got.cristal;
    save.items.orbe += got.orbe;
    save.essencias += got.essencias;
    const maxBefore = deckMax(save);
    if (first) save.cleared.push(stageId);
    const grew = deckMax(save) > maxBefore;
    let unlocked = '';
    if (stage.unlock && !save.cards[stage.unlock]) {
      save.cards[stage.unlock] = newOwned(stage.unlock);
      const def = getChar(stage.unlock);
      const joined = addToDeck(save, def.id) > 0;
      unlocked = `<div class="unlock" style="${starStyle(def.minStars)}">${cardHTML(save.cards[def.id], { compact: true })}<div><b>Novo personagem!</b><br>${esc(def.name)} — ${raceHTML(def)} ${categoryHTML(def, true)} · ${tierHTML(def.minStars)}${joined ? '<br><small>Entrou direto na sua equipe.</small>' : ''}</div></div>`;
    }
    html = `<h2 class="win">🏆 Vitória!</h2><p>${first ? 'Primeira vitória nesta fase!' : 'Recompensa de repetição (50%).'}</p>
      <div class="res big"><span>✴ +${got.essencias}</span><span>📜 +${got.pergaminho}</span>${got.cristal ? `<span>💎 +${got.cristal}</span>` : ''}${got.orbe ? `<span>🔮 +${got.orbe}</span>` : ''}</div>${grew ? `<p class="hint">⬆ Nível de perfil <b>${profileLevel(save)}</b>: o baralho agora aceita até <b>${deckMax(save)}</b> cartas.</p>` : ''}${unlocked}`;
  } else {
    save.items.pergaminho += 1;
    html = `<h2 class="lose">${winner === 'empate' ? '⏱ Empate' : '💀 Derrota'}</h2><p>Treine seus personagens com itens de XP e tente de novo! (+1 📜)</p>`;
  }
  persist();
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

// ---------------- COLEÇÃO ----------------
function collection() {
  leaveBattleMode();
  void bakeAllGrid();
  const byPower = (a: string, b: string) => {
    const A = save.cards[a], B = save.cards[b];
    return cardPower(B) - cardPower(A) || B.stars - A.stars || B.level - A.level || getChar(a).cost - getChar(b).cost;
  };
  const matchRace = (id: string) => raceFilter === 'all' || getChar(id).race === raceFilter;
  const owned = PLAYABLE.filter((d) => save.cards[d.id] && matchRace(d.id)).map((d) => d.id).sort(byPower);
  const lockOrder = (id: string) => (isComingSoon(getChar(id)) ? 999 : unlockStage(id) ?? 99);
  const locked = PLAYABLE.filter((d) => !save.cards[d.id] && matchRace(d.id)).sort((a, b) => lockOrder(a.id) - lockOrder(b.id));
  const lockBadge = (id: string) => (isComingSoon(getChar(id)) ? '🔒 Em breve' : `🔒 Fase ${unlockStage(id) ?? '?'}`);
  const count = deckCount(save);
  const max = deckMax(save);
  const issue = deckIssue(save);
  const entryHTML = (id: string) => {
    const n = copiesIn(save, id);
    const card = isSpell(id)
      ? spellCardHTML(id, { compact: true, attrs: `data-card="${id}"` })
      : cardHTML(save.cards[id], { compact: true, grid: true, attrs: `data-card="${id}"`, power: cardPower(save.cards[id]) });
    return `<div class="deck-entry">${card}<div class="copies" data-copies="${id}"><button class="cp-btn" data-cp="-1" aria-label="Menos uma cópia" ${n <= 1 ? 'disabled' : ''}>−</button><b>×${n}</b><button class="cp-btn" data-cp="1" aria-label="Mais uma cópia" ${n >= MAX_COPIES || count >= max ? 'disabled' : ''}>+</button></div></div>`;
  };
  app.innerHTML = `<div class="screen">${topbar('Coleção & Baralho')}
    ${leaderPanelHTML()}
    <section class="deck-bar">
      <div class="deck-title"><span class="deck-power" title="Poder do baralho = soma do Poder de cada personagem do baralho (uma vez cada; feitiços não contam)">⚡ ${fmt(teamPower())}</span> Baralho <b>${count}/${max}</b> <small>(nível de perfil ${profileLevel(save)} · mínimo ${DECK_MIN} · até ${MAX_COPIES} cópias por carta${issue ? ` · <span class="warn">${esc(issue)}</span>` : ''})</small></div>
      <div class="deck-slots deck-copies">${save.deck.map(entryHTML).join('')}${count < max ? '<div class="slot">+</div>' : ''}</div>
    </section>
    <div class="race-filters">
      <button class="rf-btn ${raceFilter === 'all' ? 'active' : ''}" data-rf="all">🌟 Todos (${PLAYABLE.length})</button>
      ${Object.entries(RACE_INFO).map(([k, r]) => `<button class="rf-btn ${raceFilter === k ? 'active' : ''}" data-rf="${k}" style="--race-c:${r.color}">${r.icon} ${r.label}</button>`).join('')}
    </div>
    <p class="hint">Toque numa carta para inspecionar a evolução visual de cor em cor (Comum → Mítico), ver o sprite de arena e editar a equipe.</p>
    <h3 class="sec-title">Seus personagens <small>(${owned.length})</small></h3>
    <div class="card-grid">${owned.map((id) => cardHTML(save.cards[id], { grid: true, power: cardPower(save.cards[id]), attrs: `data-card="${id}"`, badge: save.deck.includes(id) ? `✔ ×${copiesIn(save, id)}` : undefined, extraClass: save.deck.includes(id) ? 'in-deck' : '' })).join('')}</div>
    <h3 class="sec-title">✦ Feitiços <small>(${SPELLS.length} · ocupam vagas do baralho; precisam de um aliado da categoria em campo)</small></h3>
    <div class="card-grid spell-grid">${SPELLS.map((sp) => spellCardHTML(sp.id, { attrs: `data-card="${sp.id}"`, badge: save.deck.includes(sp.id) ? `✔ ×${copiesIn(save, sp.id)}` : undefined, extraClass: save.deck.includes(sp.id) ? 'in-deck' : '' })).join('')}</div>
    ${locked.length ? `<div class="divider"><span>🔒 Ainda não obtidos (${locked.length})</span></div>
    <div class="card-grid locked-grid">${locked.map((def) => cardHTML({ charId: def.id, level: 1, stars: def.minStars }, { locked: true, grid: true, extraClass: isComingSoon(def) ? 'soon' : '', attrs: `data-card="${def.id}"`, badge: lockBadge(def.id) })).join('')}</div>
    ${locked.some(isComingSoon) ? `<p class="hint soon-note">🔒 <b>Em breve:</b> ${locked.filter(isComingSoon).map((d) => esc(d.name)).join(' e ')} ${locked.filter(isComingSoon).length > 1 ? 'começam' : 'começa'} em Lendário e ainda não ${locked.filter(isComingSoon).length > 1 ? 'podem' : 'pode'} ser obtidos. A forma de conseguir será revelada numa atualização futura.</p>` : ''}` : ''}
  </div>`;
  bindNav();
  app.querySelectorAll<HTMLElement>('[data-rf]').forEach((el) =>
    el.addEventListener('click', () => {
      raceFilter = el.dataset.rf!;
      collection();
    }),
  );
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
}

function cardDetail(id: string, previewStars?: number) {
  const def = getChar(id);
  const owned = save.cards[id];
  const lvl = owned?.level ?? 1;
  const curStars = owned?.stars ?? def.minStars;
  const curPlus = !!owned?.plus;
  const stars = previewStars ?? curStars;
  // a prévia de outra cor mostra a cor base; a cor atual mostra o "+" se você já tiver
  const plus = stars === curStars && curPlus;
  const st = statsFor(def, lvl, stars, plus);
  const pow = cardPower({ charId: id, level: lvl, stars, plus });
  const inDeck = save.deck.includes(id);
  const starTabs: string[] = [];
  for (let s = def.minStars; s <= def.maxStars; s++) {
    starTabs.push(`<button class="star-tab ${s === stars ? 'active' : ''}" data-pstar="${s}" style="${starStyle(s)}">${tierLabel(s, s === curStars && curPlus)}${s === curStars && owned ? ' <small>(atual)</small>' : ''}</button>`);
  }
  modal(`<div class="detail" style="${starStyle(stars)}">
    <div class="detail-left">
      ${cardHTML({ charId: id, level: lvl, stars, plus }, { extraClass: 'detail-card', locked: !owned && previewStars == null, power: pow })}
      <div class="detail-sprite-box">
        <div class="ds-sprite">${unitSpriteSVG(def, { stars, side: 'player' })}</div>
        <div class="ds-label">Visual na Arena (${tierLabel(stars, plus)})<br><small>ATQ ${st.atk} | VIDA ${st.hp}</small></div>
      </div>
    </div>
    <div class="detail-info">
      <div class="detail-badges">${tierHTML(stars, plus)} ${raceHTML(def, true)} ${categoryHTML(def, true)}</div>
      <h2>${esc(def.name)}</h2><div class="subtitle">${esc(def.title)}</div>
      <div><small>Faixa: ${tierLabel(def.minStars)} a ${tierLabel(def.maxStars, true)}</small> · Nv.${lvl}/${maxLevel(stars, plus)}</div>
      <div class="star-preview-bar">
        <span class="sp-label">👁 Ver evolução por cor (roupa/poder):</span>
        <div class="sp-tabs">${starTabs.join('')}</div>
      </div>
      <div class="stat-row"><span class="pow-stat" title="Poder = 10 × peso da habilidade × √(ataque × vida)">Poder <b>⚡ ${fmt(pow)}</b></span><span title="Rodadas que a carta espera na mão até poder ser invocada">Espera <b>⏳ ${waitFor(def.id)}</b></span><span>Ataque <b>${st.atk}</b></span><span>Vida <b>${st.hp}</b></span><span>${dmgLabel(def)}</span><span>Alcance <b>${reachLabel(def)}</b></span><span>Movimento <b>${def.move}</b></span></div>
      ${abilityListHTML(def, stars, lvl)}
      <p class="lore">${esc(def.lore)}</p>
    </div></div>
    <div class="row">${owned ? `<button class="btn primary" data-m="deck">${inDeck ? 'Tirar do baralho' : 'Colocar no baralho'}</button><button class="btn" data-m="train">Treinar</button>` : isComingSoon(def) ? `<p class="hint">🔒 <b>Em breve.</b> Personagem ${tierLabel(def.minStars)}: ainda não pode ser obtido. A forma de conseguir será revelada numa atualização futura.</p>` : `<p class="hint">🔒 Vença a fase ${unlockStage(id) ?? '?'} pela primeira vez para desbloquear.</p>`}<button class="btn ghost" data-m="close">Fechar</button></div>`,
    (m) => {
      m.querySelector('[data-m=close]')!.addEventListener('click', closeModal);
      m.querySelectorAll<HTMLElement>('[data-pstar]').forEach((btn) =>
        btn.addEventListener('click', () => cardDetail(id, +btn.dataset.pstar!)),
      );
      m.querySelector('[data-m=train]')?.addEventListener('click', () => {
        trainSel = id;
        closeModal();
        train();
      });
      m.querySelector('[data-m=deck]')?.addEventListener('click', () => void toggleDeck(id, inDeck));
    });
}

/** v0.17.0: põe/tira a carta (personagem ou feitiço) do baralho, avisando em janela do jogo quando não cabe */
async function toggleDeck(id: string, inDeck: boolean) {
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
function spellDetail(id: string) {
  const sp = getSpell(id);
  const inDeck = save.deck.includes(id);
  modal(`<div class="detail" style="--rc:#7c5cff;--rg:#b9a8ff">
    <div class="detail-left">${spellCardHTML(id, { extraClass: 'detail-card' })}</div>
    <div class="detail-info">
      <div class="detail-badges"><span class="tier-tag" style="--rc:#7c5cff;--rg:#b9a8ff">✦ Feitiço</span></div>
      <h2>${sp.icon} ${esc(sp.name)}</h2><div class="subtitle">Conjurador: ${esc(spellCastersLabel(sp))}</div>
      ${spellInfoHTML(id)}
      ${inDeck ? `<p class="hint">No baralho: <b>×${copiesIn(save, id)}</b> (ajuste as cópias com − / + na barra do baralho).</p>` : ''}
    </div></div>
    <div class="row"><button class="btn primary" data-m="deck">${inDeck ? 'Tirar do baralho' : 'Colocar no baralho'}</button><button class="btn ghost" data-m="close">Fechar</button></div>`,
    (m) => {
      m.querySelector('[data-m=close]')!.addEventListener('click', closeModal);
      m.querySelector('[data-m=deck]')!.addEventListener('click', () => void toggleDeck(id, inDeck));
    });
}

// ---------------- TREINO ----------------
/** Escada de Despertar do personagem: cada degrau com nível máximo, XP do degrau e Essências para subir. */
function ladderHTML(card: { charId: string; stars: number; plus?: boolean; level: number }): string {
  const def = getChar(card.charId);
  const rows: string[] = [];
  const cur = { s: card.stars, p: !!card.plus };
  for (let s = def.minStars; s <= def.maxStars; s++) {
    for (const p of [false, true]) {
      const isCur = s === cur.s && p === cur.p;
      const done = s < cur.s || (s === cur.s && !p && cur.p);
      const last = s === def.maxStars && p;
      const up = last ? '—' : `✴ ${ascendCostFor(s, p)} → ${p ? `<b>${tierLabel(s + 1)}</b> <small>(nova cor: habilidades e visual)</small>` : `<b>${tierLabel(s, true)}</b> <small>(+${def.plusStat === 'atk' ? 'ataque' : 'vida'})</small>`}`;
      rows.push(`<tr class="${isCur ? 'cur' : done ? 'done' : ''}" style="${starStyle(s)}"><td><span class="tier-dot"></span>${tierLabel(s, p)}${isCur ? ' <small>(atual)</small>' : ''}</td><td>${maxLevel(s, p)}</td><td>${stepXp(s, p).toLocaleString('pt-BR')}${p ? ' <small>(+50%)</small>' : ''}</td><td>${up}</td></tr>`);
    }
  }
  return `<details class="ladder" open><summary>🪜 Escada de Despertar</summary><table><thead><tr><th>Degrau</th><th>Nível máx.</th><th>XP do degrau</th><th>Despertar</th></tr></thead><tbody>${rows.join('')}</tbody></table>
    <p class="hint">O <b>"+"</b> dá só um pequeno bônus de ${def.plusStat === 'atk' ? '<b>ataque</b>' : '<b>vida</b>'} (+10%, mín. +1). Habilidades e visual mudam só na <b>nova cor</b>. Do "+" para a próxima cor custa <b>50% a mais</b> de XP e de Essências.</p></details>`;
}

function train() {
  leaveBattleMode();
  void bakeAllGrid();
  if (!save.cards[trainSel]) trainSel = Object.keys(save.cards)[0];
  const card = save.cards[trainSel];
  const def = getChar(card.charId);
  const plus = !!card.plus;
  const cap = cardMaxLevel(card);
  const st = statsFor(def, card.level, card.stars, plus);
  const nextSt = statsFor(def, Math.min(card.level + 1, cap), card.stars, plus);
  const atCap = card.level >= cap;
  const pct = Math.round(xpProgress(card) * 100);
  const nt = nextTier(card);
  const ntLabel = nt ? tierLabel(nt.stars, nt.plus) : '';
  const ascendBtn = nt
    ? `<button class="btn primary" id="ascend" ${atCap && canAscend(card) && save.essencias >= ascendCost(card) ? '' : 'disabled'}>✨ Despertar para ${ntLabel} (✴ ${ascendCost(card)})</button>
       <p class="hint">${atCap ? '' : `Chegue ao <b>nível ${cap}</b> para despertar. `}${nt.plus ? `${ntLabel} dá +10% de ${def.plusStat === 'atk' ? 'ataque' : 'vida'} e +5 níveis máximos (sem mudar habilidades nem visual).` : `${ntLabel} é uma <b>nova cor</b>: evolui roupa, armadura, aura, habilidades e status.`}${save.essencias < ascendCost(card) ? ` <span class="warn">Você tem ✴ ${save.essencias}.</span>` : ''}</p>`
    : '<p class="hint">Cor máxima com "+": este personagem chegou ao topo!</p>';
  app.innerHTML = `<div class="screen">${topbar('Treinar')}
    <div class="train-list">${Object.values(save.cards)
      .map((c) => cardHTML(c, { compact: true, grid: true, extraClass: `train-pick ${c.charId === trainSel ? 'sel' : ''}`, attrs: `data-sel="${c.charId}"` }))
      .join('')}</div>
    <div class="train-main" style="${starStyle(card.stars)}">
      <div class="train-visuals">
        <div class="train-art">${cardHTML(card)}</div>
        <div class="detail-sprite-box">
          <div class="ds-sprite">${unitSpriteSVG(def, { stars: card.stars, side: 'player' })}</div>
          <div class="ds-label">Lutador na Arena (${tierLabel(card.stars, plus)})</div>
        </div>
      </div>
      <div class="train-info">
        <div class="detail-badges">${tierHTML(card.stars, plus)} ${raceHTML(def, true)} ${categoryHTML(def, true)}</div>
        <h2>${esc(def.name)}</h2>
        <div><b>${tierLabel(card.stars, plus)}</b> · <b>Nível ${card.level}</b> / ${cap} · <span class="ess">✴ ${save.essencias} Essências</span></div>
        <div class="xpbar"><i style="width:${pct}%"></i><span>${atCap ? 'NÍVEL MÁXIMO DO DEGRAU' : `${card.xp} / ${cardXpToNext(card)} XP (${pct}%)`}</span></div>
        <div class="stat-row"><span>Ataque <b>${st.atk}</b>${!atCap && nextSt.atk > st.atk ? ` <em>→ ${nextSt.atk}</em>` : ''}</span><span>Vida <b>${st.hp}</b>${!atCap && nextSt.hp > st.hp ? ` <em>→ ${nextSt.hp}</em>` : ''}</span></div>
        ${abilityListHTML(def, card.stars, card.level)}
        <div class="items">${XP_ITEMS.map((it) => `<button class="item-btn" data-item="${it.id}" ${save.items[it.id] > 0 && !atCap ? '' : 'disabled'}><span class="ic">${it.icon}</span><b>${it.name}</b><small>+${it.xp} XP · você tem ${save.items[it.id]}</small></button>`).join('')}</div>
        ${ascendBtn}
        ${atCap ? '' : `<p class="hint">Alimente itens de XP: ao chegar a 100% da barra, o nível sobe — e a próxima barra fica maior.</p>`}
        ${ladderHTML(card)}
      </div>
    </div></div>`;
  bindNav();
  app.querySelectorAll<HTMLElement>('[data-sel]').forEach((el) =>
    el.addEventListener('click', () => {
      trainSel = el.dataset.sel!;
      train();
    }),
  );
  app.querySelectorAll<HTMLElement>('[data-item]').forEach((el) =>
    el.addEventListener('click', () => {
      const it = XP_ITEMS.find((x) => x.id === el.dataset.item)!;
      if (save.items[it.id as XpItemId] <= 0) return;
      save.items[it.id as XpItemId]--;
      const r = feedXp(card, it.xp);
      persist();
      train();
      if (r.levelsGained > 0) {
        const fx = document.createElement('div');
        fx.className = 'levelup';
        fx.textContent = `NÍVEL ${card.level}!`;
        document.body.appendChild(fx);
        setTimeout(() => fx.remove(), 1400);
      }
    }),
  );
  app.querySelector('#ascend')?.addEventListener('click', () => {
    const from = { stars: card.stars, plus: !!card.plus };
    const before = statsFor(def, card.level, card.stars, !!card.plus);
    const r = ascend(card, save.essencias);
    if (r.ok) {
      save.essencias -= r.cost;
      persist();
      train();
      evolutionReveal(card.charId, from, { stars: card.stars, plus: !!card.plus }, before);
    }
  });
}

/**
 * Animação do Despertar. Nova cor: visual antigo → clarão → novo visual.
 * Degrau "+": o visual é o mesmo; mostra só o selo "+" e o bônus de status.
 */
function evolutionReveal(charId: string, from: { stars: number; plus: boolean }, to: { stars: number; plus: boolean }, before: { atk: number; hp: number }) {
  const def = getChar(charId);
  const lvl = save.cards[charId].level;
  const st = statsFor(def, lvl, to.stars, to.plus);
  const newColour = to.stars !== from.stars;
  const gain = st.atk > before.atk ? `Ataque <b>${before.atk} → ${st.atk}</b>` : st.hp > before.hp ? `Vida <b>${before.hp} → ${st.hp}</b>` : '';
  const bg = document.createElement('div');
  bg.className = 'evo-bg';
  bg.innerHTML = `<div class="evo ${newColour ? '' : 'evo-plus'}">
    <div class="evo-title">${newColour ? 'DESPERTAR!' : 'DESPERTAR +'}</div>
    <div class="evo-stage" style="${starStyle(to.stars)}">
      ${newColour ? `<div class="evo-old" style="${starStyle(from.stars)}">${portraitSVG(def, { stars: from.stars })}</div><div class="evo-flash"></div>` : ''}
      <div class="evo-new ${newColour ? '' : 'static'}">${portraitSVG(def, { stars: to.stars })}</div>
      <div class="evo-rays"></div>
    </div>
    <div class="evo-name">${esc(def.name)}</div>
    <div class="evo-stars">${tierHTML(from.stars, from.plus)} <span>➜</span> ${tierHTML(to.stars, to.plus)}</div>
    <div class="evo-stats">${newColour ? `Ataque <b>${st.atk}</b> · Vida <b>${st.hp}</b> · nova cor: habilidades e visual evoluem` : `${gain} · habilidades e visual iguais`} · Nível máx. <b>${maxLevel(to.stars, to.plus)}</b></div>
    <button class="btn primary">Continuar</button>
  </div>`;
  document.body.appendChild(bg);
  bg.querySelector('button')!.addEventListener('click', () => bg.remove());
  bg.addEventListener('keydown', (e) => e.key === 'Escape' && bg.remove());
}

// ---------------- AJUDA ----------------
function help() {
  leaveBattleMode();
  app.innerHTML = `<div class="screen">${topbar('Como jogar')}
  <div class="help">
    <h3>Objetivo</h3><p>A arena tem <b>2 fileiras × 12 colunas</b>. Cada Comandante fica posicionado nas extremidades da arena. Zere a vida do <b>Comandante inimigo</b> (à direita) antes que ele zere a sua.</p>
    <h3>Raças e Origens Anime</h3><ul>${Object.values(RACE_INFO).map((r) => `<li><b>${r.icon} ${r.label}</b> — ${r.desc}</li>`).join('')}</ul>
    <h3>Seu turno</h3><ol>
      <li>Não há energia: cada carta da mão tem uma <b>contagem de rodadas ⏳</b> (o número na gota). Ela começa em <b>2 × custo − 1</b> (3, 5, 7, 9 ou 11), cai 1 no início de cada turno seu e a carta só pode ser invocada quando chega a <b>0</b> — dá para invocar <b>todas</b> as prontas no mesmo turno. A mão inicial começa 2 rodadas adiantada. Depois, você compra <b>as cartas que faltarem para a mão voltar a ter 6</b>.</li>
      <li>Toque numa carta e numa casa brilhante das <b>3 colunas da esquerda</b> para invocá-la como um lutador de corpo inteiro na arena.</li>
      <li>Toque em <b>LUTAR</b> (ou ligue o modo <b>Auto</b>): seus personagens caminham (<b>MOVE</b>), saltam, disparam feixes de Ki ou golpes corpo a corpo (<b>HIT</b>), sofrem dano e vão para a <b>Necropolis</b> quando derrotados.</li></ol>
    <h3>Cartas e baralho</h3><ul>
      <li>Cada carta (personagem ou <b>feitiço ✦</b>) entra no baralho com <b>1 a 3 cópias</b> (botões − / + em Coleção & Baralho). O baralho precisa ter de <b>20</b> até <b>28 + 2 × nível de perfil</b> cartas (30 no nível 1, 40 no nível 6+) e pelo menos 1 personagem. Nível de perfil = 1 + fases vencidas.</li>
      <li><b>Feitiços ✦:</b> esperam <b>custo − 1</b> rodadas e precisam de um <b>aliado da categoria em campo</b> (o de maior ataque conjura; a força vem do ataque dele). Toque no feitiço e numa casa <b>roxa</b>. Depois de lançado, volta para o Baralho.</li>
      <li>A <b>mão tem 6 cartas</b>. Você começa com 6 diferentes e, a cada rodada, <b>compra o que faltar para voltar a 6</b> (jogou 3, compra 3; com a mão cheia, não compra). Cartas não usadas ficam na mão.</li>
      <li>À esquerda da mão fica o <b>Baralho</b> (quantas cartas ainda podem vir); à direita, a <b>Necropolis (Derrotadas)</b>.</li>
      <li>A carta jogada vira unidade em campo. Quando a unidade <b>morre</b>, aquela cópia vai para a <b>Necropolis</b> e só volta com Necromancia (Vorax) ou o feitiço Chamado da Necropolis.</li>
      <li><b>Compra semi-aleatória:</b> depois de comprada, a carta fica <b>bloqueada nas 6 compras seguintes</b>; na <b>7ª, 8ª e 9ª</b> pode vir no sorteio e na <b>10ª vem garantida</b>. Conta a partir da compra, não de quando você joga.</li>
      <li><b>Começo da luta:</b> as 6 cartas da mão inicial voltam ao sorteio já na <b>5ª compra</b> (só restam 4 outras) e ficam garantidas na 8ª.</li>
      <li>Todas as cartas compradas na mesma rodada contam como <b>uma compra só</b>. Se várias cartas ficarem garantidas ao mesmo tempo, saem <b>em fila</b>; uma compra de 3 cartas atende até 3 garantias.</li></ul>
    <h3>Como as unidades agem na Arena</h3><ul>
      <li>Se houver alvo no alcance, atacam. Senão, <b>caminham até 2 casas (MOVE)</b> e tentam atacar.</li>
      <li><b>Só a própria fileira:</b> ninguém ataca a outra fileira, exceto Corte Diagonal (Nara), Golpe Reverso (Toru) e a Explosão de Brasas (Kael). A cura de Mei e o Tambor de Guerra (Tobi) também alcançam vizinhos da outra fileira.</li>
      <li><b>Corpo a corpo:</b> só atinge o inimigo na casa <b>logo à frente</b> (atacar a 2 casas fica para habilidades) com animação de investida e corte de energia (<b>HIT!</b>).</li>
      <li><b>Longo alcance (Magos 🪄, Arqueiros 🏹 e Suportes à distância):</b> atinge o inimigo <b>mais próximo até 4 casas à frente</b> disparando feixes de Ki ou flechas energéticas e não avança se puder atacar.</li>
      <li><b>Passam pelos aliados</b> ao caminhar, mas só param em casa livre (ninguém termina em casa ocupada). <b>Inimigos bloqueiam.</b> O <b>Riku</b> (Salto Vendaval) se move <b>sempre saltando para a 3ª casa</b> (2ª ou 1ª se estiver ocupada), por cima de quem estiver no caminho, e ataca com bônus ao cair.</li>
      <li><b>Ao derrotar um inimigo</b>, a unidade <b>fica onde está</b>.</li>
      <li><b>Ordem de ação:</b> quem tem <b>Vigia 👁</b> age antes; depois quem está mais à frente; na <b>mesma coluna, a fileira de cima age antes</b>. <b>Atordoado 💫</b> perde a ação.</li>
      <li><b>O Comandante inimigo</b> conta como uma unidade parada logo depois da última coluna, alcançável pelas duas fileiras.</li></ul>
    <h3>Fúria de batalha 🔥</h3><p>A partir do <b>turno 8</b>, todas as unidades dos dois lados ganham <b>+1 de ataque a cada 3 turnos</b>, para a luta não travar. Se chegar ao turno 40, vence quem tiver mais vida (em %) no Comandante.</p>
    <h3>Dano e efeitos</h3><p><b>Físico 👊</b> é reduzido pela resistência física; <b>Mágico ✨</b> pela resistência mágica (resistência só vem de habilidades). Ex.: 3 de dano físico contra resistência 1 = 2 de dano.</p>
    <p>Selos no lutador: <b>🧪 veneno</b> (dano por rodada, ignora resistência), <b>🔥 queimadura</b>, <b>💫 atordoado</b>, <b>🛡 escudo</b> (absorve antes da vida), <b>👼 Anjo da Guarda</b>, <b>🥁</b> recebendo o Tambor e <b>🌀</b> drenado pelo Sifão.</p>
    <h3>Cores das cartas e Despertar</h3><p>${[1, 2, 3, 4, 5, 6].map((n) => `<span class="rar-chip" style="--rc:${STAR_COLORS[n].color}">${TIER_NAMES[n]} (${STAR_COLORS[n].label})</span>`).join(' ')}</p>
    <p>A <b>cor da carta é o tier</b> do personagem — não há mais estrelas. Cada cor tem dois degraus: <b>base</b> e <b>"+"</b> (ex.: Raro → <b>Raro+</b> → Épico). No nível máximo, o <b>Despertar</b> leva da cor ao "+" e, no seguinte, do "+" à próxima cor. O "+" dá só um pequeno bônus de vida ou ataque; <b>habilidades, roupa, armadura, armas e aura de Ki</b> evoluem só quando a <b>cor muda</b>. Do "+" para a próxima cor custa <b>50% a mais</b> de XP e Essências.</p>
    <h3>Poder ⚡ e Comandante 👑</h3><p>Cada carta tem um <b>Poder</b> que sobe com o nível, a cor e o "+", com um bônus pela habilidade do personagem. O <b>Poder do baralho</b> é a soma dos personagens do baralho (cada um uma vez). Em <b>Coleção & Baralho</b>, quando o Poder do baralho alcança o requisito, toque em <b>Evoluir</b> no painel do Comandante: cada nível dá <b>+10 de vida máxima</b> (20 → 110). O Poder só é conferido na hora de evoluir — trocar cartas depois <b>nunca</b> tira o nível do Comandante. Os Comandantes inimigos também ficam mais resistentes a cada fase.</p>
    <h3>Categorias (ícone no canto da carta)</h3><ul>${Object.values(CATEGORY_INFO).map((c) => `<li><b>${c.icon} ${c.label}</b> — ${c.desc}</li>`).join('')}</ul>
  </div></div>`;
  bindNav();
}

// ---------------- MODAL ----------------
function modal(html: string, bind: (m: HTMLElement) => void) {
  closeModal();
  const m = document.createElement('div');
  m.className = 'modal-bg';
  m.innerHTML = `<div class="modal">${html}</div>`;
  document.body.appendChild(m);
  bind(m);
}
function closeModal() {
  document.querySelector('.modal-bg')?.remove();
}

// garante que o save tem todos os campos e personagens válidos
migrateV17(save);
installPerfGuards(app);
/** v0.10.2: bitmaps das cartas de grade (Coleção, Equipe, Treinar, troca) para a cor atual de cada personagem */
function bakeAllGrid() {
  return bakeGridArt(PLAYABLE.map((def) => ({ def, stars: save.cards[def.id]?.stars ?? def.minStars, locked: !save.cards[def.id] })));
}
home();
void bakeAllGrid();
warmLeader();
warmPortraits([
  ...PLAYABLE.map((def) => ({ def, stars: save.cards[def.id]?.stars ?? def.minStars })),
  // miniaturas dos inimigos da Aventura
  ...STAGES.flatMap((st) => st.enemyDeck.map((c) => ({ def: getChar(c.charId), stars: c.stars, layers: ['all' as const] }))).filter((x, i, a) => a.findIndex((y) => y.def.id === x.def.id && y.stars === x.stars) === i),
]);
