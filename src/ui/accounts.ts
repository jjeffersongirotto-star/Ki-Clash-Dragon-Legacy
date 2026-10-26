/**
 * v0.16.0 — Contas LOCAIS (só neste aparelho).
 * ATENÇÃO: isto NÃO é segurança de verdade. Não há servidor; tudo fica no armazenamento do navegador
 * e a senha da conta de teste ADM está visível no código. Serve só para separar o progresso de
 * pessoas que dividem o mesmo aparelho e para testes.
 */
import { GEAR, GEAR_RARITIES, gearKey } from '../core/gear';
import { CHAR_BY_ID, PLAYABLE } from '../core/characters';
import { autoDeck, deckMaxFor, PROFILE_MAX_LEVEL } from '../core/deckbuild';
import { LEADERS } from '../core/leaders';
import { STAGES } from '../core/campaign';
import { MAX_STEP, type OwnedCard } from '../core/progression';
import { defaultSave, type SaveData } from './save';

export const ACCOUNTS_KEY = 'kicdl-accounts-v1';
/** chave do progresso sem conta (o progresso antigo de quem já jogava continua aqui) */
export const GUEST_SAVE_KEY = 'kicdl-save-v1';
/** conta de testes pré-criada: perfil no nível máximo */
export const ADMIN_NAME = 'ADM';
export const ADMIN_PASS = '12345';
export const NAME_MAX = 16;
export const PASS_MIN = 3;

export interface Account { name: string; hash: string; admin?: boolean }
export interface AccountStore { accounts: Record<string, Account>; current: string | null }

/** "hash" simples (FNV-1a) só para não guardar a senha em texto puro — NÃO é criptografia. */
export function weakHash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export const accountId = (name: string) => name.trim().toLowerCase();
export const saveKeyFor = (id: string | null) => (id ? `${GUEST_SAVE_KEY}:${id}` : GUEST_SAVE_KEY);

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadAccounts(): AccountStore {
  let st: AccountStore = { accounts: {}, current: null };
  try {
    const raw = storage()?.getItem(ACCOUNTS_KEY);
    if (raw) {
      const d = JSON.parse(raw) as AccountStore;
      if (d && typeof d.accounts === 'object') st = { accounts: d.accounts, current: d.current ?? null };
    }
  } catch {
    /* corrompido: recomeça */
  }
  // a conta ADM sempre existe, com a senha padrão
  st.accounts[accountId(ADMIN_NAME)] = { name: ADMIN_NAME, hash: weakHash(ADMIN_PASS), admin: true };
  if (st.current && !st.accounts[st.current]) st.current = null;
  return st;
}

export function writeAccounts(st: AccountStore) {
  try {
    storage()?.setItem(ACCOUNTS_KEY, JSON.stringify(st));
  } catch {
    /* armazenamento indisponível */
  }
}

export function validateName(name: string): string | null {
  const n = name.trim();
  if (!n) return 'Digite um nome.';
  if (n.length > NAME_MAX) return `O nome pode ter até ${NAME_MAX} letras.`;
  if (!/^[\p{L}\p{N} _.-]+$/u.test(n)) return 'Use só letras, números, espaço, ponto, hífen ou _.';
  return null;
}

export type AuthResult = { ok: true; id: string; created?: boolean } | { ok: false; error: string };

/** Cria a conta (nome livre + senha) e já entra nela. */
export function createAccount(st: AccountStore, name: string, pass: string): AuthResult {
  const bad = validateName(name);
  if (bad) return { ok: false, error: bad };
  if (pass.length < PASS_MIN) return { ok: false, error: `A senha precisa de pelo menos ${PASS_MIN} caracteres.` };
  const id = accountId(name);
  if (st.accounts[id]) return { ok: false, error: 'Esse nome já existe neste aparelho. Use "Entrar".' };
  st.accounts[id] = { name: name.trim(), hash: weakHash(pass) };
  st.current = id;
  writeAccounts(st);
  return { ok: true, id, created: true };
}

export function login(st: AccountStore, name: string, pass: string): AuthResult {
  const id = accountId(name);
  const acc = st.accounts[id];
  if (!acc) return { ok: false, error: 'Conta não encontrada neste aparelho. Use "Criar conta".' };
  if (acc.hash !== weakHash(pass)) return { ok: false, error: 'Senha incorreta.' };
  st.current = id;
  writeAccounts(st);
  return { ok: true, id };
}

export function logout(st: AccountStore) {
  st.current = null;
  writeAccounts(st);
}

/**
 * Perfil da conta ADM: todos os personagens no topo (raridade máxima "++", v0.23.0),
 * todas as fases concluídas, Comandantes no nível máximo e itens de sobra para testar.
 */
export function adminSave(): SaveData {
  const d = defaultSave();
  const cards: Record<string, OwnedCard> = {};
  for (const def of PLAYABLE) {
    if (!CHAR_BY_ID[def.id]) continue;
    cards[def.id] = { charId: def.id, xp: 0, stars: def.maxStars, plus: MAX_STEP };
  }
  d.cards = cards;
  d.cleared = STAGES.map((s) => s.id);
  d.clearedDiff = { normal: STAGES.map((s) => s.id), dificil: STAGES.map((s) => s.id) };
  // v0.21.0: 3 ⭐ em todas as fases, nas 3 dificuldades
  d.stars = Object.fromEntries(['facil', 'normal', 'dificil'].flatMap((diff) => STAGES.map((s) => [`${diff}:${s.id}`, 7])));
  // v0.17: baralho de 40 (máximo) com os 10 mais fortes × 3 e 10 cartas de feitiço
  const deck = autoDeck(Object.values(cards).map((c) => ({ charId: c.charId, stars: c.stars, plus: c.plus })), deckMaxFor(PROFILE_MAX_LEVEL), 10);
  d.deck = deck.map((c) => c.charId);
  d.copies = Object.fromEntries(deck.map((c) => [c.charId, c.copies ?? 3]));
  d.items = { orbe1: 999, orbe2: 999, orbe3: 999, orbe4: 999, orbe5: 999, orbe6: 999 };
  // v0.24.0: 99 de cada item de ascensão em cada raridade
  d.gear = Object.fromEntries(GEAR.flatMap((g) => GEAR_RARITIES.map((r) => [gearKey(g.id, r), 99])));
  d.essencias = 99999;
  d.leaders = Object.fromEntries(LEADERS.map((l) => [l.id, { level: l.hpByLevel.length }]));
  return d;
}
