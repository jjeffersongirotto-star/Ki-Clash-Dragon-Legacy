import './ui/style.css';
import { CATEGORY_INFO, CHAR_BY_ID, PLAYABLE, RARITY_INFO, STAR_COLORS, getChar } from './core/characters';
import { STAGES } from './core/campaign';
import { XP_ITEMS, ascend, ascendCost, canAscend, feedXp, maxLevel, newOwned, statsFor, xpProgress, xpToNext, type XpItemId } from './core/progression';
import { portraitSVG } from './ui/art';
import { BattleView } from './ui/battleView';
import { abilityListHTML, cardHTML, categoryHTML, dmgLabel, esc, reachLabel, starStyle, starsHTML } from './ui/components';
import { gameAlert, gameConfirm, showDialog } from './ui/dialog';
import { DECK_MAX, DECK_MIN, loadSave, resetSave, writeSave, type SaveData } from './ui/save';

const app = document.getElementById('app')!;
let save: SaveData = loadSave();
let trainSel: string = save.deck[0] ?? Object.keys(save.cards)[0];

const persist = () => writeSave(save);
const unlockStage = (charId: string) => STAGES.find((s) => s.unlock === charId)?.id;

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
  const next = STAGES.find((s) => !save.cleared.includes(s.id));
  app.innerHTML = `<div class="screen home">
    <div class="logo">
      <div class="logo-ki">KI-CLASH</div>
      <div class="logo-sub">DRAGON LEGACY</div>
    </div>
    <div class="home-heroes">${['kenji', 'vorax', 'nyx'].map((id) => `<div class="home-hero" style="${starStyle(getChar(id).maxStars)}">${portraitSVG(getChar(id), { stars: getChar(id).maxStars })}</div>`).join('')}</div>
    <div class="res big"><span>✴ ${save.essencias} Essências</span>${XP_ITEMS.map((i) => `<span>${i.icon} ${save.items[i.id]}</span>`).join('')}</div>
    <nav class="menu">
      <button class="btn primary" data-nav="adventure">⚔ Aventura <small>${next ? `Fase ${next.id}: ${esc(next.name)}` : 'Tudo concluído!'}</small></button>
      <button class="btn" data-nav="collection">🃏 Coleção & Equipe <small>${Object.keys(save.cards).length}/${PLAYABLE.length} personagens</small></button>
      <button class="btn" data-nav="train">🔥 Treinar <small>Use itens de XP</small></button>
      <button class="btn ghost" data-nav="help">❓ Como jogar</button>
    </nav>
    <button class="link-btn" id="reset">Apagar progresso</button>
  </div>`;
  bindNav();
  app.querySelector('#reset')!.addEventListener('click', async () => {
    if (await gameConfirm('Apagar progresso?', 'Todo o progresso salvo (personagens, níveis, itens e fases) será apagado. Isso não pode ser desfeito.', 'Apagar tudo', true)) {
      save = resetSave();
      home();
    }
  });
}

// ---------------- AVENTURA ----------------
function adventure() {
  app.innerHTML = `<div class="screen">${topbar('Aventura')}
    <p class="hint">Sua equipe: ${save.deck.map((id) => esc(getChar(id).name)).join(', ')}</p>
    <div class="stages">${STAGES.map((s, i) => {
      const unlocked = i === 0 || save.cleared.includes(STAGES[i - 1].id);
      const done = save.cleared.includes(s.id);
      return `<div class="stage ${unlocked ? '' : 'locked'} ${done ? 'done' : ''}">
        <div class="stage-num">${s.id}</div>
        <div class="stage-info"><b>${esc(s.name)}</b>
          <small>Herói inimigo ❤${s.enemyHeroHp} · Nível inimigo ~${s.enemyDeck[0].level}</small>
          <small>Recompensa: ✴${s.rewards.essencias} 📜${s.rewards.pergaminho}${s.rewards.cristal ? ` 💎${s.rewards.cristal}` : ''}${s.rewards.orbe ? ` 🔮${s.rewards.orbe}` : ''}${s.unlock && !save.cards[s.unlock] ? ` · desbloqueia <b>${esc(getChar(s.unlock).name)}</b>` : ''}</small>
        </div>
        <div class="stage-enemies">${s.enemyDeck.filter((c, k, a) => a.findIndex((x) => x.charId === c.charId) === k).slice(0, 5).map((c) => `<span class="mini" style="${starStyle(c.stars)}">${portraitSVG(getChar(c.charId), { stars: c.stars })}</span>`).join('')}</div>
        <button class="btn small ${unlocked ? 'primary' : ''}" data-stage="${s.id}" ${unlocked ? '' : 'disabled'}>${done ? 'Repetir' : unlocked ? 'Lutar' : '🔒'}</button>
      </div>`;
    }).join('')}</div></div>`;
  bindNav();
  app.querySelectorAll<HTMLElement>('[data-stage]').forEach((el) => el.addEventListener('click', () => startBattle(+el.dataset.stage!)));
}

