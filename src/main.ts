import './ui/style.css';
import { CHAR_BY_ID, PLAYABLE, RARITY_INFO, getChar } from './core/characters';
import { STAGES } from './core/campaign';
import { XP_ITEMS, ascend, ascendCost, canAscend, feedXp, maxLevel, newOwned, statsFor, xpProgress, xpToNext, type XpItemId } from './core/progression';
import { portraitSVG } from './ui/art';
import { BattleView } from './ui/battleView';
import { abilityListHTML, cardHTML, dmgLabel, esc, rarityStyle, starsHTML } from './ui/components';
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
    <div class="home-heroes">${['kenji', 'vorax', 'nyx'].map((id) => `<div class="home-hero" style="${rarityStyle(getChar(id))}">${portraitSVG(getChar(id))}</div>`).join('')}</div>
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
  app.querySelector('#reset')!.addEventListener('click', () => {
    if (confirm('Apagar todo o progresso salvo?')) {
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
        <div class="stage-enemies">${s.enemyDeck.slice(0, 4).map((c) => `<span class="mini" style="${rarityStyle(getChar(c.charId))}">${portraitSVG(getChar(c.charId))}</span>`).join('')}</div>
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
      unlocked = `<div class="unlock" style="${rarityStyle(def)}">${portraitSVG(def)}<div><b>Novo personagem!</b><br>${esc(def.name)} — ${RARITY_INFO[def.rarity].label} ${starsHTML(def.minStars)}</div></div>`;
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
  const sorted = PLAYABLE.slice().sort((a, b) => RARITY_INFO[b.rarity].order - RARITY_INFO[a.rarity].order || a.cost - b.cost);
  app.innerHTML = `<div class="screen">${topbar('Coleção & Equipe')}
    <section class="deck-bar">
      <div class="deck-title">Equipe de batalha <b>${save.deck.length}/${DECK_MAX}</b> <small>(mínimo ${DECK_MIN})</small></div>
      <div class="deck-slots">${Array.from({ length: DECK_MAX }, (_, i) => {
        const id = save.deck[i];
        return id ? `<div class="slot filled" data-card="${id}" style="${rarityStyle(getChar(id))}">${portraitSVG(getChar(id))}<span>${getChar(id).cost}</span></div>` : '<div class="slot">+</div>';
      }).join('')}</div>
    </section>
    <p class="hint">Toque numa carta para ver detalhes e colocar/tirar da equipe.</p>
    <div class="card-grid">${sorted.map((def) => {
      const owned = save.cards[def.id];
      if (!owned) return cardHTML({ charId: def.id, level: 1, stars: def.minStars }, { locked: true, attrs: `data-card="${def.id}"`, badge: `🔒 Fase ${unlockStage(def.id) ?? '?'}` });
      return cardHTML(owned, { attrs: `data-card="${def.id}"`, badge: save.deck.includes(def.id) ? '✔ Equipe' : undefined, extraClass: save.deck.includes(def.id) ? 'in-deck' : '' });
    }).join('')}</div></div>`;
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
  modal(`<div class="detail" style="${rarityStyle(def)}">
    <div class="detail-art">${portraitSVG(def)}</div>
    <div class="detail-info">
      <div class="rarity-tag">${RARITY_INFO[def.rarity].label}</div>
      <h2>${esc(def.name)}</h2><div class="subtitle">${esc(def.title)}</div>
      <div>${starsHTML(stars, def.maxStars)} <small>(${def.minStars}★ a ${def.maxStars}★)</small> · Nv.${lvl}/${maxLevel(stars)}</div>
      <div class="stat-row"><span>Custo <b>${def.cost}</b></span><span>Ataque <b>${st.atk}</b></span><span>Vida <b>${st.hp}</b></span><span>${dmgLabel(def)}</span><span>Alcance <b>${def.range + (def.abilities.includes('longoAlcance') ? 2 : 0)}</b></span><span>Movimento <b>${def.move}</b></span></div>
      ${abilityListHTML(def)}
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
      m.querySelector('[data-m=deck]')?.addEventListener('click', () => {
        if (inDeck) {
          if (save.deck.length <= DECK_MIN) return alert(`A equipe precisa de pelo menos ${DECK_MIN} personagens.`);
          save.deck = save.deck.filter((x) => x !== id);
        } else {
          if (save.deck.length >= DECK_MAX) return alert(`A equipe já tem ${DECK_MAX} personagens. Tire alguém primeiro.`);
          save.deck.push(id);
        }
        persist();
        closeModal();
        collection();
      });
    });
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
      .map((c) => `<button class="mini-card ${c.charId === trainSel ? 'sel' : ''}" data-sel="${c.charId}" style="${rarityStyle(getChar(c.charId))}">${portraitSVG(getChar(c.charId))}<span>Nv.${c.level}</span></button>`)
      .join('')}</div>
    <div class="train-main" style="${rarityStyle(def)}">
      <div class="train-art">${portraitSVG(def)}</div>
      <div class="train-info">
        <div class="rarity-tag">${RARITY_INFO[def.rarity].label}</div>
        <h2>${esc(def.name)}</h2>
        <div>${starsHTML(card.stars, def.maxStars)} · <b>Nível ${card.level}</b> / ${maxLevel(card.stars)}</div>
        <div class="xpbar"><i style="width:${pct}%"></i><span>${atCap ? 'NÍVEL MÁXIMO' : `${card.xp} / ${xpToNext(card.level)} XP (${pct}%)`}</span></div>
        <div class="stat-row"><span>Ataque <b>${st.atk}</b>${!atCap && nextSt.atk > st.atk ? ` <em>→ ${nextSt.atk}</em>` : ''}</span><span>Vida <b>${st.hp}</b>${!atCap && nextSt.hp > st.hp ? ` <em>→ ${nextSt.hp}</em>` : ''}</span></div>
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
    const r = ascend(card, save.essencias);
    if (r.ok) {
      save.essencias -= r.cost;
      persist();
      train();
    }
  });
}

// ---------------- AJUDA ----------------
function help() {
  app.innerHTML = `<div class="screen">${topbar('Como jogar')}
  <div class="help">
    <h3>Objetivo</h3><p>Zere a vida do <b>herói inimigo</b> (à direita do campo) antes que ele zere a sua.</p>
    <h3>Seu turno</h3><ol>
      <li>Você recebe <b>energia ⚡</b> (3 no 1º turno, +1 por turno, máx. 10) e compra 1 carta.</li>
      <li>Toque numa carta e numa casa brilhante das <b>2 colunas da esquerda</b> para invocá-la.</li>
      <li>Toque em <b>LUTAR</b>: suas unidades agem sozinhas, depois o inimigo invoca e age.</li></ol>
    <h3>Como as unidades agem</h3><ul>
      <li>Se houver alvo no alcance, atacam. Senão, <b>andam até 2 casas</b> e tentam atacar.</li>
      <li>Alcance básico 2 na mesma fileira. <b>Longo alcance</b> soma +2 e não avança se puder atacar.</li>
      <li>Ninguém atravessa um inimigo sem derrotá-lo — exceto quem tem <b>Salto</b>.</li>
      <li>Ao chegar perto do fim do campo, atacam o herói inimigo.</li>
      <li>Quando uma unidade cai, sua carta volta ao fim do baralho.</li></ul>
    <h3>Dano</h3><p><b>Físico 👊</b> é reduzido pela resistência física; <b>Mágico ✨</b> pela resistência mágica. Ex.: 3 de dano físico contra resistência 1 = 2 de dano.</p>
    <h3>Raridade e estrelas</h3><p>${Object.values(RARITY_INFO).map((r) => `<span class="rar-chip" style="--rc:${r.color}">${r.label}</span>`).join(' ')}</p>
    <p>Cartas vão de 1★ a 6★. Personagens fracos chegam a 4★ (alguns 5★); os Lendários e Míticos começam em 4★ e alguns chegam a 6★. Cada estrela libera +10 níveis.</p>
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
