/**
 * v0.56.0: tela de login ao abrir o jogo (nome + senha, 👁 mostrar senha, ☐ salvar login e senha).
 * Sair do jogo (Perfil → Sair) volta para cá.
 */
import { createAccount, login, logout, NAME_MAX, PASS_MIN, type AuthResult } from '../ui/accounts';
import { esc } from '../ui/components';
import { leaveBattleMode } from '../ui/orientation';
import { accounts, app, firstChar, openAccountSave, persist, setSave, setTrainSel } from './state';
import { home } from './home';

export const LOGIN_SAVED_KEY = 'kc-login-saved';

export function savedLogin(): { u: string; p: string } | null {
  try {
    const v = JSON.parse(localStorage.getItem(LOGIN_SAVED_KEY) ?? 'null');
    return v && typeof v.u === 'string' && typeof v.p === 'string' ? v : null;
  } catch {
    return null;
  }
}

export function loginScreen(): void {
  leaveBattleMode();
  const sv = savedLogin();
  app.innerHTML = `<div class="screen login-screen"><form class="login-box acc-form" autocomplete="off" onsubmit="return false">
      <h2 class="login-title">Ki Clash</h2>
      <label>Nome<input id="lgUser" maxlength="${NAME_MAX}" autocapitalize="off" spellcheck="false" value="${esc(sv?.u ?? '')}"></label>
      <label>Senha<span class="pw-wrap"><input id="lgPass" type="password" minlength="${PASS_MIN}" value="${esc(sv?.p ?? '')}"><button type="button" class="pw-eye" id="lgEye" aria-label="Mostrar senha" title="Mostrar senha">👁</button></span></label>
      <label class="lg-check"><input type="checkbox" id="lgSave"${sv ? ' checked' : ''}> Salvar login e senha</label>
      <p class="acc-err" id="lgErr" role="alert"></p>
      <div class="dialog-btns"><button type="button" class="btn primary" id="lgLogin">Entrar</button><button type="button" class="btn" id="lgCreate">Criar conta</button></div>
      <p class="acc-warn">⚠ Conta <b>só deste aparelho</b>, sem servidor. Não use uma senha que você usa em outro lugar.</p>
    </form></div>`;
  const user = app.querySelector('#lgUser') as HTMLInputElement;
  const pass = app.querySelector('#lgPass') as HTMLInputElement;
  const keep = app.querySelector('#lgSave') as HTMLInputElement;
  const err = app.querySelector('#lgErr') as HTMLElement;
  const eye = app.querySelector('#lgEye') as HTMLButtonElement;
  eye.addEventListener('click', () => {
    const show = pass.type === 'password';
    pass.type = show ? 'text' : 'password';
    eye.classList.toggle('on', show);
    eye.setAttribute('aria-label', show ? 'Esconder senha' : 'Mostrar senha');
  });
  const done = (r: AuthResult) => {
    if (!r.ok) {
      err.textContent = r.error;
      return;
    }
    if (keep.checked) localStorage.setItem(LOGIN_SAVED_KEY, JSON.stringify({ u: user.value, p: pass.value }));
    else localStorage.removeItem(LOGIN_SAVED_KEY);
    setSave(openAccountSave());
    setTrainSel(firstChar());
    home();
  };
  app.querySelector('#lgLogin')!.addEventListener('click', () => done(login(accounts, user.value, pass.value)));
  app.querySelector('#lgCreate')!.addEventListener('click', () => done(createAccount(accounts, user.value, pass.value)));
  pass.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') done(login(accounts, user.value, pass.value));
  });
}

/** Sair do jogo: fecha a conta e volta para a tela de login. */
export function exitToLogin(): void {
  persist();
  logout(accounts);
  setSave(openAccountSave());
  loginScreen();
}
