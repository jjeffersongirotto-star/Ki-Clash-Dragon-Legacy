import { beforeEach, describe, expect, it } from 'vitest';
import { COLS, Ctx, DEPLOY_DEPTH, OPENING_HEADSTART, ROWS, createBattle, deploy, endPlayerTurn, findTarget, isDeployCell, placeUnit, rangeOf, resolveSide, waitFor, waitOf } from '../src/core/battle';
import { aiDeploy } from '../src/core/ai';
import { PLAYABLE, getChar } from '../src/core/characters';
import { LEADERS } from '../src/core/leaders';
import { STAGES } from '../src/core/campaign';
import { cardHTML } from '../src/ui/components';
import { ADMIN_NAME, ADMIN_PASS, adminSave, createAccount, loadAccounts, login, logout, saveKeyFor, weakHash } from '../src/ui/accounts';
import { defaultSave, loadSave, setSaveKey, writeSave } from '../src/ui/save';
import type { BattleState, CardInstance } from '../src/core/types';

const c = (id: string, _level = 1, stars = getChar(id).minStars): CardInstance => ({ charId: id, stars });
const deck10 = ['riku', 'nara', 'toru', 'daichi', 'sora', 'tobi', 'kael', 'suri', 'hana', 'jin'].map((id) => c(id));
const empty = (): BattleState => createBattle({ playerDeck: [], enemyDeck: [], playerHeroHp: 30, enemyHeroHp: 30, seed: 1 });

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage;
  setSaveKey('kicdl-save-v1');
});

describe('v0.16.0 — arena 2 × 12', () => {
  it('2 fileiras × 12 colunas; cada lado invoca nas suas 3 colunas das pontas', () => {
    const s = empty();
    expect([ROWS, COLS, s.rows, s.cols]).toEqual([2, 12, 2, 12]);
    const p = [], e = [];
    for (let r = 0; r < 2; r++) for (let col = 0; col < 12; col++) {
      if (isDeployCell(s, 'player', r, col)) p.push(col);
      if (isDeployCell(s, 'enemy', r, col)) e.push(col);
    }
    expect([...new Set(p)]).toEqual([0, 1, 2]);
    expect([...new Set(e)]).toEqual([9, 10, 11]);
    expect(DEPLOY_DEPTH).toBe(3);
  });
  it('o Comandante inimigo fica logo depois da coluna 12 (última coluna ataca corpo a corpo)', () => {
    const s = empty();
    const u = placeUnit(s, c('nara'), 'player', 0, 11);
    expect(findTarget(s, u)).toBe('hero');
    u.col = 10;
    expect(findTarget(s, u)).toBeNull();
  });
});