function startBattle(stageId: number) {
  const stage = STAGES.find((s) => s.id === stageId)!;
  const deck = save.deck.filter((id) => save.cards[id]).map((id) => ({ charId: id, level: save.cards[id].level, stars: save.cards[id].stars }));
  app.innerHTML = '<div class="screen battle-screen" id="bs"></div>';
  new BattleView(app.querySelector('#bs')!, stage, deck, {
    speed: () => save.speed || 1,
    setSpeed: (n) => {
      save.speed = n;
      persist();
    },
    onExit: () => adventure(),
    onFinish: (winner) => finishBattle(stageId, winner),
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
    if (first) save.cleared.push(stageId);
    let unlocked = '';
    if (stage.unlock && !save.cards[stage.unlock]) {
      save.cards[stage.unlock] = newOwned(stage.unlock);
      const def = getChar(stage.unlock);
      const joined = save.deck.length < DECK_MAX && !save.deck.includes(def.id);
      if (joined) save.deck.push(def.id);
      unlocked = `<div class="unlock" style="${starStyle(def.minStars)}">${cardHTML(save.cards[def.id], { compact: true })}<div><b>Novo personagem!</b><br>${esc(def.name)} — ${categoryHTML(def, true)} · ${RARITY_INFO[def.rarity].label} ${starsHTML(def.minStars)}${joined ? '<br><small>Entrou direto na sua equipe.</small>' : ''}</div></div>`;
    }
    html = `<h2 class="win">🏆 Vitória!</h2><p>${first ? 'Primeira vitória nesta fase!' : 'Recompensa de repetição (50%).'}</p>
      <div class="res big"><span>✴ +${got.essencias}</span><span>📜 +${got.pergaminho}</span>${got.cristal ? `<span>💎 +${got.cristal}</span>` : ''}${got.orbe ? `<span>🔮 +${got.orbe}</span>` : ''}</div>${unlocked}`;
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
  const byPower = (a: string, b: string) => {
    const A = save.cards[a], B = save.cards[b];
    return B.stars - A.stars || B.level - A.level || getChar(a).cost - getChar(b).cost;
  };
  const owned = PLAYABLE.filter((d) => save.cards[d.id]).map((d) => d.id).sort(byPower);
  const locked = PLAYABLE.filter((d) => !save.cards[d.id]).sort((a, b) => (unlockStage(a.id) ?? 99) - (unlockStage(b.id) ?? 99));
  app.innerHTML = `<div class="screen">${topbar('Coleção & Equipe')}
    <section class="deck-bar">
      <div class="deck-title">Equipe = baralho <b>${save.deck.length}/${DECK_MAX}</b> <small>(cada carta vale 4 cópias · ${save.deck.length < DECK_MAX ? `faltam ${DECK_MAX - save.deck.length}: repetem as primeiras da equipe` : '40 cartas'})</small></div>
      <div class="deck-slots">${Array.from({ length: DECK_MAX }, (_, i) => {
        const id = save.deck[i];
        return id ? cardHTML(save.cards[id], { compact: true, attrs: `data-card="${id}"` }) : '<div class="slot">+</div>';
      }).join('')}</div>
    </section>
    <p class="hint">Toque numa carta para ver detalhes e colocar/tirar da equipe. A cor da carta mostra as estrelas.</p>
    <h3 class="sec-title">Seus personagens <small>(${owned.length})</small></h3>
    <div class="card-grid">${owned.map((id) => cardHTML(save.cards[id], { attrs: `data-card="${id}"`, badge: save.deck.includes(id) ? '✔ Equipe' : undefined, extraClass: save.deck.includes(id) ? 'in-deck' : '' })).join('')}</div>
    ${locked.length ? `<div class="divider"><span>🔒 Ainda não obtidos (${locked.length})</span></div>
    <div class="card-grid locked-grid">${locked.map((def) => cardHTML({ charId: def.id, level: 1, stars: def.minStars }, { locked: true, attrs: `data-card="${def.id}"`, badge: `🔒 Fase ${unlockStage(def.id) ?? '?'}` })).join('')}</div>` : ''}
  </div>`;
  bindNav();
  app.querySelectorAll<HTMLElement>('[data-card]').forEach((el) => el.addEventListener('click', () => cardDetail(el.dataset.card!)));
}

function cardDetail(id: string) {
  const def = getChar(id);
  const owned = save.cards[id];
  const lvl = owned?.level ?? 1;
  const stars = owned?.stars ?? def.minStars;
  const st = statsFor(def, lvl, stars);
  const inDeck = save.deck.includes(id);
  modal(`<div class="detail" style="${starStyle(stars)}">
    ${cardHTML({ charId: id, level: lvl, stars }, { extraClass: 'detail-card', locked: !owned })}
    <div class="detail-info">
      <div class="rarity-tag">${RARITY_INFO[def.rarity].label}</div> ${categoryHTML(def, true)}
      <h2>${esc(def.name)}</h2><div class="subtitle">${esc(def.title)}</div>
      <div>${starsHTML(stars, def.maxStars)} <small>(${def.minStars}★ a ${def.maxStars}★)</small> · Nv.${lvl}/${maxLevel(stars)}</div>
      <div class="stat-row"><span>Custo <b>${def.cost}</b></span><span>Ataque <b>${st.atk}</b></span><span>Vida <b>${st.hp}</b></span><span>${dmgLabel(def)}</span><span>Alcance <b>${reachLabel(def)}</b></span><span>Movimento <b>${def.move}</b></span></div>
      ${abilityListHTML(def, stars, lvl)}
      <p class="lore">${esc(def.lore)}</p>
    </div></div>
    <div class="row">${owned ? `<button class="btn primary" data-m="deck">${inDeck ? 'Tirar da equipe' : 'Colocar na equipe'}</button><button class="btn" data-m="train">Treinar</button>` : `<p class="hint">🔒 Vença a fase ${unlockStage(id) ?? '?'} para desbloquear.</p>`}<button class="btn ghost" data-m="close">Fechar</button></div>`,
    (m) => {
      m.querySelector('[data-m=close]')!.addEventListener('click', closeModal);
      m.querySelector('[data-m=train]')?.addEventListener('click', () => {
        trainSel = id;
        closeModal();
        train();
      });
      m.querySelector('[data-m=deck]')?.addEventListener('click', async () => {
        if (inDeck) {
          if (save.deck.length <= DECK_MIN) return gameAlert('Equipe mínima', `A equipe precisa de pelo menos ${DECK_MIN} personagens. Coloque outro antes de tirar este.`, '🛡️');
          save.deck = save.deck.filter((x) => x !== id);
        } else if (save.deck.length >= DECK_MAX) {
          const removed = await swapDialog(id);
          if (!removed) return;
          save.deck = save.deck.filter((x) => !removed.includes(x));
          save.deck.push(id);
        } else {
          save.deck.push(id);
        }
        persist();
        closeModal();
        collection();
      });
    });
}

/**
 * Troca de equipe: mostra a equipe atual toda selecionada; o jogador toca nas
 * cartas que quer TIRAR (ficam desmarcadas) e confirma em "Trocar".
 * Retorna os ids removidos, ou null se cancelar.
 */
export async function swapDialog(newId: string): Promise<string[] | null> {
  const need = save.deck.length + 1 - DECK_MAX;
  const out = new Set<string>();
  const def = getChar(newId);
  const v = await showDialog({
    title: 'Equipe cheia',
    icon: '🔄',
    html: `<p class="dialog-msg">Para colocar <b>${esc(def.name)}</b>, toque em ${need === 1 ? '<b>1 personagem</b>' : `<b>${need} personagens</b>`} para tirar da equipe.</p>
      <div class="swap-in">${cardHTML(save.cards[newId], { extraClass: 'swap-new' })}<span class="swap-arrow">⇄</span><div class="swap-hint" id="swapHint"></div></div>
      <div class="swap-grid">${save.deck.map((id) => cardHTML(save.cards[id], { extraClass: 'swap-card sel-on', attrs: `data-swap="${id}"`, badge: '✔' })).join('')}</div>`,
    buttons: [
      { label: 'Cancelar', value: 'cancel', kind: 'ghost' },
      { label: 'Trocar', value: 'ok', kind: 'primary' },
    ],
    onMount: (root) => {
      const ok = root.querySelector<HTMLButtonElement>('[data-v=ok]')!;
      const hint = root.querySelector('#swapHint')!;
      const refresh = () => {
        ok.disabled = out.size !== need;
        hint.textContent = out.size === need ? `Sai: ${[...out].map((x) => getChar(x).name).join(', ')}` : `Desmarque ${need - out.size > 0 ? need - out.size : 0} carta(s)`;
        root.querySelectorAll<HTMLElement>('[data-swap]').forEach((el) => {
          const off = out.has(el.dataset.swap!);
          el.classList.toggle('sel-on', !off);
          el.classList.toggle('sel-off', off);
          const b = el.querySelector('.card-badge');
          if (b) b.textContent = off ? '✖ Sai' : '✔';
        });
      };
      root.querySelectorAll<HTMLElement>('[data-swap]').forEach((el) =>
        el.addEventListener('click', () => {
          const id = el.dataset.swap!;
          if (out.has(id)) out.delete(id);
          else if (out.size < need) out.add(id);
          else if (need === 1) {
            out.clear();
            out.add(id);
          }
          refresh();
        }),
      );
      refresh();
    },
  });
  return v === 'ok' && out.size === need ? [...out] : null;
}

// ---------------- TREINO ----------------
function train() {
  if (!save.cards[trainSel]) trainSel = Object.keys(save.cards)[0];
  const card = save.cards[trainSel];
  const def = getChar(card.charId);
  const st = statsFor(def, card.level, card.stars);
  const nextSt = statsFor(def, Math.min(card.level + 1, maxLevel(card.stars)), card.stars);
  const atCap = card.level >= maxLevel(card.stars);
  const pct = Math.round(xpProgress(card) * 100);
  app.innerHTML = `<div class="screen">${topbar('Treinar')}
    <div class="train-list">${Object.values(save.cards)
      .map((c) => cardHTML(c, { compact: true, extraClass: `train-pick ${c.charId === trainSel ? 'sel' : ''}`, attrs: `data-sel="${c.charId}"` }))
      .join('')}</div>
    <div class="train-main" style="${starStyle(card.stars)}">
      <div class="train-art">${portraitSVG(def, { stars: card.stars })}</div>
      <div class="train-info">
        <div class="rarity-tag">${RARITY_INFO[def.rarity].label}</div> ${categoryHTML(def, true)}
        <h2>${esc(def.name)}</h2>
        <div>${starsHTML(card.stars, def.maxStars)} · <b>Nível ${card.level}</b> / ${maxLevel(card.stars)}</div>
        <div class="xpbar"><i style="width:${pct}%"></i><span>${atCap ? 'NÍVEL MÁXIMO' : `${card.xp} / ${xpToNext(card.level)} XP (${pct}%)`}</span></div>
        <div class="stat-row"><span>Ataque <b>${st.atk}</b>${!atCap && nextSt.atk > st.atk ? ` <em>→ ${nextSt.atk}</em>` : ''}</span><span>Vida <b>${st.hp}</b>${!atCap && nextSt.hp > st.hp ? ` <em>→ ${nextSt.hp}</em>` : ''}</span></div>
        ${abilityListHTML(def, card.stars, card.level)}
        <div class="items">${XP_ITEMS.map((it) => `<button class="item-btn" data-item="${it.id}" ${save.items[it.id] > 0 && !atCap ? '' : 'disabled'}><span class="ic">${it.icon}</span><b>${it.name}</b><small>+${it.xp} XP · você tem ${save.items[it.id]}</small></button>`).join('')}</div>
        ${atCap ? (card.stars < def.maxStars ? `<button class="btn primary" id="ascend" ${canAscend(card) && save.essencias >= ascendCost(card) ? '' : 'disabled'}>⭐ Despertar para ${card.stars + 1}★ (✴ ${ascendCost(card)})</button><p class="hint">Despertar aumenta os status e o nível máximo.</p>` : '<p class="hint">Estrelas no máximo para este personagem!</p>') : `<p class="hint">Alimente itens de XP: ao chegar a 100% da barra, o nível sobe — e a próxima barra fica maior.</p>`}
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
    const from = card.stars;
    const r = ascend(card, save.essencias);
    if (r.ok) {
      save.essencias -= r.cost;
      persist();
      train();
      evolutionReveal(card.charId, from, card.stars);
    }
  });
}

/** Animação de evolução ao Despertar: visual antigo → clarão → novo visual. */
function evolutionReveal(charId: string, from: number, to: number) {
  const def = getChar(charId);
  const st = statsFor(def, save.cards[charId].level, to);
  const bg = document.createElement('div');
  bg.className = 'evo-bg';
  bg.innerHTML = `<div class="evo">
    <div class="evo-title">DESPERTAR!</div>
    <div class="evo-stage" style="${starStyle(to)}">
      <div class="evo-old" style="${starStyle(from)}">${portraitSVG(def, { stars: from })}</div>
      <div class="evo-flash"></div>
      <div class="evo-new">${portraitSVG(def, { stars: to })}</div>
      <div class="evo-rays"></div>
    </div>
    <div class="evo-name">${esc(def.name)}</div>
    <div class="evo-stars">${starsHTML(from)} <span>➜</span> ${starsHTML(to)}</div>
    <div class="evo-stats">Ataque <b>${st.atk}</b> · Vida <b>${st.hp}</b> · Nível máx. <b>${maxLevel(to)}</b></div>
    <button class="btn primary">Continuar</button>
  </div>`;
  document.body.appendChild(bg);
  bg.querySelector('button')!.addEventListener('click', () => bg.remove());
  bg.addEventListener('keydown', (e) => e.key === 'Escape' && bg.remove());
}

// ---------------- AJUDA ----------------
function help() {
  app.innerHTML = `<div class="screen">${topbar('Como jogar')}
  <div class="help">
    <h3>Objetivo</h3><p>A arena tem <b>2 fileiras × 7 colunas</b>. Cada herói fica logo depois da última coluna do seu lado. Zere a vida do <b>herói inimigo</b> (à direita) antes que ele zere a sua.</p>
    <h3>Seu turno</h3><ol>
      <li>Você recebe <b>energia ⚡</b> (3 no 1º turno, +1 por turno, máx. 10) e compra <b>1 carta</b> (se a mão de 6 não estiver cheia).</li>
      <li>Toque numa carta e numa casa brilhante das <b>3 colunas da esquerda</b> para invocá-la. O inimigo invoca nas 3 colunas da direita.</li>
      <li>Toque em <b>LUTAR</b>: suas unidades agem sozinhas, depois o inimigo invoca e age.</li></ol>
    <h3>Cartas e baralho</h3><ul>
      <li>Sua <b>equipe é o baralho</b>: <b>10 cartas diferentes × 4 cópias = 40 cartas</b>. Com menos de 10 personagens, as vagas que faltam repetem as primeiras cartas da equipe.</li>
      <li>A <b>mão tem 6 cartas</b>. Você começa com 6 diferentes e compra <b>1 por rodada</b> (com a mão cheia, não compra). Cartas não usadas ficam na mão.</li>
      <li>À esquerda da mão fica o <b>Baralho</b> (quantas cartas ainda podem vir); à direita, as <b>Derrotadas</b>.</li>
      <li>A carta jogada vira unidade em campo. Quando a unidade <b>morre</b>, aquela cópia vai para as <b>Derrotadas e não volta mais</b> (sobram 3 daquela carta, e assim por diante).</li>
      <li><b>Compra semi-aleatória:</b> depois de comprada, a carta fica <b>bloqueada nas 6 compras seguintes</b>; na <b>7ª, 8ª e 9ª</b> pode vir no sorteio e na <b>10ª vem garantida</b>. Conta a partir da compra, não de quando você joga.</li>
      <li><b>Começo da luta:</b> as 6 cartas da mão inicial voltam ao sorteio já na <b>5ª compra</b> (só restam 4 outras) e ficam garantidas na 8ª.</li>
      <li>Se várias cartas ficarem garantidas ao mesmo tempo, elas saem <b>em fila, uma por compra</b>.</li></ul>
    <h3>Como as unidades agem</h3><ul>
      <li>Se houver alvo no alcance, atacam. Senão, <b>andam até 2 casas</b> e tentam atacar.</li>
      <li><b>Só a própria fileira:</b> ninguém ataca a outra fileira, exceto Corte Diagonal (Nara) e Golpe Reverso (Toru). A cura de Mei também alcança vizinhos da outra fileira.</li>
      <li><b>Corpo a corpo:</b> só atinge o inimigo na casa <b>logo à frente</b>.</li>
      <li><b>Longo alcance (Magos 🪄, Arqueiros 🏹 e Suportes à distância):</b> atinge o inimigo <b>mais próximo até 3 casas à frente</b> e não avança se puder atacar.</li>
      <li><b>Ao derrotar um inimigo</b>, a unidade <b>avança 1 casa</b> se ela estiver livre.</li>
      <li><b>O herói inimigo</b> conta como uma unidade parada logo depois da última coluna, alcançável pelas duas fileiras. Quem não tem unidade inimiga para enfrentar ataca o herói com o próprio alcance: corpo a corpo (inclusive Nara e Toru) da <b>última coluna</b>; Zarek e Yume (mira até 2) da <b>penúltima</b>; quem tem longo alcance já de <b>3 casas</b> antes do herói, sem precisar ir até o fim.</li>
      <li><b>Miras especiais</b> (sempre na própria fileira): <b>Emboscada</b> (Zarek) pega o inimigo mais distante até 2 casas; <b>Instinto Predador</b> (Yume) o de menos vida até 2 casas; <b>Feixe Perfurante</b> (Lyra) acerta o mais próximo e atravessa os de trás no alcance. Sem alvo válido, atacam normalmente — ou o herói, se estiver no alcance.</li>
      <li><b>Diagonais:</b> Corte Diagonal atinge a casa diagonal logo à frente; Golpe Reverso, a casa diagonal logo atrás.</li>
      <li>Ninguém atravessa um inimigo sem derrotá-lo — exceto quem tem <b>Salto</b> (pula 1 unidade, 2 casas).</li></ul>
    <h3>Fúria de batalha 🔥</h3><p>A partir do <b>turno 8</b>, todas as unidades dos dois lados ganham <b>+1 de ataque a cada 3 turnos</b>, para a luta não travar. Se chegar ao turno 40, vence quem tiver mais vida (em %) no herói.</p>
    <h3>Dano</h3><p><b>Físico 👊</b> é reduzido pela resistência física; <b>Mágico ✨</b> pela resistência mágica. Ex.: 3 de dano físico contra resistência 1 = 2 de dano.</p>
    <h3>Estrelas e cores das cartas</h3><p>${[1, 2, 3, 4, 5, 6].map((n) => `<span class="rar-chip" style="--rc:${STAR_COLORS[n].color}">${n}★ ${STAR_COLORS[n].label}</span>`).join(' ')}</p>
    <p>A <b>cor da carta mostra as estrelas</b>. A raridade (${Object.values(RARITY_INFO).map((r) => r.label).join(', ')}) aparece como texto. Quem começa em 1★ ou 2★ vai até 4★; em 3★ vai até 5★; em 4★ ou 5★ vai até 6★. Os <b>únicos</b> (Kenji e Vorax) já nascem em 5★. Cada estrela libera +10 níveis e deixa o visual mais imponente.</p>
    <h3>Categorias (ícone no canto da carta)</h3><ul>${Object.values(CATEGORY_INFO).map((c) => `<li><b>${c.icon} ${c.label}</b> — ${c.desc}</li>`).join('')}</ul>
    <h3>Habilidades evoluem</h3><p>As habilidades ficam mais fortes com <b>estrelas</b> (e algumas com <b>nível</b>) — veja "⭐" nos detalhes da carta. Todas têm teto: resistência máxima 3, redução de ataque máxima 2, no máximo 3 Crias por lado e dano mínimo sempre 1. Ninguém fica invencível.</p>
    <h3>Treino</h3><p>Use Pergaminhos, Cristais e Orbes de Ki para encher a barra de XP. Em 100% o nível sobe e a próxima barra é maior. No nível máximo, gaste Essências ✴ para <b>Despertar</b> (+1★).</p>
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
save.deck = save.deck.filter((id) => CHAR_BY_ID[id] && save.cards[id]);
home();
