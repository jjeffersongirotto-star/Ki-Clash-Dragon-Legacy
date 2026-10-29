/**
 * Tutorial (v0.25.0).
 * v0.28.1: separado do main.ts (organização do código, sem mudar o jogo).
 */
import { getChar } from '../core/characters';
import { stepOf, type XpItemId } from '../core/progression';
import { leaderHp } from '../core/leaders';
import { BattleView } from '../ui/battleView';
import { gemHTML, gearHTML, orbBagHTML, cardHTML, esc, spellCardHTML, essIcon } from '../ui/components';
import { gameConfirm } from '../ui/dialog';
import { enterBattleMode, leaveBattleMode } from '../ui/orientation';
import { MAX_COPIES, addToDeck, setCopies, spellCopies } from '../ui/save';
import { addDupe, dupeCount } from '../core/banner';
import { TUTORIAL_BATTLES, TUTORIAL_CHARS, TUTORIAL_GEMS, TUTORIAL_PACK, TUTORIAL_REWARD, TUTORIAL_SEEDS, TUTORIAL_SPELL, TUTORIAL_SPELL_COPIES, TUTORIAL_STARTER, TUT_BATTLE1, TUT_BATTLE2, TUT_DONE, TUT_PACK, guideStep, guideText, newGuideMemo, tutorialGear } from '../core/tutorial';
import { deployCells } from '../core/battle';
import { isSpell } from '../core/spells';
import { clearSpotlight, spotlight } from '../ui/spotlight';
import { app, accounts, save, persist, activeLeader, leaderLevel } from './state';
import { resultModalWith, closeModal } from './ui';
import { home, accountDialog } from './home';
import { grantOne, grantPack } from './adventure';
import { train } from './train';
import { shop } from './shop';

// ---------------- TUTORIAL (v0.25.0) ----------------
/** Tela do tutorial (o jogador novo cai aqui até terminar; a Base só abre depois). */
export function tutorial(): void {
  leaveBattleMode();
  closeModal();
  const t = save.tutorial ?? TUT_DONE;
  if (t >= TUT_DONE) return home();
  const step = (n: number, label: string) => `<li class="${t > n ? 'done' : t === n ? 'now' : ''}">${t > n ? '✔' : n + 1}. ${label}</li>`;
  const body =
    t === TUT_BATTLE1
      ? `<p>Bem-vindo! Antes da Aventura, uma batalha rápida para aprender. Você começa com o <b>${esc(getChar(TUTORIAL_STARTER).name)}</b>.</p>${cardHTML(save.cards[TUTORIAL_STARTER], { compact: true })}`
      : t === TUT_PACK
        ? `<p>Muito bem! Você ganhou um <b>pacote grátis</b> com 2 personagens novos e 1 feitiço.</p><div class="tut-pack" data-act="pack">🎁<small>Toque para abrir</small></div>`
        : `<p>Agora com 3 personagens. Os inimigos desta batalha mostram como as <b>habilidades</b> funcionam.</p><div class="tut-cards">${TUTORIAL_CHARS.map((id) => cardHTML(save.cards[id], { compact: true })).join('')}${spellCopies(save, TUTORIAL_SPELL) ? spellCardHTML(TUTORIAL_SPELL, { compact: true }) : ''}</div>`;
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
  app.querySelector('[data-act=skip]')!.addEventListener('click', () => void skipTutorial());
}

export function openTutorialPack() {
  const got = grantPack(TUTORIAL_PACK) + grantTutorialSpell();
  save.tutorial = TUT_BATTLE2;
  persist();
  resultModalWith(`<h2 class="win">🎁 Pacote aberto!</h2>${got}<p class="hint">Eles já entraram no seu baralho. O feitiço vem com <b>${TUTORIAL_SPELL_COPIES} cópias</b>.</p>`, [{ label: 'Continuar', primary: true, run: tutorial }]);
}

/** v0.41.0: o feitiço do tutorial (com TUTORIAL_SPELL_COPIES cópias, todas no baralho). Quem já tem não ganha de novo. */
export function grantTutorialSpell(): string {
  if (spellCopies(save, TUTORIAL_SPELL) >= TUTORIAL_SPELL_COPIES) return '';
  const html = spellCopies(save, TUTORIAL_SPELL) ? '' : grantOne(TUTORIAL_SPELL);
  (save.spells ??= {})[TUTORIAL_SPELL] = TUTORIAL_SPELL_COPIES;
  if (save.deck.includes(TUTORIAL_SPELL)) setCopies(save, TUTORIAL_SPELL, TUTORIAL_SPELL_COPIES);
  else addToDeck(save, TUTORIAL_SPELL);
  return html;
}

/**
 * Batalha do tutorial: baralho só com os personagens do tutorial (3 cópias).
 * v0.33.0: GUIADA — o tutorial aponta cada movimento (carta, casa, LUTAR), escurece o resto e espera o jogador
 * fazer; a partida é sempre igual (semente fixa) e as cartas não esperam na mão (ninguém fica travado).
 */