describe('v0.16.0 — contagem de rodadas no lugar da energia', () => {
  it('espera = 2 × custo − 1 (custo 2 → 3 … custo 6 → 11)', () => {
    expect(['riku', 'toru', 'gorath', 'kenji', 'vorax'].map(waitFor)).toEqual([3, 5, 7, 9, 11]);
    expect(OPENING_HEADSTART).toBe(2);
  });
  it('mão inicial começa 2 rodadas adiantada e anda 1 por turno: custo 2 pronta no turno 1', () => {
    const s = createBattle({ playerDeck: deck10, enemyDeck: deck10, playerHeroHp: 99, enemyHeroHp: 99, seed: 4 });
    for (const h of s.decks.player.hand) expect(waitOf(h)).toBe(Math.max(0, waitFor(h.charId) - OPENING_HEADSTART - 1));
    expect(s.decks.player.hand.some((h) => getChar(h.charId).cost === 2 && waitOf(h) === 0) || !s.decks.player.hand.some((h) => getChar(h.charId).cost === 2)).toBe(true);
    const before = s.decks.player.hand.map(waitOf);
    endPlayerTurn(s, () => {});
    expect(s.decks.player.hand.map(waitOf)).toEqual(before.map((w) => Math.max(0, w - 1)));
  });
  it('só invoca com a contagem em 0; várias prontas podem ser invocadas no mesmo turno', () => {
    const s = createBattle({ playerDeck: deck10, enemyDeck: deck10, playerHeroHp: 99, enemyHeroHp: 99, seed: 4 });
    s.decks.player.hand[0].wait = 2;
    const r = deploy(s, 'player', 0, 0, 0);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/faltam 2 rodadas/);
    s.decks.player.hand.forEach((h) => (h.wait = 0));
    expect(deploy(s, 'player', 0, 0, 0).ok).toBe(true);
    expect(deploy(s, 'player', 0, 1, 0).ok).toBe(true);
    expect(deploy(s, 'player', 0, 0, 1).ok).toBe(true);
  });
  it('cartas compradas entram com a espera cheia', () => {
    const s = createBattle({ playerDeck: deck10, enemyDeck: deck10, playerHeroHp: 99, enemyHeroHp: 99, seed: 4 });
    s.decks.player.hand.forEach((h) => (h.wait = 0));
    deploy(s, 'player', 0, 0, 0);
    deploy(s, 'player', 0, 1, 0);
    endPlayerTurn(s, () => {});
    const fresh = s.decks.player.hand.slice(4);
    expect(fresh).toHaveLength(2);
    for (const h of fresh) expect(waitOf(h)).toBe(waitFor(h.charId));
  });
  it('a IA invoca TODAS as cartas prontas (até faltar casa) e nenhuma que ainda espera', () => {
    const s = createBattle({ playerDeck: deck10, enemyDeck: deck10, playerHeroHp: 99, enemyHeroHp: 99, seed: 4 });
    s.decks.enemy.hand.forEach((h, i) => (h.wait = i < 4 ? 0 : 3));
    s.active = 'enemy';
    aiDeploy(s, new Ctx(), 'enemy');
    expect(s.units.filter((u) => u.side === 'enemy')).toHaveLength(4);
    expect(s.decks.enemy.hand.every((h) => waitOf(h) === 3)).toBe(true);
  });
  it('a gota da carta mostra as rodadas: na mão, as que faltam; fora da batalha, a espera cheia', () => {
    expect(cardHTML(c('toru'))).toContain('<span>5</span>');
    expect(cardHTML(c('toru'), { wait: 2 })).toContain('<span>2</span>');
    expect(cardHTML(c('toru'), { wait: 0 })).toContain('ck-cost ready');
  });
  it('o estado da batalha não tem mais energia', () => {
    expect('energy' in empty()).toBe(false);
  });
});

describe('v0.16.0 — alcance e ordem', () => {
  it('magos, arqueiros e suportes à distância: alcance 4 (antes 3); corpo a corpo segue 1', () => {
    const s = empty();
    for (const d of PLAYABLE) {
      const u = placeUnit(s, c(d.id), 'player', 0, 0);
      const ranged = d.category === 'mago' || d.category === 'arqueiro' || d.abilities.includes('longoAlcance');
      if (d.abilities.includes('salto')) continue;
      expect(rangeOf(u)).toBe(ranged ? 4 : 1);
      s.units = [];
    }
  });
  it('à distância atinge a 4 casas mas não a 5', () => {
    const s = empty();
    const u = placeUnit(s, c('aiko', 1, 2), 'player', 0, 2);
    const e = placeUnit(s, c('gorath'), 'enemy', 0, 6);
    expect(findTarget(s, u)).toBe(e);
    e.col = 7;
    expect(findTarget(s, u)).toBeNull();
  });
  it('corpo a corpo só ataca a casa logo à frente (a 2 casas, não)', () => {
    const s = empty();
    const u = placeUnit(s, c('toru'), 'player', 1, 4);
    const e = placeUnit(s, c('gorath'), 'enemy', 1, 6);
    expect(findTarget(s, u)).toBeNull();
    e.col = 5;
    expect(findTarget(s, u)).toBe(e);
  });
  it('desempate: na mesma coluna a fileira de cima age primeiro (dos dois lados)', () => {
    for (const side of ['player', 'enemy'] as const) {
      const s = empty();
      s.active = side;
      const col = side === 'player' ? 3 : 8;
      const bottom = placeUnit(s, c('nara'), side, 1, col);
      const top = placeUnit(s, c('nara'), side, 0, col);
      const ctx = new Ctx();
      resolveSide(s, ctx, side);
      const movers = ctx.events.filter((e) => e.type === 'move').map((e) => (e as { uid: number }).uid);
      expect(movers.slice(0, 2)).toEqual([top.uid, bottom.uid]);
    }
  });
});

