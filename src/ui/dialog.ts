import { esc } from './components';

/**
 * Diálogos do jogo (substituem confirm/alert/prompt nativos do navegador).
 * Ficam numa camada própria, acima dos outros modais.
 */
export interface DialogButton {
  label: string;
  value: string;
  kind?: 'primary' | 'danger' | 'ghost';
}

export function showDialog(opts: { title: string; message?: string; html?: string; icon?: string; buttons: DialogButton[]; onMount?: (root: HTMLElement, close: (v: string) => void) => void }): Promise<string> {
  return new Promise((resolve) => {
    const bg = document.createElement('div');
    bg.className = 'dialog-bg';
    bg.innerHTML = `<div class="dialog" role="dialog" aria-modal="true">
      ${opts.icon ? `<div class="dialog-icon">${opts.icon}</div>` : ''}
      <h3 class="dialog-title">${esc(opts.title)}</h3>
      ${opts.message ? `<p class="dialog-msg">${esc(opts.message)}</p>` : ''}
      ${opts.html ?? ''}
      <div class="dialog-btns">${opts.buttons.map((b) => `<button class="btn ${b.kind === 'primary' ? 'primary' : b.kind === 'danger' ? 'danger' : b.kind === 'ghost' ? 'ghost' : ''}" data-v="${b.value}">${esc(b.label)}</button>`).join('')}</div>
    </div>`;
    document.body.appendChild(bg);
    const close = (v: string) => {
      bg.classList.add('closing');
      setTimeout(() => bg.remove(), 150);
      document.removeEventListener('keydown', onKey);
      resolve(v);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close('cancel');
    };
    document.addEventListener('keydown', onKey);
    bg.querySelectorAll<HTMLButtonElement>('[data-v]').forEach((b) => b.addEventListener('click', () => !b.disabled && close(b.dataset.v!)));
    opts.onMount?.(bg, close);
    (bg.querySelector('.btn.primary, .btn.danger') as HTMLElement | null)?.focus();
  });
}

export async function gameConfirm(title: string, message: string, okLabel = 'Confirmar', danger = false): Promise<boolean> {
  const v = await showDialog({ title, message, icon: danger ? '⚠️' : '❔', buttons: [{ label: 'Cancelar', value: 'cancel', kind: 'ghost' }, { label: okLabel, value: 'ok', kind: danger ? 'danger' : 'primary' }] });
  return v === 'ok';
}

export async function gameAlert(title: string, message: string, icon = 'ℹ️'): Promise<void> {
  await showDialog({ title, message, icon, buttons: [{ label: 'Entendi', value: 'ok', kind: 'primary' }] });
}
