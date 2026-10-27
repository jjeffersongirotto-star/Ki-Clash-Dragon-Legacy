import { waitFor } from './core/battle';
import type { Category } from './core/types';
import './ui/style.css';
import { CATEGORY_INFO, PLAYABLE, RACE_INFO, STAR_COLORS, getChar, isComingSoon } from './core/characters';
import { STAGES, stageCommander, type Stage } from './core/campaign';
import { MAX_STEP, TIER_NAMES, XP_ITEMS, playXp, ascendCost, ascendCostFor, barFull, canAscend, cardBarXp, feedXp, isMaxTier, nextTier, statsFor, stepOf, stepXp, tierLabel, xpProgress, type XpItemId } from './core/progression';
import { playerLeaderImg, portraitImg, portraitSVG, unitSpriteSVG, warmLeader, warmPortraits } from './ui/art';
import { cardPower, deckPower } from './core/power';
import { canEvolve, evolveLeader, getLeader, leaderHp, leaderMaxLevel, nextRequirement } from './core/leaders';
import { BattleView } from './ui/battleView';
import { abilityListHTML, energyHTML, goldHTML, gearHTML, orbBagHTML, orbHTML, cardHTML, categoryHTML, dmgLabel, esc, raceHTML, reachLabel, spellCardHTML, spellCastersLabel, spellInfoHTML, starStyle, tierHTML } from './ui/components';
import { SPELLS, getSpell, isSpell } from './core/spells';
import { gameAlert, gameConfirm, showDialog } from './ui/dialog';
import { installPerfGuards } from './ui/perf';
import { enterBattleMode, leaveBattleMode } from './ui/orientation';
import { bakeGridArt } from './ui/gridArt';
import { MAX_COPIES, addToDeck, deckMin, tutorialDone, rawSaveHas, copiesIn, deckCards, deckCount, deckIssue, deckMax, hasSave, loadSave, migrateV17, profileLevel, removeFromDeck, resetSave, setCopies, setSaveKey, teamReady, writeSave, type SaveData } from './ui/save';
import { APK_DOWNLOAD_URL, APP_VERSION, checkForUpdate, isNativeApp } from './ui/update';
import { GEAR_BY_ID, GEAR_CATEGORIES, GEAR_DROP, GEAR_PER_STEP, GEAR_RARE_CHANCE, GEAR_RARITIES, GEAR_SETS, STAGE_GEAR, reqRarity, addGear, ascendWithGear, charGear, gearCount, gearNeeded, hasGearFor, stageGearDrop } from './core/gear';
import { DAILY_LIMIT, DIFFICULTIES, DIFFICULTY_ICON, FIRST_WIN_XP_MULT, DIFFICULTY_LABEL, HARD_LEGENDARY_CHANCE, HARD_MYTHIC_CHANCE, STAR_COUNT, starGoals, addStars, type WinResult, rewardsFor, canPlay, canRepeat, dailyLeft, difficultyUnlocked, isCleared, markCleared, stageFor, stageUnlocked, starCount, starsForWin, starsOf, useDaily, type Difficulty } from './core/adventure';
import { enemyCommanderArt } from './ui/art';
import { TUTORIAL_BATTLES, TUTORIAL_CHARS, TUTORIAL_PACK, TUTORIAL_REWARD, TUTORIAL_STARTER, TUTORIAL_TIPS, TUT_BATTLE1, TUT_BATTLE2, TUT_DONE, TUT_PACK, tutorialGear } from './core/tutorial';
import { BANNERS, bannerPrice, grantCard, pull, type Banner, type GrantResult } from './core/banner';
import { ENERGY_COST, FIRST_WIN_MULT, PROFILE_MAX, addProfileXp, energyMax, goldFor, msToNextEnergy, profileXpFor, spendEnergy, tickEnergy, totalXpFor, xpToNext, newProfile, type ProfileState } from './core/profile';
import { GEAR_PRICE, ORB_PRICE, buyGear, buyOrb } from './core/shop';
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
  const d = loadSave();
  // v0.20.0: a ADM tem todas as fases vencidas em todas as dificuldades
  if (id && accounts.accounts[id]?.admin && (!d.clearedDiff?.dificil?.length || Object.values(d.stars ?? {}).some((v) => v !== 7))) {
    const a = adminSave();
    d.clearedDiff = a.clearedDiff;
    d.stars = a.stars; // v0.21.0: ADM com 3 ⭐ em tudo
    writeSave(d);
  }
  // v0.23.0: a ADM tem todos os personagens no topo (raridade máxima "++")
  if (id && accounts.accounts[id]?.admin && Object.values(adminSave().cards).some((c) => d.cards[c.charId]?.stars !== c.stars || d.cards[c.charId]?.plus !== c.plus)) {
    d.cards = { ...d.cards, ...adminSave().cards };
    writeSave(d);
  }
  // v0.26.0: a ADM tem o perfil no nível 100, muita energia e muito Ouro de Dragão
  if (id && accounts.accounts[id]?.admin && (d.profile?.xp ?? 0) < totalXpFor(PROFILE_MAX)) {
    d.profile = adminSave().profile;
    writeSave(d);
  }
  return d;
}
let save: SaveData = openAccountSave();
const firstChar = () => save.deck.find((id) => !isSpell(id) && save.cards[id]) ?? Object.keys(save.cards)[0];
let trainSel: string = firstChar();
let raceFilter: string = 'all';

const persist = () => writeSave(save);
const unlockStage = (charId: string) => STAGES.find((s) => s.pack.includes(charId))?.id;

// ---------------- v0.13: PODER e COMANDANTE ----------------
/** v0.17: o Poder do baralho soma cada personagem uma vez (cópias e feitiços não contam) */
const teamCards = () => save.deck.filter((id) => !isSpell(id) && save.cards[id]).map((id) => save.cards[id]);
const entryName = (id: string) => (isSpell(id) ? `${getSpell(id).icon} ${getSpell(id).name}` : getChar(id).name);
/** Poder do baralho = soma do Poder das cartas da equipe */
const teamPower = () => deckPower(teamCards());
const activeLeader = () => getLeader(save.activeLeader);
const leaderLevel = () => Math.max(1, save.leaders?.[activeLeader().id]?.level ?? 1);
const fmt = (n: number) => n.toLocaleString('pt-BR');