describe('v0.16.0 — contas locais e ADM', () => {
  it('ADM / 12345 já existe e entra', () => {
    const st = loadAccounts();
    expect(st.accounts.adm.name).toBe(ADMIN_NAME);
    expect(login(st, 'adm', ADMIN_PASS).ok).toBe(true);
    expect(login(st, 'ADM', '1234').ok).toBe(false);
  });
  it('criar conta com nome e senha; nome repetido não; senha curta não; entrar e sair', () => {
    const st = loadAccounts();
    expect(createAccount(st, 'Jeff', '12').ok).toBe(false);
    expect(createAccount(st, '', 'abc').ok).toBe(false);
    expect(createAccount(st, 'Jeff', 'abc').ok).toBe(true);
    expect(createAccount(st, 'jeff', 'xyz').ok).toBe(false);
    expect(st.current).toBe('jeff');
    expect(JSON.stringify(store.get('kicdl-accounts-v1'))).not.toContain('abc');
    expect(st.accounts.jeff.hash).toBe(weakHash('abc'));
    logout(st);
    expect(loadAccounts().current).toBeNull();
    expect(login(st, 'JEFF', 'abc').ok).toBe(true);
    expect(loadAccounts().current).toBe('jeff');
  });
  it('cada conta guarda o próprio progresso (sem conta = chave antiga)', () => {
    expect(saveKeyFor(null)).toBe('kicdl-save-v1');
    expect(saveKeyFor('jeff')).toBe('kicdl-save-v1:jeff');
    const a = defaultSave(); a.essencias = 111;
    setSaveKey(saveKeyFor('jeff')); writeSave(a);
    const b = defaultSave(); b.essencias = 222;
    setSaveKey(saveKeyFor('ana')); writeSave(b);
    setSaveKey(saveKeyFor('jeff'));
    expect(loadSave().essencias).toBe(111);
    setSaveKey(saveKeyFor('ana'));
    expect(loadSave().essencias).toBe(222);
    setSaveKey(saveKeyFor(null));
    expect(loadSave().essencias).toBe(defaultSave().essencias);
  });
  it('perfil ADM: todos os personagens no topo (raridade máxima "++", v0.23.0), fases concluídas, Comandante no máximo', () => {
    const d = adminSave();
    for (const def of PLAYABLE) {
      const o = d.cards[def.id];
      expect(o.stars).toBe(def.maxStars);
      expect(o.plus).toBe(2);
    }
    // v0.17: baralho de 40 (máximo) = 10 personagens × 3 + feitiços
    expect(new Set(d.deck).size).toBe(d.deck.length);
    expect(d.deck.filter((id) => !id.startsWith('f-'))).toHaveLength(10);
    expect(d.deck.some((id) => id.startsWith('f-'))).toBe(true);
    expect(d.deck.reduce((n, id) => n + (d.copies?.[id] ?? 3), 0)).toBe(40);
    expect(d.cleared).toEqual(STAGES.map((s) => s.id));
    for (const l of LEADERS) expect(d.leaders![l.id].level).toBe(l.hpByLevel.length);
    setSaveKey(saveKeyFor('adm')); writeSave(d);
    expect(loadSave().cards.kenji).toMatchObject({ stars: getChar('kenji').maxStars, plus: 2 });
  });
});
