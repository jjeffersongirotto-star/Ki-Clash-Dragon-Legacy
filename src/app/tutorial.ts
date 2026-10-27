/**
 * Tutorial (v0.25.0).
 * v0.28.1: separado do main.ts (organização do código, sem mudar o jogo).
 */
import { getChar } from '../core/characters';
import { stepOf, type XpItemId } from '../core/progression';
import { leaderHp } from '../core/leaders';
import { BattleView } from '../ui/battleView';
import { gearHTML, orbBagHTML, cardHTML, esc } from '../ui/components';
import { gameConfirm } from '../ui/dialog';
import { enterBattleMode, leaveBattleMode } from '../ui/orientation';
import { MAX_COPIES, addToDeck } from '../ui/save';
import { TUTORIAL_BATTLES, TUTORIAL_CHARS, TUTORIAL_PACK, TUTORIAL_REWARD, TUTORIAL_STARTER, TUTORIAL_TIPS, TUT_BATTLE1, TUT_BATTLE2, TUT_DONE, TUT_PACK, tutorialGear } from '../core/tutorial';
import { app, accounts, save, persist, activeLeader, leaderLevel } from './state';
import { resultModalWith, closeModal } from './ui';
import { home, accountDialog } from './home';
import { grantPack } from './adventure';
import { train } from './train';

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

export function openTutorialPack() {
  const got = grantPack(TUTORIAL_PACK);
  save.tutorial = TUT_BATTLE2;
  persist();
  resultModalWith(`<h2 class="win">🎁 Pacote aberto!</h2>${got}<p class="hint">Eles já entraram no seu baralho.</p>`, [{ label: 'Continuar', primary: true, run: tutorial }]);
}

/** Batalha do tutorial: baralho só com os personagens do tutorial (3 cópias), com as caixinhas de dica. */
export function tutorialBattle(i: 0 | 1) {
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
