import { ico } from './icons';
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

/** v0.42.0: emojis dos avisos que têm ícone desenhado (src/assets/icons). */
const DIALOG_ICON: Record<string, string> = { '⚠️': 'aviso', '❔': 'ajuda', 'ℹ️': 'detalhes', '🔒': 'bloqueado', '🃏': 'colecao', '✅': 'sucesso', '⚡': 'energia', '🎉': 'celebracao', '📶': 'offline', '📡': 'offline' };

/** Rótulos de botões que só fecham a janela (viram o ✕ do canto). */
export const DISMISS_LABELS = new Set(['Fechar', 'Entendi', 'OK', 'Ok', 'Cancelar']);

export function showDialog(opts: { title: string; message?: string; html?: string; icon?: string; buttons: DialogButton[]; onMount?: (root: HTMLElement, close: (v: string) => void) => void }): Promise<string> {
  // v0.52.0: padrão do jogo — fechar é só o ✕ no canto de cima à direita. Botões que só fecham
  // (Fechar / Entendi / OK / Cancelar) saem; o ✕ devolve o mesmo valor que eles devolviam.
  const dismiss = opts.buttons.find((b) => DISMISS_LABELS.has(b.label));
  const buttons = opts.buttons.filter((b) => !DISMISS_LABELS.has(b.label));
  const xValue = dismiss?.value ?? 'cancel';
  const ownX = (opts.html ?? '').includes('data-x');
  return new Promise((resolve) => {
    const bg = document.createElement('div');
    bg.className = 'dialog-bg';
    bg.innerHTML = `<div class="dialog" role="dialog" aria-modal="true">
      ${ownX ? '' : `<button class="dialog-x" data-dx aria-label="Fechar" title="Fechar">${ico('fechar', '✕')}</button>`}
      ${opts.icon ? `<div class="dialog-icon">${ico(DIALOG_ICON[opts.icon] ?? '', opts.icon)}</div>` : ''}
      <h3 class="dialog-title">${esc(opts.title)}</h3>
      ${opts.message ? `<p class="dialog-msg">${esc(opts.message)}</p>` : ''}
      ${opts.html ?? ''}
      ${buttons.length ? `<div class="dialog-btns">${buttons.map((b) => `<button class="btn ${b.kind === 'primary' ? 'primary' : b.kind === 'danger' ? 'danger' : b.kind === 'ghost' ? 'ghost' : ''}" data-v="${b.value}">${esc(b.label)}</button>`).join('')}</div>` : ''}
    </div>`;
    document.body.appendChild(bg);
    const close = (v: string) => {
      bg.classList.add('closing');
      setTimeout(() => bg.remove(), 150);
      document.removeEventListener('keydown', onKey);
      resolve(v);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(xValue);
    };
    document.addEventListener('keydown', onKey);
    bg.querySelectorAll<HTMLButtonElement>('[data-v]').forEach((b) => b.addEventListener('click', () => !b.disabled && close(b.dataset.v!)));
    bg.querySelector('[data-dx]')?.addEventListener('click', () => close(xValue));
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
