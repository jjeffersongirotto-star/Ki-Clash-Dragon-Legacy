/**
 * v0.43.0 — Card de perfil no canto de cima da Base: foto (rosto de um personagem que o jogador tem, com moldura),
 * nome, nível e barra de XP de perfil. Tocar na foto escolhe o rosto; tocar no nome abre as opções
 * (Sons, Linguagem e Sair — ou Entrar/Criar conta, sem conta).
 */
import { getChar } from '../core/characters';
import { PROFILE_MAX, totalXpFor, xpToNext } from '../core/profile';
import { faceUrl } from '../ui/art';
import { esc, starStyle } from '../ui/components';
import { showDialog } from '../ui/dialog';
import { ico } from '../ui/icons';
import { logout } from '../ui/accounts';
import { profileLevel } from '../ui/save';
import { accounts, persist, prof, save, setSave, openAccountSave, setTrainSel, firstChar } from './state';

/** Ajustes do aparelho (não vão no save da conta). */
const SETTINGS_KEY = 'kicdl-settings-v1';
interface Settings { sound: boolean; lang: 'pt' }
export function settings(): Settings {
  try {
    return { sound: true, lang: 'pt', ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') };
  } catch {
    return { sound: true, lang: 'pt' };
  }
}
function saveSettings(s: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* sem armazenamento: vale só nesta sessão */
  }
}

/** Personagem da foto: o escolhido (se ainda for do jogador) ou o 1º personagem que ele tem. */
export function avatarId(): string | undefined {
  const owned = Object.keys(save.cards).filter((id) => faceUrl(id));
  return save.avatar && save.cards[save.avatar] && faceUrl(save.avatar) ? save.avatar : owned[0];
}

const avatarImg = (id: string | undefined) => {
  const u = id ? faceUrl(id) : undefined;
  return u ? `<img src="${u}" alt="" draggable="false">` : ico('perfil', '👤');
};

/** HTML do card de perfil. */
export function profileCardHTML(): string {
  const acc = accounts.current ? accounts.accounts[accounts.current] : null;
  const lv = profileLevel(save);
  const p = prof();
  const max = lv >= PROFILE_MAX;
  const into = p.xp - totalXpFor(lv);
  const need = xpToNext(lv);
  const pct = max ? 100 : Math.max(0, Math.min(100, (100 * into) / need));
  const id = avatarId();
  const frame = id ? starStyle(save.cards[id]?.stars ?? getChar(id).minStars) : '';
  return `<div class="pcard">
    <button class="pcard-avatar" id="pAvatar" style="${frame}" title="Trocar foto de perfil" aria-label="Trocar foto de perfil">${avatarImg(id)}</button>
    <div class="pcard-info">
      <button class="pcard-name" id="pName" title="Opções" aria-label="Opções do perfil">${esc(acc?.name ?? 'Jogador')}${acc?.admin ? ' <small>teste</small>' : ''}</button>
      <div class="pcard-lv" title="Nível de perfil: sobe com XP de perfil (1 por energia gasta e ao vencer ou repetir fases)">NV <b>${lv}</b>${max ? ' <small>máx.</small>' : ` <small>${into}/${need}</small>`}</div>
      <div class="pcard-bar"><i style="width:${pct.toFixed(1)}%"></i></div>
    </div>
  </div>`;
}

/** Liga os toques do card. `refresh` redesenha a Base. */
export function bindProfileCard(root: HTMLElement, refresh: () => void, enter: () => void) {
  root.querySelector('#pAvatar')?.addEventListener('click', () => void avatarDialog(refresh));
  root.querySelector('#pName')?.addEventListener('click', () => void optionsDialog(refresh, enter));
}

/** Escolher a foto: os rostos dos personagens que o jogador tem. */
async function avatarDialog(refresh: () => void) {
  const cur = avatarId();
  const owned = Object.keys(save.cards).filter((id) => faceUrl(id));
  await showDialog({
    title: 'Foto de perfil',
    html: `<p class="hint">Escolha o rosto de um personagem seu. Cada personagem novo que você ganhar libera o rosto dele.</p>
      <div class="avatar-grid">${owned
        .map((id) => `<button class="avatar-opt${id === cur ? ' on' : ''}" data-av="${id}" style="${starStyle(save.cards[id].stars)}" title="${esc(getChar(id).name)}">${avatarImg(id)}<small>${esc(getChar(id).name.split(' ')[0])}</small></button>`)
        .join('')}</div>`,
    buttons: [{ label: 'Fechar', value: 'cancel', kind: 'ghost' }],
    onMount: (root, close) => {
      root.querySelectorAll<HTMLElement>('[data-av]').forEach((b) =>
        b.addEventListener('click', () => {
          save.avatar = b.dataset.av!;
          persist();
          close('ok');
          refresh();
        }),
      );
    },
  });
}

/** Opções do perfil: Sons, Linguagem e Sair (ou Entrar/Criar conta). */
async function optionsDialog(refresh: () => void, enter: () => void) {
  const st = settings();
  const logged = !!accounts.current;
  await showDialog({
    title: 'Opções',
    html: `<div class="opt-list">
        <button class="opt-row" data-opt="sound"><i class="opt-ico">🔊</i><span>Sons</span><b class="opt-val">${st.sound ? 'Ligado' : 'Desligado'}</b></button>
        <div class="opt-row opt-static"><i class="opt-ico">🌐</i><span>Linguagem</span><b class="opt-val">Português</b></div>
        ${logged
          ? `<button class="opt-row opt-exit" data-opt="exit"><i class="opt-ico">${ico('voltar', '🚪')}</i><span>Sair</span></button>`
          : `<button class="opt-row" data-opt="enter"><i class="opt-ico">${ico('perfil', '👤')}</i><span>Entrar / Criar conta</span></button>`}
      </div>`,
    buttons: [{ label: 'Fechar', value: 'cancel', kind: 'ghost' }],
    onMount: (root, close) => {
      root.querySelector('[data-opt=sound]')!.addEventListener('click', (e) => {
        st.sound = !st.sound;
        saveSettings(st);
        (e.currentTarget as HTMLElement).querySelector('.opt-val')!.textContent = st.sound ? 'Ligado' : 'Desligado';
      });
      root.querySelector('[data-opt=exit]')?.addEventListener('click', () => {
        close('ok');
        persist();
        logout(accounts);
        setSave(openAccountSave());
        setTrainSel(firstChar());
        refresh();
      });
      root.querySelector('[data-opt=enter]')?.addEventListener('click', () => {
        close('ok');
        enter();
      });
    },
  });
}