// ---------------- v0.26.0: PERFIL, ENERGIA e OURO DE DRAGÃO ----------------
const prof = (): ProfileState => (save.profile ??= newProfile());
/** energia atual (já com a recuperação do tempo que passou) */
const energyNow = () => tickEnergy(prof()).energy;
const resPills = () => `<span class="res-energy">${energyHTML(energyNow(), energyMax(prof()))}</span><span>${goldHTML(fmt(prof().gold))}</span>`;
/** "4 min 12 s" até a próxima energia */
function nextEnergyText(): string {
  const ms = msToNextEnergy(prof());
  const m = Math.floor(ms / 60000);
  const sec = Math.ceil((ms % 60000) / 1000);
  return m ? `${m} min ${sec} s` : `${sec} s`;
}
/** Aviso de nível de perfil novo (energia ganha e baralho maior). */
function levelNote(r: { levels: number; energy: number; level: number }, deckBefore: number): string {
  if (!r.levels) return '';
  const grew = deckMax(save) > deckBefore;
  return `<p class="hint">⬆ Nível de perfil <b>${r.level}</b>! +${r.energy} ⚡ de energia${grew ? ` · o baralho agora aceita até <b>${deckMax(save)}</b> cartas` : ''}.</p>`;
}
/** XP de perfil e Ouro de uma vitória ou Repetir (em dobro na primeira vitória). */
function grantProfileAndGold(stageId: number, diff: Difficulty, first = false): string {
  const mult = first ? FIRST_WIN_MULT : 1;
  const gold = goldFor(stageId, diff) * mult;
  const xp = profileXpFor(stageId, diff) * mult;
  prof().gold += gold;
  const before = deckMax(save);
  const r = addProfileXp(prof(), xp);
  return `<div class="res big"><span>${goldHTML(`+${fmt(gold)}`)}</span><span>👤 +${xp} XP de perfil</span></div>${levelNote(r, before)}`;
}
/** Nível de perfil já subido ao gastar energia no começo da batalha (mostrado no fim). */
let pendingLevelNote = '';
async function noEnergy(cost: number) {
  await gameAlert('Energia insuficiente', `Esta fase custa ⚡ ${cost} e você tem ⚡ ${energyNow()}. A energia recupera 1 a cada 6 minutos (a próxima em ${nextEnergyText()}) e enche ao subir de nível de perfil.`, '⚡');
}

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
    <div class="res">${resPills()}<span title="Essências Estelares">✴ ${save.essencias}</span>${XP_ITEMS.filter((i) => save.items[i.id] > 0).map((i) => `<span class="orb-pill">${orbHTML(i.id, save.items[i.id])}</span>`).join('')}</div>
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
  else if (screen === 'shop') shop();
}

