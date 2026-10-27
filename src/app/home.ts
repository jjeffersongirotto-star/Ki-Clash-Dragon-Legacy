/**
 * Tela da Base, contas locais e ⟳ atualização.
 * v0.28.1: separado do main.ts (organização do código, sem mudar o jogo).
 */
import { PLAYABLE, getChar } from '../core/characters';
import { STAGES } from '../core/campaign';
import { XP_ITEMS } from '../core/progression';
import { cardArtImg } from '../ui/art';
import { goldHTML, orbHTML, esc, starStyle } from '../ui/components';
import { gameAlert, gameConfirm, showDialog } from '../ui/dialog';
import { leaveBattleMode } from '../ui/orientation';
import { tutorialDone, profileLevel, resetSave } from '../ui/save';
import { APK_DOWNLOAD_URL, APP_VERSION, checkForUpdate, isNativeApp } from '../ui/update';
import { PROFILE_MAX, totalXpFor, xpToNext } from '../core/profile';
import { createAccount, login, logout, NAME_MAX, PASS_MIN } from '../ui/accounts';
import { app, accounts, openAccountSave, save, setSave, firstChar, setTrainSel, persist, fmt, prof, resPills } from './state';
import { bindNav } from './ui';
import { bannerGuide, tutorial } from './tutorial';

// ---------------- BASE ----------------
/** v0.32.0: cópias repetidas guardadas (todas as raridades) */
const dupesTotal = () => Object.values(save.dupes ?? {}).reduce((n, row) => n + Object.values(row).reduce((a, k) => a + k, 0), 0);

export function home(): void {
  if (!tutorialDone(save)) return tutorial(); // v0.25.0: o jogador novo começa pelo tutorial
  if (save.tutBanner && (save.gems ?? 0) > 0) return bannerGuide(); // v0.33.0: passo guiado do Banner
  leaveBattleMode();
  const next = STAGES.find((s) => !save.cleared.includes(s.id));
  const acc = accounts.current ? accounts.accounts[accounts.current] : null;
  app.innerHTML = `<div class="screen home">
    <div class="account-box">${acc
      ? `<span class="acc-name" title="Conta local deste aparelho">👤 <b>${esc(acc.name)}</b>${acc.admin ? ' <small>teste</small>' : ''}</span><button class="btn small ghost" id="accOut">Sair</button>`
      : `<button class="btn small" id="accIn">👤 Entrar / Criar conta</button>`}
      ${(() => { const p = prof(); const lv = profileLevel(save); const into = p.xp - totalXpFor(lv); const need = xpToNext(lv); return `<span class="profile-chip" title="Nível de perfil: sobe com XP de perfil (1 por energia gasta e ao vencer ou repetir fases)"><span>👤 Nível <b>${lv}</b>${lv < PROFILE_MAX ? ` <small>${into}/${need}</small>` : ' <small>máx.</small>'}</span><span class="profile-bar"><i style="width:${lv < PROFILE_MAX ? ((100 * into) / need).toFixed(1) : 100}%"></i></span></span>`; })()}
      <span class="app-version">v${APP_VERSION}</span>
      <button class="btn small upd-btn" id="updBtn" title="Procurar atualização" aria-label="Procurar atualização"><svg class="upd-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M20.5 3.5v5h-5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
    <div class="logo">
      <div class="logo-ki">KI-CLASH</div>
      <div class="logo-sub">DRAGON LEGACY</div>
    </div>
    <div class="home-heroes">${['kenji', 'vorax', 'nyx'].map((id) => `<div class="home-hero" style="${starStyle(getChar(id).maxStars)}">${cardArtImg(getChar(id), { stars: getChar(id).maxStars })}</div>`).join('')}</div>
    <div class="res big">${resPills()}<span>✴ ${save.essencias} Essências</span>${XP_ITEMS.filter((i) => save.items[i.id] > 0).map((i) => `<span class="orb-pill">${orbHTML(i.id, save.items[i.id])}</span>`).join('')}</div>
    <nav class="menu">
      <button class="btn primary" data-nav="adventure">⚔ Aventura <small>${next ? `Fase ${next.id}: ${esc(next.name)}` : 'Tudo concluído!'}</small></button>
      <button class="btn" data-nav="collection">🃏 Coleção & Baralho <small>${Object.keys(save.cards).length}/${PLAYABLE.length} personagens</small></button>
      <button class="btn" data-nav="train">🔥 Treinar & Despertar</button>
      <div class="menu-pair"><button class="btn" data-nav="shop">🏪 Loja <small>${goldHTML(fmt(prof().gold))}</small></button><button class="btn" data-nav="inventory">🎒 Inventário <small>${dupesTotal()} repetidos</small></button></div>
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
    setSave(openAccountSave());
    setTrainSel(firstChar());
    home();
  });
  app.querySelector('#reset')!.addEventListener('click', async () => {
    if (await gameConfirm('Apagar progresso?', 'Todo o progresso salvo (personagens, níveis, itens e fases) será apagado. Isso não pode ser desfeito.', 'Apagar tudo', true)) {
      resetSave();
      setSave(openAccountSave());
      home();
    }
  });
}

/** v0.19.0: botão ⟳ — procura uma versão nova (app: Releases do GitHub; site: version.json publicado). */
export async function searchUpdate(btn: HTMLButtonElement) {
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
export async function accountDialog() {
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
        setSave(openAccountSave());
        setTrainSel(firstChar());
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
