/**
 * v0.43.0: ajustes do aparelho (não vão no save da conta): sons, vibração e linguagem.
 */
const SETTINGS_KEY = 'kicdl-settings-v1';
export interface Settings { sound: boolean; vibrate: boolean; lang: 'pt' }
const DEFAULTS: Settings = { sound: true, vibrate: true, lang: 'pt' };

export function settings(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* sem armazenamento: vale só nesta sessão */
  }
}

/** Vibra o celular (se a opção estiver ligada e o aparelho tiver vibração). */
export function vibrate(ms: number) {
  if (!settings().vibrate) return;
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* sem vibração */
  }
}