// ---------------- BASE ----------------
function home(): void {
  if (!tutorialDone(save)) return tutorial(); // v0.25.0: o jogador novo começa pelo tutorial
  leaveBattleMode();
  const next = STAGES.find((s) => !save.cleared.includes(s.id));
  const acc = accounts.current ? accounts.accounts[accounts.current] : null;
  app.innerHTML = `<div class="screen home">
    <div class="account-box">${acc
      ? `<span class="acc-name" title="Conta local deste aparelho">👤 <b>${esc(acc.name)}</b>${acc.admin ? ' <small>teste</small>' : ''}</span><button class="btn small ghost" id="accOut">Sair</button>`
      : `<button class="btn small" id="accIn">👤 Entrar / Criar conta</button>`}
      ${(() => { const p = prof(); const lv = profileLevel(save); const into = p.xp - totalXpFor(lv); const need = xpToNext(lv); return `<span class="profile-chip" title="Nível de perfil: sobe com XP de perfil (1 por energia gasta e ao vencer ou repetir fases)"><span>👤 Nível <b>${lv}</b>${lv < PROFILE_MAX ? ` <small>${into}/${need}</small>` : ' <small>máx.</small>'}</span><span class="profile-bar"><i style="width:${lv < PROFILE_MAX ? ((100 * into) / need).toFixed(1) : 100}%"></i></span></span>`; })()}
      <span class="app-version">v${APP_VERSION}</span>
      <button class="btn small upd-btn" id="updBtn" title="Procurar atualização" aria-label="Procurar atualização">⟳</button></div>
    <div class="logo">
      <div class="logo-ki">KI-CLASH</div>
      <div class="logo-sub">DRAGON LEGACY</div>
    </div>
    <div class="home-heroes">${['kenji', 'vorax', 'nyx'].map((id) => `<div class="home-hero" style="${starStyle(getChar(id).maxStars)}">${portraitImg(getChar(id), { stars: getChar(id).maxStars })}</div>`).join('')}</div>
    <div class="res big">${resPills()}<span>✴ ${save.essencias} Essências</span>${XP_ITEMS.filter((i) => save.items[i.id] > 0).map((i) => `<span class="orb-pill">${orbHTML(i.id, save.items[i.id])}</span>`).join('')}</div>
    <nav class="menu">
      <button class="btn primary" data-nav="adventure">⚔ Aventura <small>${next ? `Fase ${next.id}: ${esc(next.name)}` : 'Tudo concluído!'}</small></button>
      <button class="btn" data-nav="collection">🃏 Coleção & Baralho <small>${Object.keys(save.cards).length}/${PLAYABLE.length} personagens</small></button>
      <button class="btn" data-nav="train">🔥 Treinar & Despertar</button>
      <button class="btn" data-nav="shop">🏪 Loja <small>${goldHTML(fmt(prof().gold))}</small></button>
      <button class="btn ghost" data-nav="help">❓ Como jogar</button>
    </nav>
    <button class="link-btn" id="reset">Apagar progresso</button>
    ${isNativeApp() ? '' : `<a class="btn download-btn" href="${APK_DOWNLOAD_URL}" rel="noopener" title="Baixar o app Android (APK)">⬇ Baixar</a>`}
  </div>`;
  bindNav();
  app.querySelector('#accIn')?.addEventListener('click', accountDialog);
  app.querySelector('#updBtn')!.addEventListener('click', (e) => searchUpdate(e.currentTarget as HTMLButtonElement));
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

/** v0.19.0: botão ⟳ — procura uma versão nova (app: Releases do GitHub; site: version.json publicado). */
async function searchUpdate(btn: HTMLButtonElement) {
  if (btn.classList.contains('checking')) return;
  btn.classList.add('checking');
  const r = await checkForUpdate();
  btn.classList.remove('checking');
  if (r.status === 'latest') return gameAlert('Tudo atualizado', `Você já está na versão mais nova (${r.version}).`, '✅');
  if (r.status === 'none') return gameAlert('Nenhuma versão publicada', 'Ainda não há versão do app publicada para baixar. Tente de novo mais tarde.', 'ℹ️');
  if (r.status === 'error') return gameAlert('Sem conexão', 'Não deu para procurar atualização agora. Confira a internet e toque em ⟳ de novo.', '📡');
  const ok = await gameConfirm(
    `Versão ${r.version} disponível`,
    r.native
      ? `Você está na versão ${APP_VERSION}. Toque em Baixar: o APK novo abre no navegador. Depois de baixar, abra o arquivo e instale por cima; seu progresso continua.`
      : `Você está na versão ${APP_VERSION}. Toque em Atualizar para carregar a versão nova; seu progresso continua.`,
    r.native ? 'Baixar' : 'Atualizar',
  );
  if (!ok) return;
  persist();
  if (r.native) window.location.href = r.url;
  else location.reload();
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
/** v0.20.0: posição de cada fase no mapa (fração da largura), da fase 1 (embaixo) à 10 (em cima) */
const MAP_X = [0.27, 0.72, 0.3, 0.7, 0.28, 0.72, 0.31, 0.69, 0.28, 0.5];
const MAP_STEP = 168;
const MAP_BOTTOM = 92;
const MAP_TOP = 150;
const advDiff = (): Difficulty => save.difficulty ?? 'facil';
/** v0.21.0: ⭐ da fase (cheias = conquistadas, vazias = faltam); `fresh` destaca as recém-ganhas */
const starsHTML = (mask: number, fresh = 0) =>
  `<span class="stars-row" aria-label="${starCount(mask)} de ${STAR_COUNT} estrelas">${[0, 1, 2].map((i) => `<i class="${mask & (1 << i) ? 'on' : ''} ${fresh & (1 << i) ? 'new' : ''}">★</i>`).join('')}</span>`;
type NodeState = 'done' | 'next' | 'lock';
const nodeState = (diff: Difficulty, id: number): NodeState => (isCleared(save, diff, id) ? 'done' : stageUnlocked(save, diff, id) ? 'next' : 'lock');

/** v0.20.0: Aventura em mapa — abas de dificuldade no topo e as fases como bolinhas num caminho pontilhado. */
function adventure() {
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
function drawMap(scrollToNext = false) {
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
function stageDialog(stageId: number) {
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
function grantedHTML(g: GrantResult): string {
  const def = getChar(g.charId);
  if (g.isNew) {
    const joined = addToDeck(save, def.id) > 0;
    return `<div class="unlock" style="${starStyle(g.stars)}">${cardHTML(save.cards[def.id], { compact: true })}<div><b>Novo personagem!</b><br>${esc(def.name)} — ${raceHTML(def)} ${categoryHTML(def, true)} · ${tierHTML(g.stars)}${joined ? '<br><small>Entrou direto no seu baralho.</small>' : ''}</div></div>`;
  }
  return `<div class="unlock dup" style="${starStyle(g.stars)}">${cardHTML({ charId: g.charId, stars: g.stars }, { compact: true })}<div><b>Repetido:</b> ${esc(def.name)} ${tierHTML(g.stars)}<br>📈 virou <b>+${fmt(g.xp)} XP</b>${g.mult > 1 ? ` <b class="dup-luck">×${g.mult}!</b>` : ''}${g.filled ? '<br><small>Barra cheia: suba o degrau em Treinar.</small>' : g.wasted > 0 ? `<br><small>${fmt(g.wasted)} XP passaram da barra cheia.</small>` : ''}</div></div>`;
}

/** v0.25.0: dá os personagens do pacote (entram direto no baralho se couber). v0.27.0: o repetido vira XP. */
function grantPack(ids: string[]): string {
  return ids.map((id) => grantedHTML(grantCard(save.cards, { charId: id, stars: getChar(id).minStars }))).join('');
}

/** Dá a recompensa inteira da fase na dificuldade (vitória ou Repetir; v0.22.0: Orbes pela dificuldade, com as chances do Difícil). */
function grantRewards(st: Stage, diff: Difficulty, first = false) {
  const r = rewardsFor(st.id, diff);
  // v0.24.1: a primeira vitória dá os itens da fase de novo (bônus), então ganha 2 de cada
  if (first) r.gear.push(...stageGearDrop(st.id, diff));
  for (const o of XP_ITEMS) save.items[o.id] += r.orbs[o.id] ?? 0;
  save.essencias += r.essencias;
  for (const g of r.gear) addGear((save.gear ??= {}), g.id, g.rarity);
  return `<div class="res big"><span>✴ +${r.essencias}</span>${XP_ITEMS.filter((o) => r.orbs[o.id]).map((o) => `<span class="orb-pill">${orbHTML(o.id, `+${r.orbs[o.id]}`)}</span>`).join('')}${r.gear.map((g) => gearHTML(g.id, g.rarity, '+1')).join('')}</div>`;
}

/** v0.22.0: XP por jogar — ao vencer jogando, todo o baralho ganha XP. */
function grantPlayXp(stageId: number, first = false): string {
  // v0.24.1: na primeira vitória o XP por jogar vem em dobro
  const xp = playXp(stageId) * (first ? FIRST_WIN_XP_MULT : 1);
  let full = 0;
  for (const id of save.deck) if (!isSpell(id) && save.cards[id] && feedXp(save.cards[id], xp).filled) full++;
  return `<p class="hint">📈 +${xp} XP para cada personagem do baralho${full ? ` · ${full} barra(s) cheia(s): suba o degrau em Treinar` : ''}</p>`;
}

/** Repetir: recompensa na hora, sem jogar a batalha (gasta 1 vez do dia). */
function repeatStage(stageId: number, diff: Difficulty) {
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

function resultModal(html: string) {
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
async function teamWarning(): Promise<void> {
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

function startBattle(stageId: number, diff: Difficulty = advDiff()) {
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
  pendingLevelNote = levelNote(spent, before);
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
function finishBattle(stageId: number, diff: Difficulty, winner: string, end?: WinResult) {
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
  pendingLevelNote = '';
  persist();
  resultModal(html);
}

// ---------------- TUTORIAL (v0.25.0) ----------------
/** Tela do tutorial (o jogador novo cai aqui até terminar; a Base só abre depois). */
function tutorial(): void {
  leaveBattleMode();
  closeModal();
  const t = save.tutorial ?? TUT_DONE;
  if (t >= TUT_DONE) return home();
  const step = (n: number, label: string) => `<li class="${t > n ? 'done' : t === n ? 'now' : ''}">${t > n ? '✔' : n + 1}. ${label}</li>`;
  const body =
    t === TUT_BATTLE1
      ? `<p>Bem-vindo! Antes da Aventura, uma batalha rápida para aprender. Você começa com o <b>${esc(getChar(TUTORIAL_STARTER).name)}</b>.</p>${cardHTML(save.cards[TUTORIAL_STARTER], { compact: true })}`
      : t === TUT_PACK
        ? `<p>Muito bem! Você ganhou um <b>pacote grátis</b> com 2 personagens novos.</p><div class="tut-pack" data-act="pack">🎁<small>Toque para abrir</small></div>`
        : `<p>Agora com 3 personagens. Os inimigos desta batalha mostram como as <b>habilidades</b> funcionam.</p><div class="tut-cards">${TUTORIAL_CHARS.map((id) => cardHTML(save.cards[id], { compact: true })).join('')}</div>`;
  app.innerHTML = `<div class="screen tutorial">
    <h1>🎓 Tutorial</h1>
    <ol class="tut-steps">${step(TUT_BATTLE1, 'Batalha 1')}${step(TUT_PACK, 'Pacote grátis')}${step(TUT_BATTLE2, 'Batalha 2')}</ol>
    <div class="tut-body">${body}</div>
    <div class="row">${t === TUT_PACK ? '' : `<button class="btn primary big" data-act="go">⚔ ${t === TUT_BATTLE1 ? 'Começar' : 'Lutar'}</button>`}</div>
    <button class="link-btn" data-act="skip">Pular tutorial</button>
    ${accounts.current ? '' : '<button class="btn small ghost tut-acc" data-act="acc">👤 Já tenho conta</button>'}
  </div>`;
  app.querySelector('[data-act=acc]')?.addEventListener('click', accountDialog);
  app.querySelector('[data-act=go]')?.addEventListener('click', () => tutorialBattle(t === TUT_BATTLE1 ? 0 : 1));
  app.querySelector('[data-act=pack]')?.addEventListener('click', openTutorialPack);
  app.querySelector('[data-act=skip]')!.addEventListener('click', async () => {
    if (!(await gameConfirm('Pular tutorial?', 'Você recebe os personagens e a recompensa do tutorial do mesmo jeito.', 'Pular'))) return;
    grantPack(TUTORIAL_PACK);
    finishTutorial();
  });
}

function openTutorialPack() {
  const got = grantPack(TUTORIAL_PACK);
  save.tutorial = TUT_BATTLE2;
  persist();
  resultModalWith(`<h2 class="win">🎁 Pacote aberto!</h2>${got}<p class="hint">Eles já entraram no seu baralho.</p>`, [{ label: 'Continuar', primary: true, run: tutorial }]);
}

/** Batalha do tutorial: baralho só com os personagens do tutorial (3 cópias), com as caixinhas de dica. */
function tutorialBattle(i: 0 | 1) {
  const stage = TUTORIAL_BATTLES[i];
  const ids = i === 0 ? [TUTORIAL_STARTER] : TUTORIAL_CHARS;
  const deck = ids.filter((id) => save.cards[id]).map((id) => ({ charId: id, stars: save.cards[id].stars, plus: stepOf(save.cards[id]), copies: MAX_COPIES }));
  window.scrollTo(0, 0);
  enterBattleMode();
  app.innerHTML = '<div class="screen battle-screen" id="bs"></div>';
  new BattleView(app.querySelector('#bs')!, stage, deck, {
    speed: () => save.speed || 1,
    setSpeed: (n) => {
      save.speed = n;
      persist();
    },
    onExit: () => tutorial(),
    onFinish: (winner) => {
      document.querySelector('.tut-tip')?.remove();
      if (winner !== 'player') return resultModalWith(`<h2 class="lose">${winner === 'empate' ? '⏱ Empate' : '💀 Derrota'}</h2><p>Quase! Tente de novo.</p>`, [{ label: 'Tentar de novo', primary: true, run: () => tutorialBattle(i) }]);
      if (i === 0) {
        save.tutorial = TUT_PACK;
        persist();
        return resultModalWith('<h2 class="win">🏆 Vitória!</h2><p>Você venceu a sua primeira batalha!</p>', [{ label: 'Continuar', primary: true, run: tutorial }]);
      }
      finishTutorial();
    },
    playerHeroHp: leaderHp(activeLeader(), leaderLevel()),
  });
  showTips(TUTORIAL_TIPS[i]);
}

/** Caixinha de dica por cima da batalha, uma por vez (dá para fechar todas). */
function showTips(tips: { icon: string; title: string; text: string }[]) {
  document.querySelector('.tut-tip')?.remove();
  let k = 0;
  const box = document.createElement('div');
  box.className = 'tut-tip';
  const draw = () => {
    const t = tips[k];
    box.innerHTML = `<div class="tut-tip-head"><span>${t.icon}</span><b>${esc(t.title)}</b><small>${k + 1}/${tips.length}</small><button class="tut-x" aria-label="Fechar dicas">✕</button></div><p>${esc(t.text)}</p><button class="btn small primary tut-next">${k + 1 < tips.length ? 'Próxima ›' : 'Entendi'}</button>`;
    box.querySelector('.tut-x')!.addEventListener('click', () => box.remove());
    box.querySelector('.tut-next')!.addEventListener('click', () => (++k < tips.length ? draw() : box.remove()));
  };
  draw();
  document.body.appendChild(box);
}

/** Fim do tutorial: recompensa (Orbes, Essências e os itens do "+" dos 3) e a Aventura liberada. */
function finishTutorial() {
  for (const [id, n] of Object.entries(TUTORIAL_REWARD.orbs)) save.items[id as XpItemId] += n ?? 0;
  save.essencias += TUTORIAL_REWARD.essencias;
  const gear = tutorialGear();
  for (const [k, n] of Object.entries(gear)) (save.gear ??= {})[k] = (save.gear[k] ?? 0) + n;
  for (const id of TUTORIAL_CHARS) if (save.cards[id]) addToDeck(save, id);
  save.tutorial = TUT_DONE;
  persist();
  const items = Object.keys(gear).map((k) => { const [id, r] = k.split(':'); return gearHTML(id, Number(r), `+${gear[k]}`); }).join('');
  resultModalWith(
    `<h2 class="win">🎓 Tutorial concluído!</h2><p>Recompensa:</p><div class="res big"><span>✴ +${TUTORIAL_REWARD.essencias}</span>${orbBagHTML(TUTORIAL_REWARD.orbs)}${items}</div>
    <p class="hint">Em <b>🔥 Treinar</b>, use os Orbes para encher a barra de XP e depois <b>Desperte</b> cada personagem para o "+" com os itens. Depois, vá para a <b>⚔ Aventura</b>: cada fase vencida pela primeira vez dá um pacote com personagens novos.</p>`,
    [{ label: '🔥 Treinar', primary: true, run: () => train() }, { label: 'Base', run: home }],
  );
}

/** Janela de resultado com botões próprios. */
function resultModalWith(html: string, buttons: { label: string; primary?: boolean; run: () => void }[]) {
  modal(`${html}<div class="row">${buttons.map((b, i) => `<button class="btn ${b.primary ? 'primary' : ''}" data-b="${i}">${b.label}</button>`).join('')}</div>`, (m) => {
    m.querySelectorAll<HTMLButtonElement>('[data-b]').forEach((el) =>
      el.addEventListener('click', () => {
        closeModal();
        buttons[Number(el.dataset.b)].run();
      }),
    );
  });
}

// ---------------- COLEÇÃO ----------------
function collection() {
  leaveBattleMode();
  void bakeAllGrid();
  const byPower = (a: string, b: string) => {
    const A = save.cards[a], B = save.cards[b];
    return cardPower(B) - cardPower(A) || B.stars - A.stars || stepOf(B) - stepOf(A) || getChar(a).cost - getChar(b).cost;
  };
  const matchRace = (id: string) => raceFilter === 'all' || getChar(id).race === raceFilter;
  const owned = PLAYABLE.filter((d) => save.cards[d.id] && matchRace(d.id)).map((d) => d.id).sort(byPower);
  const lockOrder = (id: string) => (isComingSoon(getChar(id)) ? 999 : unlockStage(id) ?? 99);
  const locked = PLAYABLE.filter((d) => !save.cards[d.id] && matchRace(d.id)).sort((a, b) => lockOrder(a.id) - lockOrder(b.id));
  const lockBadge = (id: string) => (isComingSoon(getChar(id)) ? '🎴 Banner' : `🔒 Fase ${unlockStage(id) ?? '?'}`);
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
      <div class="deck-title"><span class="deck-power" title="Poder do baralho = soma do Poder de cada personagem do baralho (uma vez cada; feitiços não contam)">⚡ ${fmt(teamPower())}</span> Baralho <b>${count}/${max}</b> <small>(nível de perfil ${profileLevel(save)} · mínimo ${deckMin(save)} · até ${MAX_COPIES} cópias por carta${issue ? ` · <span class="warn">${esc(issue)}</span>` : ''})</small></div>
      <div class="deck-slots deck-copies">${save.deck.map(entryHTML).join('')}${count < max ? '<div class="slot">+</div>' : ''}</div>
    </section>
    <div class="race-filters">
      <button class="rf-btn ${raceFilter === 'all' ? 'active' : ''}" data-rf="all">🌟 Todos (${PLAYABLE.length})</button>
      ${Object.entries(RACE_INFO).map(([k, r]) => `<button class="rf-btn ${raceFilter === k ? 'active' : ''}" data-rf="${k}" style="--race-c:${r.color}">${r.icon} ${r.label}</button>`).join('')}
    </div>
    <p class="hint">Toque numa carta para inspecionar a evolução visual de raridade em raridade (Comum → Mítico), ver o sprite de arena e editar a equipe.</p>
    <h3 class="sec-title">Seus personagens <small>(${owned.length})</small></h3>
    <div class="card-grid">${owned.map((id) => cardHTML(save.cards[id], { grid: true, power: cardPower(save.cards[id]), attrs: `data-card="${id}"`, badge: save.deck.includes(id) ? `✔ ×${copiesIn(save, id)}` : undefined, extraClass: save.deck.includes(id) ? 'in-deck' : '' })).join('')}</div>
    <h3 class="sec-title">✦ Feitiços <small>(${SPELLS.length} · ocupam vagas do baralho; precisam de um aliado da categoria em campo)</small></h3>
    <div class="card-grid spell-grid">${SPELLS.map((sp) => spellCardHTML(sp.id, { attrs: `data-card="${sp.id}"`, badge: save.deck.includes(sp.id) ? `✔ ×${copiesIn(save, sp.id)}` : undefined, extraClass: save.deck.includes(sp.id) ? 'in-deck' : '' })).join('')}</div>
    ${locked.length ? `<div class="divider"><span>🔒 Ainda não obtidos (${locked.length})</span></div>
    <div class="card-grid locked-grid">${locked.map((def) => cardHTML({ charId: def.id, stars: def.minStars }, { locked: true, grid: true, extraClass: isComingSoon(def) ? 'soon' : '', attrs: `data-card="${def.id}"`, badge: lockBadge(def.id) })).join('')}</div>
    ${locked.some(isComingSoon) ? `<p class="hint soon-note">🎴 <b>Só no Banner:</b> ${locked.filter(isComingSoon).map((d) => esc(d.name)).join(' e ')} — compre cartas no Banner da 🏪 Loja.</p>` : ''}` : ''}
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
  modal(`<div class="detail" style="${starStyle(stars)}">
    <div class="detail-left">
      ${cardHTML({ charId: id, stars, plus }, { extraClass: 'detail-card', locked: !owned && previewStars == null, power: pow })}
      <div class="detail-sprite-box">
        <div class="ds-sprite">${unitSpriteSVG(def, { stars, side: 'player' })}</div>
        <div class="ds-label">Visual na Arena (${tierLabel(stars, plus)})<br><small>ATQ ${st.atk} | VIDA ${st.hp}</small></div>
      </div>
    </div>
    <div class="detail-info">
      <div class="detail-badges">${tierHTML(stars, plus)} ${raceHTML(def, true)} ${categoryHTML(def, true)}</div>
      <h2>${esc(def.name)}</h2><div class="subtitle">${esc(def.title)}</div>
      <div><small>Faixa: ${tierLabel(def.minStars)} a ${tierLabel(def.maxStars, MAX_STEP)}</small></div>
      <div class="star-preview-bar">
        <span class="sp-label">👁 Ver evolução por raridade (roupa/poder):</span>
        <div class="sp-tabs">${starTabs.join('')}</div>
      </div>
      <div class="stat-row"><span class="pow-stat" title="Poder = 10 × peso da habilidade × √(ataque × vida)">Poder <b>⚡ ${fmt(pow)}</b></span><span title="Rodadas que a carta espera na mão até poder ser invocada">Espera <b>⏳ ${waitFor(def.id)}</b></span><span>Ataque <b>${st.atk}</b></span><span>Vida <b>${st.hp}</b></span><span>${dmgLabel(def)}</span><span>Alcance <b>${reachLabel(def)}</b></span><span>Movimento <b>${def.move}</b></span></div>
      ${abilityListHTML(def, stars, plus)}
      <p class="lore">${esc(def.lore)}</p>
    </div></div>
    <div class="row">${owned ? `<button class="btn primary" data-m="deck">${inDeck ? 'Tirar do baralho' : 'Colocar no baralho'}</button><button class="btn" data-m="train">Treinar</button>` : isComingSoon(def) ? `<p class="hint">🎴 Personagem ${tierLabel(def.minStars)}: sai só no <b>Banner</b> da 🏪 Loja.</p>` : `<p class="hint">🔒 Vença a fase ${unlockStage(id) ?? '?'} pela primeira vez para desbloquear.</p>`}<button class="btn ghost" data-m="close">Fechar</button></div>`,
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
/** Escada de Despertar do personagem: cada degrau com o tamanho da barra de XP e as Essências para subir (v0.23.0). */
function ladderHTML(card: { charId: string; stars: number; plus?: number | boolean }): string {
  const def = getChar(card.charId);
  const rows: string[] = [];
  const cur = { s: card.stars, p: stepOf(card) };
  for (let s = def.minStars; s <= def.maxStars; s++) {
    for (let p = 0; p <= MAX_STEP; p++) {
      const isCur = s === cur.s && p === cur.p;
      const done = s < cur.s || (s === cur.s && p < cur.p);
      const last = s === def.maxStars && p === MAX_STEP;
      const up = last ? '—' : `✴ ${ascendCostFor(s, p)} + ${GEAR_PER_STEP[p]} itens → ${p === MAX_STEP ? `<b>${tierLabel(s + 1)}</b> <small>(nova raridade: habilidades e visual)</small>` : `<b>${tierLabel(s, p + 1)}</b>`}`;
      rows.push(`<tr class="${isCur ? 'cur' : done ? 'done' : ''}" style="${starStyle(s)}"><td><span class="tier-dot"></span>${tierLabel(s, p)}${isCur ? ' <small>(atual)</small>' : ''}</td><td>${last ? '—' : stepXp(s, p).toLocaleString('pt-BR')}</td><td>${up}</td></tr>`);
    }
  }
  return `<details class="ladder" open><summary>🪜 Escada de Despertar</summary><table><thead><tr><th>Degrau</th><th>Barra de XP</th><th>Despertar</th></tr></thead><tbody>${rows.join('')}</tbody></table>
    <p class="hint">Itens de ascensão de ${esc(getChar(card.charId).name)} na raridade ${TIER_NAMES[card.stars]} (1 de cada; alguns são da raridade <b>um acima</b> da carta): <b>"+"</b> ${charGear(card.charId).plus.map((r) => gearHTML(r.id, reqRarity(r, card.stars))).join('')} · <b>"++"</b> ${charGear(card.charId).plus2.map((r) => gearHTML(r.id, reqRarity(r, card.stars))).join('')} · <b>nova raridade</b> ${charGear(card.charId).awaken.map((r) => gearHTML(r.id, reqRarity(r, card.stars))).join('')}</p>
    <p class="hint">As barras ficam na proporção <b>3 / 6 / 10</b> ("+" / "++" / nova raridade). Cada degrau (<b>"+"</b>, <b>"++"</b> e cada nova raridade) dá <b>+17%</b> de ataque e de vida. Habilidades e visual mudam na <b>nova raridade</b>. Encher a barra não aumenta os status: ela libera o Despertar.</p></details>`;
}

/** v0.24.0: mochila de itens de ascensão, por categoria (só os que o jogador tem). */
function gearBagDialog() {
  const bag = save.gear ?? {};
  const rows = GEAR_CATEGORIES.map((cat) => {
    const owned = GEAR_SETS[cat].flatMap((g) => GEAR_RARITIES.filter((r) => gearCount(bag, g.id, r) > 0).map((r) => gearHTML(g.id, r, gearCount(bag, g.id, r))));
    return `<div class="gear-cat">${CATEGORY_INFO[cat].icon} ${CATEGORY_INFO[cat].label}: <small>${GEAR_SETS[cat].map((g) => g.name).join(', ')}</small></div><div class="gear-bag">${owned.join('') || '<small>nenhum ainda</small>'}</div>`;
  }).join('');
  modal(`<h2>🎒 Itens de ascensão</h2><p class="hint">Cada fase dá 3 itens. A cor do fundo é a raridade (cinza, verde, azul, roxo, laranja). Cada degrau pede 3 / 4 / 5 itens ("+" / "++" / nova raridade): 1 / 2 / 3 deles da raridade <b>um acima</b> da carta e 2 da raridade dela (cartas Lendárias e Míticas: só laranja). ${DIFFICULTIES.map((d) => `${DIFFICULTY_LABEL[d]}: ${STAR_COLORS[GEAR_DROP[d][0]].label} ${100 - GEAR_RARE_CHANCE[d] * 100}% / ${STAR_COLORS[GEAR_DROP[d][1]].label} ${GEAR_RARE_CHANCE[d] * 100}%`).join(' · ')}.</p>${rows}<div class="row"><button class="btn primary" data-m="close">Fechar</button></div>`, (m) => {
    m.querySelector('[data-m=close]')!.addEventListener('click', closeModal);
  });
}

// ---------------- LOJA (v0.26.0) ----------------
let shopCat: (typeof GEAR_CATEGORIES)[number] | 'need' = 'need';
let shopRarity = 1;
/** 🏪 Loja: itens de ascensão e Orbes por Ouro de Dragão. */
function shop() {
  leaveBattleMode();
  const bag = (save.gear ??= {});
  const gold = prof().gold;
  // itens que faltam para o próximo degrau dos personagens do baralho
  const need = new Map<string, { id: string; rarity: number; n: number }>();
  for (const c of teamCards())
    for (const g of gearNeeded(c))
      if (gearCount(bag, g.id, g.rarity) < 1) {
        const k = `${g.id}:${g.rarity}`;
        need.set(k, { ...g, n: (need.get(k)?.n ?? 0) + 1 });
      }
  const needKeys = new Set(need.keys());
  const gearCell = (id: string, rarity: number, extra = '') => {
    const price = GEAR_PRICE[rarity];
    return `<div class="shop-item${needKeys.has(`${id}:${rarity}`) ? ' need' : ''}">${gearHTML(id, rarity)}<span>${esc(GEAR_BY_ID[id].name)}</span><small>${STAR_COLORS[rarity].label} · tem ${gearCount(bag, id, rarity)}${extra}</small><button class="btn small ${gold >= price ? 'primary' : ''}" data-gear="${id}" data-r="${rarity}" ${gold >= price ? '' : 'disabled'}>Comprar ${goldHTML(fmt(price))}</button></div>`;
  };
  const list =
    shopCat === 'need'
      ? need.size
        ? [...need.values()].map((g) => gearCell(g.id, g.rarity, g.n > 1 ? ` · ${g.n} personagens pedem` : '')).join('')
        : '<p class="hint">Nenhum item faltando para o próximo degrau dos personagens do seu baralho. 🎉</p>'
      : GEAR_SETS[shopCat].map((g) => gearCell(g.id, shopRarity)).join('');
  app.innerHTML = `<div class="screen">${topbar('🏪 Loja')}
  <div class="shop">
    <p class="hint">Compre com ${goldHTML()} <b>Ouro de Dragão</b>, que vem de cada vitória e Repetir (em dobro na primeira vitória de cada fase).</p>
    ${BANNERS.map((b) => bannerHTML(b, gold)).join('')}
    <h3>🎒 Itens de ascensão</h3>
    <div class="shop-tabs">
      <button class="btn small ${shopCat === 'need' ? 'on primary' : ''}" data-cat="need">⭐ Faltando no baralho${need.size ? ` (${need.size})` : ''}</button>
      ${GEAR_CATEGORIES.map((c) => `<button class="btn small ${shopCat === c ? 'on primary' : ''}" data-cat="${c}">${CATEGORY_INFO[c].icon} ${CATEGORY_INFO[c].label}</button>`).join('')}
    </div>
    ${shopCat === 'need' ? '' : `<div class="shop-tabs">${GEAR_RARITIES.map((r) => `<button class="btn small ${shopRarity === r ? 'on primary' : ''}" data-rar="${r}">${gearHTML(GEAR_SETS[shopCat as Category][0].id, r)} ${STAR_COLORS[r].label} · ${goldHTML(fmt(GEAR_PRICE[r]))}</button>`).join('')}</div>`}
    <div class="shop-grid">${list}</div>
    <h3>🔮 Orbes</h3>
    <div class="shop-grid">${XP_ITEMS.map((o) => `<div class="shop-item">${orbHTML(o.id)}<span>${esc(o.name)}</span><small>+${fmt(o.xp)} XP · tem ${save.items[o.id]}</small><button class="btn small ${gold >= ORB_PRICE[o.id] ? 'primary' : ''}" data-orb="${o.id}" ${gold >= ORB_PRICE[o.id] ? '' : 'disabled'}>Comprar ${goldHTML(fmt(ORB_PRICE[o.id]))}</button></div>`).join('')}</div>
  </div></div>`;
  bindNav();
  const rerender = () => {
    const y = window.scrollY;
    persist();
    shop();
    window.scrollTo(0, y);
  };
  app.querySelectorAll<HTMLElement>('[data-cat]').forEach((b) => b.addEventListener('click', () => { shopCat = b.dataset.cat as typeof shopCat; rerender(); }));
  app.querySelectorAll<HTMLElement>('[data-rar]').forEach((b) => b.addEventListener('click', () => { shopRarity = Number(b.dataset.rar); rerender(); }));
  app.querySelectorAll<HTMLElement>('[data-gear]').forEach((b) => b.addEventListener('click', () => { if (buyGear(prof(), bag, b.dataset.gear!, Number(b.dataset.r)).ok) rerender(); }));
  app.querySelectorAll<HTMLElement>('[data-orb]').forEach((b) => b.addEventListener('click', () => { if (buyOrb(prof(), save.items, b.dataset.orb as XpItemId).ok) rerender(); }));
  app.querySelectorAll<HTMLElement>('[data-pull]').forEach((b) =>
    b.addEventListener('click', () => {
      const banner = BANNERS.find((x) => x.id === b.dataset.banner)!;
      const n = Number(b.dataset.pull) as 1 | 10;
      const price = bannerPrice(banner, n);
      if (prof().gold < price) return;
      prof().gold -= price;
      const got = pull(banner, n).map((c) => grantCard(save.cards, c));
      persist();
      const best = Math.max(...got.map((g) => g.stars));
      resultModalWith(
        `<h2 class="win">🎴 ${esc(banner.name)}</h2><div class="pull-reveal pull-${n}" style="${starStyle(best)}">${got.map((g, i) => `<div class="pull-card r${g.stars}" style="animation-delay:${i * 0.12}s">${grantedHTML(g)}</div>`).join('')}</div>`,
        [{ label: 'Continuar', primary: true, run: shop }],
      );
    }),
  );
}

/** v0.27.0: 🎴 banner estilizado (paisagem, destaque dos mais fortes, chances e botões 1 / 10). */
function bannerHTML(b: Banner, gold: number): string {
  const feat = b.featured.map((id) => getChar(id));
  const odds = Object.entries(b.odds).map(([r, p]) => `<span style="${starStyle(Number(r))}">${TIER_NAMES[Number(r)]} ${Math.round(p * 100)}%</span>`).join('');
  const btn = (n: 1 | 10) => {
    const price = bannerPrice(b, n);
    return `<button class="btn ${gold >= price ? 'primary' : ''}" data-banner="${b.id}" data-pull="${n}" ${gold >= price ? '' : 'disabled'}>${n === 1 ? 'Comprar 1 carta' : 'Comprar 10 cartas'} ${goldHTML(fmt(price))}</button>`;
  };
  return `<div class="banner-box">
    <div class="banner-art">
      <div class="banner-sky"></div><div class="banner-mount"></div>
      <div class="banner-feat">${feat.map((d) => `<div class="banner-hero" style="${starStyle(b.featuredRarity)}">${unitSpriteSVG(d, { stars: b.featuredRarity, side: 'player' })}<b>${esc(d.name)}</b></div>`).join('')}</div>
      <div class="banner-title"><h3>🎴 ${esc(b.name)}</h3><small>${esc(b.subtitle)}</small></div>
    </div>
    <div class="banner-odds">${odds}</div>
    <p class="hint">Cada carta é um personagem na raridade sorteada. ${feat.map((d) => esc(d.name)).join(' e ')} saem só aqui, no ${TIER_NAMES[b.featuredRarity]}. No pacote de 10: pelo menos 1 ${TIER_NAMES[b.guarantee10]} ou melhor. Personagem repetido vira XP dele (às vezes ×2, ×5 ou ×10).</p>
    <div class="row">${btn(1)}${btn(10)}</div>
  </div>`;
}

function train() {
  leaveBattleMode();
  void bakeAllGrid();
  if (!save.cards[trainSel]) trainSel = Object.keys(save.cards)[0];
  const card = save.cards[trainSel];
  const def = getChar(card.charId);
  const plus = stepOf(card);
  const st = statsFor(def, card.stars, plus);
  const top = isMaxTier(card);
  const full = barFull(card);
  const pct = Math.round(xpProgress(card) * 100);
  const nt = nextTier(card);
  const ntLabel = nt ? tierLabel(nt.stars, nt.plus) : '';
  const nextSt = nt ? statsFor(def, nt.stars, nt.plus) : st;
  const need = gearNeeded(card);
  const gearOk = hasGearFor(save.gear, card);
  const needHTML = need.length
    ? `<div class="gear-need"><span>Itens (${need.length}):</span>${need.map((n) => gearHTML(n.id, n.rarity, `${Math.min(1, gearCount(save.gear, n.id, n.rarity))}/1`, gearCount(save.gear, n.id, n.rarity) < 1)).join('')}</div>`
    : '';
  const ascendBtn = nt
    ? `${needHTML}<button class="btn primary" id="ascend" ${canAscend(card) && gearOk && save.essencias >= ascendCost(card) ? '' : 'disabled'}>✨ Subir para ${ntLabel} (✴ ${ascendCost(card)})</button>
       <p class="hint">${full ? '' : 'Encha a barra de XP para subir o degrau. '}${gearOk ? '' : '<span class="warn">Faltam itens de ascensão (as fases dão itens; veja quais em 🎒 Itens).</span> '}${nt.stars === card.stars ? `${ntLabel} dá +17% de ataque e de vida (habilidades e visual iguais).` : `${ntLabel} é uma <b>nova raridade</b>: evolui roupa, armadura, aura, habilidades e status.`}${save.essencias < ascendCost(card) ? ` <span class="warn">Você tem ✴ ${save.essencias}.</span>` : ''}</p>`
    : '<p class="hint">Raridade máxima com "++": este personagem chegou ao topo!</p>';
  app.innerHTML = `<div class="screen">${topbar('Treinar')}
    <div class="row"><button class="btn small" id="gearBag">🎒 Itens de ascensão</button></div>
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
        <div><b>${tierLabel(card.stars, plus)}</b> · <span class="ess">✴ ${save.essencias} Essências</span></div>
        <div class="xpbar"><i style="width:${pct}%"></i><span>${top ? 'TOPO: RARIDADE MÁXIMA "++"' : full ? 'BARRA CHEIA: PODE SUBIR O DEGRAU' : `${card.xp} / ${cardBarXp(card)} XP (${pct}%)`}</span></div>
        <div class="stat-row"><span>Ataque <b>${st.atk}</b>${nextSt.atk > st.atk ? ` <em>→ ${nextSt.atk}</em>` : ''}</span><span>Vida <b>${st.hp}</b>${nextSt.hp > st.hp ? ` <em>→ ${nextSt.hp}</em>` : ''}</span></div>
        ${abilityListHTML(def, card.stars, plus)}
        <div class="items">${XP_ITEMS.map((it) => `<button class="item-btn" data-item="${it.id}" ${save.items[it.id] > 0 && !top && !full ? '' : 'disabled'}><span class="ic">${orbHTML(it.id)}</span><b>${it.name}</b><small>+${it.xp} XP · você tem ${save.items[it.id]}</small></button>`).join('')}</div>
        ${ascendBtn}
        ${top || full ? '' : `<p class="hint">Alimente Orbes 🔮 até encher a barra (o XP que passar do cheio se perde). Com a barra cheia, suba o degrau com Essências ✴.</p>`}
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
      if (r.filled) {
        const fx = document.createElement('div');
        fx.className = 'levelup';
        fx.textContent = 'BARRA CHEIA!';
        document.body.appendChild(fx);
        setTimeout(() => fx.remove(), 1400);
      }
    }),
  );
  app.querySelector('#gearBag')?.addEventListener('click', gearBagDialog);
  app.querySelector('#ascend')?.addEventListener('click', () => {
    const from = { stars: card.stars, plus: stepOf(card) };
    const before = statsFor(def, card.stars, stepOf(card));
    const r = ascendWithGear(card, save.essencias, (save.gear ??= {}));
    if (r.ok) {
      save.essencias -= r.cost;
      persist();
      train();
      evolutionReveal(card.charId, from, { stars: card.stars, plus: stepOf(card) }, before);
    }
  });
}

/**
 * Animação do Despertar. Nova cor: visual antigo → clarão → novo visual.
 * Degrau "+"/"++": o visual é o mesmo; mostra só o selo e o bônus de status.
 */
function evolutionReveal(charId: string, from: { stars: number; plus: number }, to: { stars: number; plus: number }, before: { atk: number; hp: number }) {
  const def = getChar(charId);
  const st = statsFor(def, to.stars, to.plus);
  const newColour = to.stars !== from.stars;
  const gain = `Ataque <b>${before.atk} → ${st.atk}</b> · Vida <b>${before.hp} → ${st.hp}</b>`;
  const bg = document.createElement('div');
  bg.className = 'evo-bg';
  bg.innerHTML = `<div class="evo ${newColour ? '' : 'evo-plus'}">
    <div class="evo-title">${newColour ? 'DESPERTAR!' : `DESPERTAR ${'+'.repeat(to.plus)}`}</div>
    <div class="evo-stage" style="${starStyle(to.stars)}">
      ${newColour ? `<div class="evo-old" style="${starStyle(from.stars)}">${portraitSVG(def, { stars: from.stars })}</div><div class="evo-flash"></div>` : ''}
      <div class="evo-new ${newColour ? '' : 'static'}">${portraitSVG(def, { stars: to.stars })}</div>
      <div class="evo-rays"></div>
    </div>
    <div class="evo-name">${esc(def.name)}</div>
    <div class="evo-stars">${tierHTML(from.stars, from.plus)} <span>➜</span> ${tierHTML(to.stars, to.plus)}</div>
    <div class="evo-stats">${newColour ? `Ataque <b>${st.atk}</b> · Vida <b>${st.hp}</b> · nova raridade: habilidades e visual evoluem` : `${gain} · habilidades e visual iguais`}</div>
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
      <li>Na batalha, as cartas não gastam energia: cada carta da mão tem uma <b>contagem de rodadas ⏳</b> (o número na gota). Ela começa em <b>2 × custo − 1</b> (3, 5, 7, 9 ou 11), cai 1 no início de cada turno seu e a carta só pode ser invocada quando chega a <b>0</b> — dá para invocar <b>todas</b> as prontas no mesmo turno. A mão inicial começa 2 rodadas adiantada. Depois, você compra <b>as cartas que faltarem para a mão voltar a ter 6</b>.</li>
      <li>Toque numa carta e numa casa brilhante das <b>3 colunas da esquerda</b> para invocá-la como um lutador de corpo inteiro na arena.</li>
      <li>Toque em <b>LUTAR</b> (ou ligue o modo <b>Auto</b>): seus personagens caminham (<b>MOVE</b>), saltam, disparam feixes de Ki ou golpes corpo a corpo (<b>HIT</b>), sofrem dano e vão para a <b>Necropolis</b> quando derrotados.</li></ol>
    <h3>Cartas e baralho</h3><ul>
      <li>Cada carta (personagem ou <b>feitiço ✦</b>) entra no baralho com <b>1 a 3 cópias</b> (botões − / + em Coleção & Baralho). O baralho precisa ter de <b>20</b> até <b>28 + 2 × nível de perfil</b> cartas (30 no nível 1, 40 no nível 6+) e pelo menos 1 personagem.</li>
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
    <h3>Raridades das cartas e Despertar</h3><p>${[1, 2, 3, 4, 5, 6].map((n) => `<span class="rar-chip" style="--rc:${STAR_COLORS[n].color}">${TIER_NAMES[n]} (${STAR_COLORS[n].label})</span>`).join(' ')}</p>
    <p>A <b>raridade da carta</b> (mostrada pela cor) é o tier do personagem. A carta <b>não tem nível</b>: cada raridade tem três degraus, <b>base</b>, <b>"+"</b> e <b>"++"</b> (ex.: Raro → <b>Raro+</b> → <b>Raro++</b> → Épico). O degrau aparece na estrela dourada da carta.</p>
    <p>Cada degrau tem uma <b>barra de XP</b> (vista só em <b>Treinar</b>). A barra enche com <b>Orbes 🔮</b> e com o <b>XP por jogar</b>. Com a barra cheia, o <b>Despertar</b> sobe o degrau gastando <b>Essências ✴</b> e <b>itens de ascensão 🎒</b> (3 no "+", 4 no "++" e 5 na nova raridade; 1 / 2 / 3 deles da raridade um acima da carta e 2 da raridade dela; cada fase dá 3 itens). Cada degrau dá <b>+17% de ataque e de vida</b>; encher a barra não aumenta os status. <b>Habilidades, roupa, armadura, armas e aura de Ki</b> evoluem quando a <b>raridade muda</b>.</p>
    <h3>Poder ⚡ e Comandante 👑</h3><p>Cada carta tem um <b>Poder</b> que sobe com a raridade e o degrau ("+" e "++"), com um bônus pela habilidade do personagem. O <b>Poder do baralho</b> é a soma dos personagens do baralho (cada um uma vez). Em <b>Coleção & Baralho</b>, quando o Poder do baralho alcança o requisito, toque em <b>Evoluir</b> no painel do Comandante: cada nível dá <b>+10 de vida máxima</b> (20 → 110). O Poder só é conferido na hora de evoluir — trocar cartas depois <b>nunca</b> tira o nível do Comandante. Os Comandantes inimigos também ficam mais resistentes a cada fase.</p>
    <h3>Energia ⚡, nível de perfil 👤 e Ouro de Dragão ${goldHTML()}</h3><ul>
      <li><b>Jogar ou Repetir</b> uma fase gasta energia: <b>Fácil ${ENERGY_COST.facil} · Normal ${ENERGY_COST.normal} · Difícil ${ENERGY_COST.dificil}</b>. Na batalha ela é gasta ao começar (a derrota também gasta). O tutorial é grátis.</li>
      <li>A energia <b>recupera 1 a cada 6 minutos</b> até o máximo do seu nível de perfil (nível 1 = 20 … nível 100 = 300).</li>
      <li>O <b>nível de perfil</b> sobe com XP de perfil: <b>1 por energia gasta</b> e mais um bônus a cada vitória ou Repetir (em dobro na primeira vitória). Ao subir de nível, você <b>ganha a energia máxima do nível novo</b>, que pode passar do máximo. O nível também aumenta o tamanho do baralho.</li>
      <li>Cada vitória ou Repetir dá <b>Ouro de Dragão</b> (mais nas fases altas e nas dificuldades difíceis; em dobro na primeira vitória). Gaste na <b>🏪 Loja</b> em itens de ascensão, Orbes e cartas do <b>🎴 Banner</b> (personagem repetido vira XP dele).</li></ul>
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
  ...STAGES.flatMap((st) => st.enemyDeck.filter((c) => !isSpell(c.charId)).map((c) => ({ def: getChar(c.charId), stars: c.stars, layers: ['all' as const] }))).filter((x, i, a) => a.findIndex((y) => y.def.id === x.def.id && y.stars === x.stars) === i),
]);
