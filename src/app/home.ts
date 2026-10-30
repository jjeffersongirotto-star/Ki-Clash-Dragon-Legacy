/**
 * Tela da Base, contas locais e ⟳ atualização.
 * v0.28.1: separado do main.ts (organização do código, sem mudar o jogo).
 */
import { ico } from '../ui/icons';
import { esc, essIcon } from '../ui/components';
import { gameAlert, gameConfirm, showDialog } from '../ui/dialog';
import { leaveBattleMode } from '../ui/orientation';
import { tutorialDone } from '../ui/save';
import { APK_DOWNLOAD_URL, APP_VERSION, checkForUpdate, isNativeApp } from '../ui/update';
import { createAccount, login, NAME_MAX, PASS_MIN } from '../ui/accounts';
import { app, accounts, openAccountSave, save, setSave, firstChar, setTrainSel, persist, resPills } from './state';
import { bindNav, go } from './ui';
import { HUB_SPOTS, hitBox, moved, type HubSpot } from './hubConfig';
import { HUB_BOXES } from '../ui/hubLayers';

const HUB_FILES = import.meta.glob('../assets/hub/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const HUB_IMG: Record<string, string> = Object.fromEntries(Object.entries(HUB_FILES).map(([k, v]) => [k.slice(k.lastIndexOf('/') + 1, -5), v]));
import { bannerGuide, tutorial } from './tutorial';
import { bindProfileCard, profileCardHTML } from './profile';

// ---------------- BASE ----------------
/** v0.32.0: cópias repetidas guardadas (todas as raridades) */
const dupesTotal = () => Object.values(save.dupes ?? {}).reduce((n, row) => n + Object.values(row).reduce((a, k) => a + k, 0), 0);

export function home(): void {
  if (!tutorialDone(save)) return tutorial(); // v0.25.0: o jogador novo começa pelo tutorial
  if (save.tutBanner && (save.gems ?? 0) > 0) return bannerGuide(); // v0.33.0: passo guiado do Banner
  leaveBattleMode();
  const lay = (k: string, spot: HubSpot, extra = '') => {
    const b0 = HUB_BOXES[k];
    const b = b0 && moved(b0, spot);
    const u = HUB_IMG[k];
    if (!b || !u) return '';
    const h = hitBox(b);
    return `<img class="hub-layer${extra}" data-layer="${k}" src="${u}" alt="" draggable="false" style="left:${h.left}%;top:${h.top}%;width:${h.width}%;height:${h.height}%">`;
  };
  app.innerHTML = `<div class="screen home hub">
    <div class="hub-stage"><div class="hub-map" style="background-image:url('${HUB_IMG.vazio}')">
      <div class="hub-cena nuvem" style="background-image:url('${HUB_IMG['cena-nuvem-a']}')"></div>
      <div class="hub-cena nevoa" style="background-image:url('${HUB_IMG['cena-nevoa']}')"></div>
      ${HUB_SPOTS.map((s) => (s.nav ? lay(s.key, s) : lay(`${s.key}-locked`, s, ' hub-locked'))).join('')}
      ${HUB_SPOTS.filter((s) => s.nav).map((s) => lay(`${s.key}-glow`, s, ' hub-glow')).join('')}
      ${HUB_SPOTS.map((s, i) => {
        const b = HUB_BOXES[s.key];
        if (!b) return '';
        const h = hitBox(moved(b, s), s.pad ?? 0);
        return `<button class="hub-spot${s.nav ? '' : ' locked'}" data-spot="${i}" aria-label="${esc(s.label)}${s.nav ? '' : ' (em breve)'}" style="left:${h.left}%;top:${h.top}%;width:${h.width}%;height:${h.height}%"><span class="hub-tag${s.tagUp ? ' up' : ''}${s.tagLeft ? ' left' : ''}"><span class="hub-ribbon">${s.nav ? '' : '<span class="lk">🔒</span> '}${s.br ? esc(s.label.slice(0, s.br)) + '<br>' + esc(s.label.slice(s.br + 1)) : esc(s.label)}</span></span></button>`;
      }).join('')}
    </div></div>
    <div class="account-box hub-top">${profileCardHTML()}
      <div class="res">${resPills()}<span>${essIcon()} ${save.essencias}</span><span title="Repetidos">🎒 ${dupesTotal()}</span></div>
      <span class="app-version">v${APP_VERSION}</span>
      ${isNativeApp() ? '' : `<a class="btn small hub-dl" href="${APK_DOWNLOAD_URL}" rel="noopener" title="Baixar o app Android (APK)">${ico('baixar', '⬇')} Baixar</a>`}
      <button class="btn small upd-btn" id="updBtn" title="Procurar atualização" aria-label="Procurar atualização">${ico('atualizar', '<svg class="upd-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M20.5 3.5v5h-5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>', 'upd-ico')}</button></div>
  </div>`;
  app.querySelectorAll<HTMLButtonElement>('.hub-spot').forEach((el) => el.addEventListener('click', () => tapSpot(HUB_SPOTS[Number(el.dataset.spot)])));
  bindNav();
  bindProfileCard(app, home, accountDialog);
  app.querySelector('#updBtn')!.addEventListener('click', (e) => searchUpdate(e.currentTarget as HTMLButtonElement));
}

let tapping = false;
/** v0.46.0: toque num local do hub — brilho curto e depois abre a tela (ou a janela "Em breve"). */
function tapSpot(s: HubSpot) {
  if (tapping) return;
  tapping = true;
  // v0.47.0: trancado acende só a própria arte com cadeado (nunca a versão liberada)
  const g = app.querySelector<HTMLElement>(s.nav ? `[data-layer="${s.key}-glow"]` : `[data-layer="${s.key}-locked"]`);
  g?.classList.add('on');
  setTimeout(() => {
    tapping = false;
    g?.classList.remove('on');
    if (s.nav) go(s.nav);
    else void gameAlert(`${s.label} — em breve`, `${s.soon ?? ''} Este local ainda está sendo construído.`, '🔒');
  }, 260);
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