export function tutorialBattle(i: 0 | 1) {
  const stage = TUTORIAL_BATTLES[i];
  const ids = i === 0 ? [TUTORIAL_STARTER] : TUTORIAL_CHARS;
  const deck = ids.filter((id) => save.cards[id]).map((id) => ({ charId: id, stars: save.cards[id].stars, plus: stepOf(save.cards[id]), copies: MAX_COPIES }));
  // v0.41.0: a Batalha 2 já tem o feitiço do pacote (e ensina a lançá-lo)
  if (i === 1 && spellCopies(save, TUTORIAL_SPELL)) deck.push({ charId: TUTORIAL_SPELL, stars: 1, plus: 0, copies: TUTORIAL_SPELL_COPIES });
  window.scrollTo(0, 0);
  enterBattleMode();
  app.innerHTML = '<div class="screen battle-screen tut-battle" id="bs"></div>';
  let timer = 0;
  const stop = () => {
    window.clearInterval(timer);
    clearSpotlight();
  };
  const view = new BattleView(app.querySelector('#bs')!, stage, deck, {
    speed: () => save.speed || 1,
    setSpeed: (n) => {
      save.speed = n;
      persist();
    },
    onExit: () => {
      stop();
      tutorial();
    },
    onFinish: (winner) => {
      stop();
      if (winner !== 'player') return resultModalWith(`<h2 class="lose">${winner === 'empate' ? '⏱ Empate' : '💀 Derrota'}</h2><p>Quase! Tente de novo.</p>`, [{ label: 'Tentar de novo', primary: true, run: () => tutorialBattle(i) }]);
      if (i === 0) {
        save.tutorial = TUT_PACK;
        persist();
        return resultModalWith('<h2 class="win">🏆 Vitória!</h2><p>Você venceu a sua primeira batalha!</p>', [{ label: 'Continuar', primary: true, run: tutorial }]);
      }
      finishTutorial();
    },
    playerHeroHp: leaderHp(activeLeader(), leaderLevel()),
    seed: TUTORIAL_SEEDS[i],
    noWait: true,
  });
  const memo = newGuideMemo();
  // v0.42.1: na 1ª invocação da Batalha 1, primeiro só as 6 casas da zona acendem; o círculo na casa sugerida vem depois
  let zoneIntroEnd = 0;
  const ZONE_INTRO_MS = 3200;
  // v0.35.0: passo "segure a carta" — o texto muda no celular (toque) e no PC (mouse)
  const touch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  view.onInfo = () => {
    memo.held = true;
  };
  const skip = () => {
    stop();
    view.disposed = true;
    void skipTutorial();
  };
  timer = window.setInterval(() => {
    if (view.disposed || !document.body.contains(view.root)) return stop();
    if (view.state.winner) return clearSpotlight();
    const battleEl = view.root.querySelector('.battle');
    // nada cobre o alvo durante o tutorial (menos a descrição logo depois do passo de segurar, até escolher a carta)
    if (!(memo.held && view.selected == null && (view.state.stats?.player.cards ?? 0) === 0)) battleEl?.classList.remove('has-info');
    battleEl?.classList.remove('log-open');
    if (view.busy || document.querySelector('.modal-bg, .battle-card-modal-bg')) return spotlight(null, guideText(i, { kind: 'watch' }, view.state), { onSkip: skip });
    const a = guideStep(i, view.state, view.selected, memo);
    const target =
      a.kind === 'card' || a.kind === 'hold'
        ? view.root.querySelector(`.hand [data-i="${a.hand}"]`)
        : a.kind === 'cell'
          ? view.root.querySelector(`.cell[data-r="${a.r}"][data-c="${a.c}"]`)
          : a.kind === 'fight'
            ? view.root.querySelector('#fightBtn')
            : null;
    // v0.42.1: personagem pode entrar em qualquer casa da zona — as 6 ficam livres e destacadas; a sugerida ganha o círculo
    if (a.kind === 'cell' && !isSpell(a.charId)) {
      const area = deployCells(view.state, 'player').map(([r, c]) => view.root.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`)).filter((el): el is Element => !!el);
      const first = i === 0 && (view.state.stats?.player.cards ?? 0) === 0;
      if (first && !zoneIntroEnd) zoneIntroEnd = Date.now() + ZONE_INTRO_MS;
      const intro = first && Date.now() < zoneIntroEnd;
      return spotlight(intro ? null : target, guideText(i, a, view.state, touch, intro), { onSkip: skip, area });
    }
    spotlight(target, guideText(i, a, view.state, touch), { onSkip: skip });
  }, 150);
}

/** Pular o tutorial: recebe o pacote e a recompensa do mesmo jeito. */
async function skipTutorial() {
  if (!(await gameConfirm('Pular tutorial?', 'Você recebe os personagens e a recompensa do tutorial do mesmo jeito.', 'Pular'))) {
    const t = save.tutorial ?? TUT_DONE;
    return t === TUT_BATTLE1 || t === TUT_BATTLE2 ? tutorialBattle(t === TUT_BATTLE1 ? 0 : 1) : tutorial();
  }
  leaveBattleMode();
  if (!save.cards[TUTORIAL_PACK[0]]) grantPack(TUTORIAL_PACK);
  grantTutorialSpell();
  finishTutorial();
}

/** Caixinha de dica por cima da batalha, uma por vez (dá para fechar todas). */
export function showTips(tips: { icon: string; title: string; text: string }[]) {
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
export function finishTutorial() {
  for (const [id, n] of Object.entries(TUTORIAL_REWARD.orbs)) save.items[id as XpItemId] += n ?? 0;
  save.essencias += TUTORIAL_REWARD.essencias;
  const gear = tutorialGear();
  for (const [k, n] of Object.entries(gear)) (save.gear ??= {})[k] = (save.gear[k] ?? 0) + n;
  // v0.32.0: os 3 personagens do começo vêm com 3 cópias cada (para o baralho inicial ter 9 cartas)
  for (const id of TUTORIAL_CHARS) if (save.cards[id]) {
    const have = dupeCount(save.dupes, id);
    if (have < MAX_COPIES - 1) addDupe((save.dupes ??= {}), id, getChar(id).minStars, MAX_COPIES - 1 - have);
    if (save.deck.includes(id)) setCopies(save, id, MAX_COPIES);
    else addToDeck(save, id);
  }
  // v0.41.0: o feitiço do pacote (save que já tinha passado do pacote antes desta versão também ganha)
  grantTutorialSpell();
  // v0.33.0: + 2 💠 Gemas de Invocação, gastas no passo guiado do Banner logo a seguir
  save.gems = (save.gems ?? 0) + TUTORIAL_GEMS;
  save.tutBanner = true;
  save.tutorial = TUT_DONE;
  persist();
  const items = Object.keys(gear).map((k) => { const [id, r] = k.split(':'); return gearHTML(id, Number(r), `+${gear[k]}`); }).join('');
  resultModalWith(
    `<h2 class="win">🎓 Batalhas concluídas!</h2><p>Recompensa:</p><div class="res big"><span>${essIcon()} +${TUTORIAL_REWARD.essencias}</span>${orbBagHTML(TUTORIAL_REWARD.orbs)}${items}<span>${gemHTML(`+${TUTORIAL_GEMS}`)} Gemas</span></div>
    <p class="hint">Com as <b>💠 Gemas de Invocação</b> você compra cartas novas no <b>🎴 Banner</b>. Vamos usar as 2 agora!</p>`,
    [{ label: '🎴 Ir ao Banner', primary: true, run: bannerGuide }],
  );
}

/**
 * v0.33.0: último passo do tutorial — guiado no 🎴 Banner: compra 1 carta com uma Gema, depois mais 1 com a outra,
 * e sai pelo ✕. Depois, a mensagem final (Treinar / Base).
 */
export function bannerGuide() {
  if (!save.tutBanner) return home();
  shop();
  let timer = 0;
  const done = () => {
    window.clearInterval(timer);
    clearSpotlight();
    save.tutBanner = false;
    persist();
    resultModalWith(
      `<h2 class="win">🎓 Tutorial concluído!</h2><p class="hint">Em <b>🔥 Treinar</b>, use os Orbes para encher a barra de XP e depois <b>Desperte</b> cada personagem para o "+" com os itens. Depois, vá para a <b>⚔ Aventura</b>. Personagens e feitiços novos vêm do <b>🎴 Banner</b> (com Ouro de Dragão ou 💠 Gemas, que as fases 3, 6, 9 e 10 dão na primeira vitória); as fases 2, 5 e 8 dão um <b>✦ feitiço</b> na primeira vitória.</p>`,
      [{ label: '🔥 Treinar', primary: true, run: () => train() }, { label: 'Base', run: home }],
    );
  };
  document.querySelector('.banner-box')?.scrollIntoView({ block: 'center' });
  timer = window.setInterval(() => {
    const modalOpen = document.querySelector('.modal-bg');
    const gems = save.gems ?? 0;
    if (!modalOpen && gems <= 0) return done();
    if (!modalOpen && !document.querySelector('[data-pull="1"]')) return; // ainda montando a Loja
    if (!modalOpen) return spotlight(document.querySelector('[data-pull="1"]'), 'Este é o <b>🎴 Banner</b>. Cada <b>💠 Gema</b> compra 1 carta (um personagem ou um feitiço numa raridade sorteada). Toque em <b>Comprar 1 carta</b>.', { onSkip: done });
    if (gems > 0) return spotlight(document.querySelector('[data-again="1"]'), 'Carta nova entra na sua coleção; repetida vira mais 1 cópia (até 3 no baralho). Use a outra Gema: toque em <b>Comprar 1</b>.', { onSkip: done });
    spotlight(document.querySelector('.pull-x'), 'Pronto! Toque no <b>✕</b> para sair do Banner.', { onSkip: done });
  }, 150);
}

/** Janela de resultado com botões próprios. */
