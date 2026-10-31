/**
 * v0.43.0 — Card de perfil no canto de cima da Base: foto (rosto de um personagem que o jogador tem, com moldura),
 * nome, nível e barra de XP de perfil. Tocar na foto escolhe o rosto; tocar no nome abre as opções
 * (Trocar nome, Vibração, Linguagem, Trocar/Entrar conta, Créditos, Apagar progresso e Sair).
 */

/** Nome mostrado no card: o apelido escolhido, senão o nome da conta, senão "Jogador". */
export const displayName = () => save.nick || (accounts.current ? accounts.accounts[accounts.current]?.name : '') || 'Jogador';
import { getChar } from '../core/characters';
import { PROFILE_MAX, totalXpFor, xpToNext } from '../core/profile';
import { faceUrl } from '../ui/art';
import { bindTempCropEditor, tempFaceUrl } from './tempProfileCropEditor'; // TEMP crop editor
import { esc, starStyle } from '../ui/components';
import { showDialog } from '../ui/dialog';
import { ico } from '../ui/icons';
import { logout, NAME_MAX } from '../ui/accounts';
import { gameConfirm } from '../ui/dialog';
import { profileLevel, resetSave } from '../ui/save';
import { saveSettings, settings, vibrate } from '../ui/settings';
import { APP_VERSION } from '../ui/update';
import { accounts, persist, prof, save, setSave, openAccountSave, setTrainSel, firstChar } from './state';

/** Personagem da foto: o escolhido (se ainda for do jogador) ou o 1º personagem que ele tem. */
export function avatarId(): string | undefined {
  const owned = Object.keys(save.cards).filter((id) => faceUrl(id));
  return save.avatar && save.cards[save.avatar] && faceUrl(save.avatar) ? save.avatar : owned[0];
}

const avatarImg = (id: string | undefined) => {
  const u = id ? (tempFaceUrl(id) ?? faceUrl(id)) : undefined; // TEMP crop editor: tempFaceUrl
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
  // v0.50.0: estilo Mighty Party — retrato grande, nível no canto de baixo à esquerda, barra de XP e nome embaixo
  return `<div class="pcard pcard-v2">
    <div class="pcard-port">
      <button class="pcard-avatar" id="pAvatar" style="${frame}" title="Trocar foto de perfil" aria-label="Trocar foto de perfil">${avatarImg(id)}</button>
      <span class="pcard-lvbadge" title="Nível de perfil: sobe com XP de perfil (1 por energia gasta e ao vencer ou repetir fases)">${lv}</span>
    </div>
    <div class="pcard-bar" title="${max ? 'Nível máximo' : `XP ${into}/${need}`}"><i style="width:${pct.toFixed(1)}%"></i><span>${max ? 'máx.' : `${into}/${need}`}</span></div>
    <button class="pcard-name" id="pName" title="Opções" aria-label="Opções do perfil">${esc(displayName())}${acc?.admin ? ' <small>teste</small>' : ''}</button>
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
    html: `<div class="avatar-grid">${owned
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
      bindTempCropEditor(root, () => { close('cancel'); refresh(); void avatarDialog(refresh); }); // TEMP crop editor
    },
  });
}

/** Opções do perfil. */
async function optionsDialog(refresh: () => void, enter: () => void) {
  const st = settings();
  const logged = !!accounts.current;
  const row = (opt: string, icon: string, label: string, val = '', cls = '') =>
    `<button class="opt-row${cls}" data-opt="${opt}"><i class="opt-ico">${icon}</i><span>${label}</span>${val ? `<b class="opt-val">${val}</b>` : ''}</button>`;
  const onOff = (v: boolean) => (v ? 'Ligado' : 'Desligado');
  await showDialog({
    title: 'Opções',
    html: `<div class="opt-list">
        ${row('nick', '✏️', 'Trocar nome', esc(displayName()))}
        ${row('vibrate', '📳', 'Vibração', onOff(st.vibrate))}
        <div class="opt-row opt-static"><i class="opt-ico">🌐</i><span>Linguagem</span><b class="opt-val">Português</b></div>
        ${row('enter', ico('perfil', '👤'), logged ? 'Trocar de conta' : 'Entrar / Criar conta')}
        ${row('credits', ico('detalhes', 'ℹ️'), 'Créditos', `v${APP_VERSION}`)}
        ${row('reset', ico('aviso', '⚠️'), 'Apagar progresso', '', ' opt-danger')}
        ${logged ? row('exit', ico('voltar', '🚪'), 'Sair', '', ' opt-exit') : ''}
      </div>`,
    buttons: [{ label: 'Fechar', value: 'cancel', kind: 'ghost' }],
    onMount: (root, close) => {
      const on = (opt: string, fn: (el: HTMLElement) => void) => root.querySelector<HTMLElement>(`[data-opt=${opt}]`)?.addEventListener('click', (e) => fn(e.currentTarget as HTMLElement));
      const setVal = (el: HTMLElement, v: string) => (el.querySelector('.opt-val')!.textContent = v);
      on('vibrate', (el) => {
        st.vibrate = !st.vibrate;
        saveSettings(st);
        setVal(el, onOff(st.vibrate));
        vibrate(40);
      });
      on('nick', () => {
        close('ok');
        void nickDialog(refresh);
      });
      on('enter', () => {
        close('ok');
        enter();
      });
      on('credits', () => {
        close('ok');
        void showDialog({
          title: 'Créditos',
          html: `<p><b>Ki-Clash: Dragon Legacy</b> · versão ${APP_VERSION}</p><p class="hint">Jogo de cartas com batalha automática. Personagens, artes e ícones originais do jogo.</p>`,
          buttons: [{ label: 'Fechar', value: 'ok', kind: 'primary' }],
        });
      });
      on('reset', async () => {
        close('ok');
        if (await gameConfirm('Apagar progresso?', 'Todo o progresso salvo (personagens, níveis, itens e fases) será apagado. Isso não pode ser desfeito.', 'Apagar tudo', true)) {
          resetSave();
          setSave(openAccountSave());
          setTrainSel(firstChar());
          refresh();
        }
      });
      on('exit', () => {
        close('ok');
        persist();
        logout(accounts);
        setSave(openAccountSave());
        setTrainSel(firstChar());
        refresh();
      });
    },
  });
}

/** Trocar o nome mostrado no perfil (não muda o nome de entrar na conta). */
async function nickDialog(refresh: () => void) {
  await showDialog({
    title: 'Trocar nome',
    html: `<form class="acc-form" autocomplete="off" onsubmit="return false"><label>Nome no perfil<input id="nickIn" maxlength="${NAME_MAX}" value="${esc(displayName())}" spellcheck="false"></label>
      <p class="hint">Só muda o nome que aparece no perfil${accounts.current ? '; para entrar na conta continua o mesmo nome de antes' : ''}.</p>
      <div class="dialog-btns"><button type="button" class="btn primary" id="nickOk">Salvar</button></div></form>`,
    buttons: [{ label: 'Cancelar', value: 'cancel', kind: 'ghost' }],
    onMount: (root, close) => {
      const inp = root.querySelector('#nickIn') as HTMLInputElement;
      const ok = () => {
        const v = inp.value.trim().slice(0, NAME_MAX);
        save.nick = v || undefined;
        persist();
        close('ok');
        refresh();
      };
      root.querySelector('#nickOk')!.addEventListener('click', ok);
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') ok();
      });
      setTimeout(() => inp.select(), 30);
    },
  });
}
