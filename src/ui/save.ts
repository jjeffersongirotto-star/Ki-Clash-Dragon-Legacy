import { CHAR_BY_ID, STARTER_IDS } from '../core/characters';
import { DECK_MIN, DECK_SLOTS, MAX_COPIES, deckMinFor, deckProblem, deckSize } from '../core/deck';
import { deckMaxFor, profileLevelFor } from '../core/deckbuild';
import { SPELLS, isSpell } from '../core/spells';
import type { CardInstance } from '../core/types';
import { DEFAULT_LEADER, LEADERS, reachableLevel } from '../core/leaders';
import { deckPower } from '../core/power';
import { LEGACY_ITEM_TO_ORB, MAX_STEP, XP_ITEMS, ascendCostFor, migrateBarV24, migrateOldCard, newOwned, stepOf, type OwnedCard, type XpItemId } from '../core/progression';
import { normalizeTower, type TowerState } from '../core/tower';
import { normalizeMissions, type MissionState } from '../core/missions';
import { addGear, charGear, gearKey, normalizeGear, stageGearIds, stageGearRarity, normalizeGearSeen, reqRarity, type GearBag, type GearSeen } from '../core/gear';
import { DIFFICULTIES, clearedIn, regionUnlocked, type DailyUse, type Difficulty } from '../core/adventure';
import { REGION_COUNT, WORLD_STAGE_COUNT } from '../core/world';
import { TUTORIAL_STARTER, TUT_BATTLE1, TUT_DONE } from '../core/tutorial';
import { convertOldXp, levelFromXp, newProfile, normalizeProfile, type ProfileState } from '../core/profile';
import { addDupe, dupeCount, takeDupe, type Dupes, type SpellBag } from '../core/banner';
import { compactCopies, normalizeCopies, ownedCopyCount, pickOf, pickStrongest, pickedCards, setPickCount, unpickWeakest } from '../core/copies';

export interface SaveData {
  version: 1;
  cards: Record<string, OwnedCard>;
  deck: string[];
  items: Record<XpItemId, number>;
  essencias: number;
  cleared: number[];
  speed: number;
  /** migração v0.7: equipe passou de 6 para 10 cartas */
  team10?: boolean;
  /** migração v0.8: personagens iniciais de Comum e equipe obrigatória de 10 */
  v8?: boolean;
  /** migração v0.10: estrelas viraram cores; toda carta antiga fica na cor BASE correspondente (sem "+") */
  v10?: boolean;
  /** v0.13: nível de cada Comandante (nunca diminui) */
  leaders?: Record<string, { level: number }>;
  /** v0.13: Comandante em uso (por enquanto só o Bárbaro) */
  activeLeader?: string;
  /** migração v0.13: saves antigos começam com o Comandante no nível 1 */
  v13?: boolean;
  /** v0.17.0: cópias de cada carta do baralho (1 a 3; sem valor = 3). O baralho (`deck`) aceita personagens e feitiços. */
  copies?: Record<string, number>;
  /** migração v0.17 */
  v17?: boolean;
  /** v0.20.0: fases vencidas no Normal e no Difícil (o Fácil é `cleared`) */
  clearedDiff?: { normal?: number[]; dificil?: number[] };
  /** v0.20.0: vezes usadas hoje em cada fase/dificuldade (limite diário) */
  daily?: DailyUse;
  /** v0.20.0: última dificuldade escolhida na Aventura */
  difficulty?: Difficulty;
  /** v0.21.0: ⭐ de cada fase por dificuldade ("dificuldade:fase" → bits dos 3 objetivos) */
  stars?: Record<string, number>;
  /** migração v0.23.0: o nível numerado acabou; cada carta virou raridade + degrau (0, "+", "++") + barra de XP */
  v23?: boolean;
  /** v0.24.0: itens de ascensão ("item:raridade" → quantidade). Saves antigos começam vazios. */
  gear?: GearBag;
  /** v0.69.0: itens (id + cor) já ganhos numa fase — só esses podem ser fundidos ou comprados na Loja */
  gearSeen?: GearSeen;
  /** migração v0.24.0: barras na proporção 3 / 6 / 10 (a fração de progresso de cada carta é mantida) */
  v24?: boolean;
  /** v0.25.0: etapa do tutorial (0 Batalha 1 · 1 pacote · 2 Batalha 2 · 3 concluído). Saves antigos: concluído. */
  tutorial?: number;
  /** migração v0.25.0 */
  v25?: boolean;
  /** v0.26.0: XP de perfil, energia e Ouro de Dragão */
  profile?: ProfileState;
  /** migração v0.26.0: saves antigos começam no nível de perfil que tinham (1 + fases vencidas), com energia cheia */
  v26?: boolean;
  /** v0.31.0: cartas compradas em cada banner desde a última Lendária/Mítica (garantia a cada 80) */
  bannerPity?: Record<string, number>;
  /** v0.32.0: cópias repetidas guardadas (personagem → raridade → quantidade); o personagem que você tem é a 1ª cópia */
  dupes?: Dupes;
  /** v0.32.0: XP do Desmanchar geral que ainda não fechou um Orbe inteiro */
  genXp?: number;
  /** migração v0.32.0: saves antigos ganham 3 cópias de cada personagem (o baralho não perde nada) */
  v32?: boolean;
  /** v0.33.0: 💠 Gemas de Invocação (1 gema = 1 carta do banner) */
  gems?: number;
  /** v0.39.0: região aberta por último no mapa do mundo (1 a 10) */
  region?: number;
  /** migração v0.39.0: progresso conferido para as 100 fases do mundo */
  v39?: boolean;
  /** v0.33.0: falta o passo guiado do Banner no fim do tutorial */
  tutBanner?: boolean;
  /** v0.43.0: foto de perfil = rosto de um personagem que o jogador tem (id); sem valor, o 1º personagem */
  avatar?: string;
  /** v0.43.0: nome mostrado no perfil (apelido); sem valor, o nome da conta ou "Jogador" */
  nick?: string;
  /** v0.41.0: cópias de cada feitiço que você tem (feitiço sem valor = ainda não obtido) */
  spells?: SpellBag;
  /** migração v0.41.0: os feitiços que já estavam no baralho viram cópias suas */
  v41?: boolean;
  /** v0.62.0: balanceamento v2.0 — cartas acima da nova raridade máxima já voltaram para o topo (com reembolso) */
  v62?: boolean;
  /** v0.63.0: trocas de raridade — cartas fora da nova faixa (mín.–máx.) já foram ajustadas */
  v63?: boolean;
  /** v0.67.0: revisão das 6 raças — cartas que trocaram de raridade (Shin, Sayuri, Zynna, Yume) já ajustadas */
  v67?: boolean;
  /** v0.68.0: curva de XP de perfil nova — XP convertido mantendo o nível */
  v68?: boolean;
  /** v0.69.0: cadeado dos itens — o que já estava na mochila foi liberado */
  v69?: boolean;
  /** v0.70.0: passo guiado do Comandante (evoluir pela primeira vez) já feito */
  tutLeader?: boolean;
  /** v0.70.0: Comandante com 30 níveis — nível antigo (de 10) convertido */
  v70?: boolean;
  /** v0.71.0: cópias usadas além da principal (cada uma com a sua cor, degrau e XP) — ver core/copies.ts */
  extra?: Record<string, OwnedCard[]>;
  /** v0.71.0: quais cópias de cada personagem estão no baralho (0 = principal, 1… = `extra`) */
  pick?: Record<string, number[]>;
  /** migração v0.71.0: as cópias que já estavam no baralho viraram cópias próprias, na cor da principal */
  v71?: boolean;
  /** v0.73.0: 🗼 Torre — maior andar vencido */
  tower?: TowerState;
  /** v0.73.0: 📜 missões diárias do dia (progresso e prêmios resgatados) */
  missions?: MissionState;
  /** v0.59.0: Heróis — raridades já obtidas de cada personagem (ver core/heroes.ts) */
  heroSeen?: Record<string, number[]>;
  /** v0.59.0: prêmios dos Heróis já resgatados */
  heroClaims?: string[];
}

/** Carta como era salva até a v0.22.0 (com nível numerado e `plus` verdadeiro/falso). */
type LegacyCard = { charId: string; level?: number; xp?: number; stars: number; plus?: number | boolean };

let KEY = 'kicdl-save-v1';
/** v0.16.0: cada conta local tem a sua chave de progresso (sem conta = 'kicdl-save-v1') */
export function setSaveKey(key: string) {
  KEY = key;
}
export const currentSaveKey = () => KEY;
/** o texto salvo na chave atual contém `needle`? (para migrações pontuais) */
export function rawSaveHas(needle: string): boolean {
  try {
    return (localStorage.getItem(KEY) ?? '').includes(needle);
  } catch {
    return false;
  }
}
/** Já existe progresso salvo na chave atual? */
export function hasSave(): boolean {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return false;
  }
}
/** v0.8–v0.16: a equipe tinha exatamente 10 cartas; continua sendo o tamanho da equipe inicial */
export const DECK_MAX = DECK_SLOTS;
export const DECK_REQUIRED = DECK_SLOTS;
export { DECK_MIN, MAX_COPIES };
/** v0.8–v0.24: personagens de Comum que todo jogador recebia (hoje só nas migrações de saves antigos) */
export const STARTERS = STARTER_IDS;

/** v0.22.0: as 6 raridades de Orbe sempre presentes (0 quando não tem) */
export const emptyOrbs = (bag: Partial<Record<XpItemId, number>> = {}): Record<XpItemId, number> =>
  Object.fromEntries(XP_ITEMS.map((o) => [o.id, bag[o.id] ?? 0])) as Record<XpItemId, number>;

/** v0.22.0: 📜 Pergaminho → Orbe Comum, 💎 Cristal → Orbe Raro, 🔮 antigo → Orbe Lendário (o XP não muda); valores inválidos viram 0. */
export function migrateOrbs(items: Record<string, unknown> | undefined): Record<XpItemId, number> {
  const out = emptyOrbs();
  const n = (v: unknown) => (Number.isFinite(v as number) && (v as number) > 0 ? Math.floor(v as number) : 0);
  for (const [k, v] of Object.entries(items && typeof items === 'object' ? items : {})) {
    const id = (LEGACY_ITEM_TO_ORB[k] ?? k) as XpItemId;
    if (id in out) out[id] += n(v);
  }
  return out;
}

/**
 * v0.25.0: o jogador novo começa no tutorial, só com o Riku e sem Orbes nem Essências (os Orbes do começo de antes
 * — 10 Comuns e 3 Raros — e as Essências vêm na recompensa do tutorial).
 */
export function defaultSave(): SaveData {
  return {
    version: 1,
    cards: { [TUTORIAL_STARTER]: newOwned(TUTORIAL_STARTER) },
    deck: [TUTORIAL_STARTER],
    items: emptyOrbs(),
    essencias: 0,
    cleared: [],
    speed: 1,
    team10: true,
    v8: true,
    v10: true,
    leaders: defaultLeaders(),
    activeLeader: DEFAULT_LEADER,
    v13: true,
    copies: {},
    v17: true,
    v23: true,
    v24: true,
    v25: true,
    v26: true,
    v32: true,
    v41: true,
    v62: true,
    v63: true,
    v67: true,
    v68: true,
    v69: true,
    v70: true,
    v71: true,
    extra: {},
    pick: {},
    gearSeen: [],
    spells: {},
    gems: 0,
    dupes: {},
    genXp: 0,
    profile: newProfile(),
    tutorial: TUT_BATTLE1,
    gear: {},
    clearedDiff: { normal: [], dificil: [] },
    difficulty: 'facil',
  };
}

// ---------- v0.17.0: baralho com cópias e feitiços ----------

/** v0.26.0: nível de perfil de verdade (pelo XP de perfil, 1 a 100). Até a v0.25.0 era 1 + fases vencidas. */
export const profileLevel = (d: SaveData) => levelFromXp(d.profile?.xp ?? 0);
/** tamanho máximo do baralho para o nível de perfil */
export const deckMax = (d: SaveData) => deckMaxFor(profileLevel(d));
/** v0.41.0: cópias que você tem do feitiço (0 = ainda não obtido) */
export const spellCopies = (d: SaveData, id: string) => Math.max(0, Math.floor(d.spells?.[id] ?? 0));
/** a carta (personagem ou, v0.41.0, feitiço que você tem) pode estar no baralho? */
export const usable = (d: SaveData, id: string) => (isSpell(id) ? spellCopies(d, id) > 0 : !!CHAR_BY_ID[id] && !!d.cards[id]);
/** v0.32.0: quantas cópias da carta o baralho pode ter: até 3, mas só as que você tem (v0.41.0: feitiços também). */
export const maxCopiesFor = (d: SaveData, id: string) => Math.max(1, Math.min(MAX_COPIES, ownedCopies(d, id)));
/** cópias da carta no baralho (v0.71.0: personagem = as cópias escolhidas, cada uma com a sua cor) */
export const copiesIn = (d: SaveData, id: string) =>
  isSpell(id) ? Math.max(1, Math.min(maxCopiesFor(d, id), Math.floor(d.copies?.[id] ?? MAX_COPIES))) : Math.max(1, pickOf(d, id).length);
/** v0.32.0: cópias que você tem da carta (0 se não tem; v0.41.0: feitiços também; v0.71.0: usadas + guardadas) */
export function ownedCopies(d: SaveData, id: string): number {
  return isSpell(id) ? spellCopies(d, id) : ownedCopyCount(d, id);
}
/** v0.71.0: as cópias do personagem que estão no baralho (da mais forte para a mais fraca) */
export const deckCopies = (d: SaveData, id: string): OwnedCard[] =>
  pickedCards(d, id).slice().sort((a, b) => b.stars - a.stars || stepOf(b) - stepOf(a));
/** as entradas do baralho prontas para a batalha (v0.71.0: personagem com a cor de cada cópia em `variants`) */
export function deckCards(d: SaveData): CardInstance[] {
  return d.deck
    .filter((id, i, a) => usable(d, id) && a.indexOf(id) === i)
    .map((id) => {
      if (isSpell(id)) return { charId: id, stars: 1, copies: copiesIn(d, id) };
      const cs = deckCopies(d, id);
      const variants = cs.map((c) => ({ stars: c.stars, plus: stepOf(c) }));
      const same = variants.every((v) => v.stars === variants[0].stars && v.plus === variants[0].plus);
      return { charId: id, stars: cs[0].stars, plus: stepOf(cs[0]), copies: cs.length, ...(same ? {} : { variants }) };
    });
}
/** v0.71.0: todas as cópias de personagem do baralho (para o Poder) */
export const deckOwnedCopies = (d: SaveData): OwnedCard[] =>
  d.deck.filter((id, i, a) => !isSpell(id) && d.cards[id] && a.indexOf(id) === i).flatMap((id) => pickedCards(d, id));
export const deckCount = (d: SaveData) => deckSize(deckCards(d));
/**
 * v0.25.0: mínimo do baralho = 3 × personagens que o jogador tem (até 20).
 * v0.32.0: conta as cópias que dá para usar (até 3 de cada personagem), ainda limitado a 20.
 */
export const deckMin = (d: SaveData) =>
  Math.min(
    deckMinFor(Object.keys(d.cards).filter((id) => CHAR_BY_ID[id] && !CHAR_BY_ID[id].summonOnly).length),
    Math.max(1, Object.keys(d.cards).filter((id) => CHAR_BY_ID[id] && !CHAR_BY_ID[id].summonOnly).reduce((n, id) => n + maxCopiesFor(d, id), 0)),
  );
/** motivo de o baralho não valer (null = pode lutar) */
export const deckIssue = (d: SaveData) => deckProblem(deckCards(d), deckMax(d), deckMin(d));

/** Coloca a carta no baralho com o máximo de cópias que couber (até 3). Retorna quantas entraram (0 = não coube). */
export function addToDeck(d: SaveData, id: string): number {
  if (!usable(d, id) || d.deck.includes(id)) return 0;
  const room = deckMax(d) - deckCount(d);
  const n = Math.min(maxCopiesFor(d, id), room);
  if (n < 1) return 0;
  d.deck.push(id);
  if (isSpell(id)) (d.copies ??= {})[id] = n;
  else pickStrongest(d, id, n);
  return n;
}
export function removeFromDeck(d: SaveData, id: string) {
  d.deck = d.deck.filter((x) => x !== id);
  if (d.copies) delete d.copies[id];
  if (d.pick?.[id]) {
    delete d.pick[id];
    compactCopies(d, id);
  }
}
/** muda as cópias (1–3) respeitando o máximo do baralho; retorna o valor final (personagem: entram as mais fortes de fora) */
export function setCopies(d: SaveData, id: string, n: number): number {
  const cur = copiesIn(d, id);
  const room = deckMax(d) - deckCount(d) + cur;
  const v = Math.max(1, Math.min(maxCopiesFor(d, id), Math.floor(n), room));
  if (!isSpell(id)) return setPickCount(d, id, v);
  (d.copies ??= {})[id] = v;
  return v;
}

/**
 * Migração v0.17 (sempre normaliza): tira entradas inválidas/repetidas, garante cópias 1–3 e,
 * se o baralho passar do máximo do nível de perfil, tira cópias das últimas entradas (sem apagar a carta;
 * se chegar a 1 cópia e ainda passar, a entrada sai).
 */
export function migrateV17(d: SaveData): SaveData {
  d.copies = d.copies && typeof d.copies === 'object' ? d.copies : {};
  d.deck = d.deck.filter((id, i, a) => usable(d, id) && a.indexOf(id) === i);
  for (const k of Object.keys(d.copies)) if (!d.deck.includes(k) || !isSpell(k)) delete d.copies[k];
  for (const k of Object.keys(d.pick ?? {})) if (!d.deck.includes(k)) removeFromDeck(d, k);
  for (const id of d.deck) if (isSpell(id)) d.copies[id] = copiesIn(d, id);
  const max = deckMax(d);
  for (let i = d.deck.length - 1; i >= 0 && deckCount(d) > max; i--) {
    const id = d.deck[i];
    if (isSpell(id)) while (deckCount(d) > max && d.copies[id] > 1) d.copies[id]--;
    else while (deckCount(d) > max && unpickWeakest(d, id));
    if (deckCount(d) > max) removeFromDeck(d, id);
  }
  d.v17 = true;
  return d;
}

export function defaultLeaders(): Record<string, { level: number }> {
  return Object.fromEntries(LEADERS.map((l) => [l.id, { level: 1 }]));
}

/**
 * Migração para a v0.13 (uma única vez): todo save antigo ganha os Comandantes no nível 1
 * (o Bárbaro ativo). Níveis que já existam e sejam válidos são mantidos.
 */
export function migrateV13(d: SaveData): SaveData {
  const cur = d.leaders && typeof d.leaders === 'object' ? d.leaders : {};
  const out = defaultLeaders();
  for (const id of Object.keys(out)) {
    const lv = Math.floor(Number(cur[id]?.level));
    if (lv >= 1) out[id].level = Math.min(lv, LEADERS.find((l) => l.id === id)!.hpByLevel.length);
  }
  d.leaders = out;
  if (!LEADERS.some((l) => l.id === d.activeLeader && l.available)) d.activeLeader = DEFAULT_LEADER;
  d.v13 = true;
  return d;
}

/**
 * Migração para a v0.8 (uma única vez):
 * - mantém todos os personagens que o jogador já tinha (inclusive Kenji e Vorax, se já obtidos);
 * - dá os novos personagens iniciais de Comum (todo jogador começa com eles);
 * - completa a equipe até 10 (primeiro com os seus mais fortes, depois com os de Comum).
 */
export function migrateV8(d: SaveData): SaveData {
  for (const id of STARTERS) if (!d.cards[id]) d.cards[id] = newOwned(id);
  d.deck = d.deck.filter((id, i, a) => CHAR_BY_ID[id] && d.cards[id] && a.indexOf(id) === i).slice(0, DECK_MAX);
  fillTeam(d);
  d.team10 = true;
  d.v8 = true;
  return d;
}

/**
 * Migração para a v0.10 (uma única vez): a quantidade de estrelas vira a cor de mesmo número
 * (1★ Comum, 2★ Incomum, 3★ Raro, 4★ Épico, 5★ Lendário, 6★ Mítico), sempre na cor BASE (sem "+").
 * Nível e XP ficam como estavam (o nível máximo da cor base é o mesmo de antes: 10 × cor).
 */
export function migrateV10(d: SaveData): SaveData {
  for (const c of Object.values(d.cards) as unknown as LegacyCard[]) {
    c.plus = false;
    if (typeof c.level === 'number' && c.level > c.stars * 10) c.level = c.stars * 10;
  }
  d.v10 = true;
  return d;
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const d = JSON.parse(raw) as SaveData;
    if (d.version !== 1) return defaultSave();
    const merged: SaveData = { ...defaultSave(), ...d };
    // remove ids que não existem mais
    for (const id of Object.keys(merged.cards)) if (!CHAR_BY_ID[id]) delete merged.cards[id];
    if (!d.v8) migrateV8(merged);
    if (!d.v10) migrateV10(merged);
    if (!d.v62) migrateV62(merged, d); // antes da conversão das cartas, que corta a raridade sem devolver nada
    if (!d.v63) migrateV63(merged, d);
    if (!d.v67) {
      migrateV63(merged, d); // mesma regra: quem ficou abaixo da nova mínima sobe; quem passou do novo topo volta com reembolso
      merged.v67 = true;
    }
    merged.v23 = !!d.v23; // o padrão (defaultSave) já vem convertido; vale o que estava salvo
    merged.v24 = !!d.v24;
    migrateV23(merged);
    // sempre normaliza os Comandantes (save antigo sem o campo, ou campo corrompido)
    migrateV13(merged);
    migrateV26(merged, d); // antes do baralho: o tamanho máximo vem do nível de perfil
    migrateV68(merged, d);
    migrateV32(merged, d); // antes do baralho: as cópias que você tem limitam o baralho
    migrateV41(merged, d); // idem para os feitiços
    migrateV71(merged, d); // v0.71.0: cópias próprias (antes de conferir o baralho)
    migrateV17(merged);
    migrateV70(merged, d); // depois do baralho: o nível novo depende do Poder do baralho
    normalizeV20(merged);
    migrateV39(merged);
    merged.items = migrateOrbs(d.items as Record<string, unknown>);
    merged.gear = normalizeGear(d.gear); // v0.24.0: save sem itens de ascensão começa com a mochila vazia
    // v0.69.0: cadeado dos itens; save antigo libera o que já tem na mochila
    merged.gearSeen = normalizeGearSeen(d.gearSeen);
    if (!d.v69) {
      const seen = new Set(merged.gearSeen);
      for (const [k, n] of Object.entries(merged.gear)) if (n > 0) seen.add(k);
      // fases já vencidas: a cor comum dos itens delas (na tabela nova) também fica liberada
      const done: [Difficulty, number[]][] = [['facil', merged.cleared], ['normal', merged.clearedDiff?.normal ?? []], ['dificil', merged.clearedDiff?.dificil ?? []]];
      for (const [diff, ids] of done) for (const st of ids) for (const id of stageGearIds(st)) seen.add(gearKey(id, stageGearRarity(st, diff)[0]));
      merged.gearSeen = [...seen];
    }
    merged.v69 = true;
    migrateV25(merged, d);
    merged.gems = Math.max(0, Math.floor(Number(d.gems) || 0)); // v0.33.0
    merged.tower = normalizeTower(d.tower); // v0.73.0
    merged.missions = normalizeMissions(d.missions);
    return merged;
  } catch {
    return defaultSave();
  }
}

/**
 * v0.23.0: o nível numerado acabou. Cada carta fica na MESMA raridade e no mesmo degrau (o "+" antigo vira "+"),
 * com a barra de XP do degrau cheia na mesma proporção do progresso que ela tinha. Nenhum personagem se perde.
 * Saves já convertidos só são conferidos (degrau 0–2, XP dentro da barra).
 */
/**
 * v0.62.0 — balanceamento v2.0: 7 cartas que nascem Comuns passaram a ir só até Raro (Taro, Hana, Nara, Pip, Suri,
 * Daichi, Sora). Quem tinha alguma acima disso volta para o topo novo (Raro++) e recebe de volta as Essências e os
 * itens de ascensão de cada Despertar feito acima do topo. Cópias repetidas acima do topo viram cópias do topo.
 */
export function migrateV62(merged: SaveData, raw: Partial<SaveData>): SaveData {
  capAboveMax(merged, raw);
  merged.v62 = true;
  return merged;
}

/**
 * v0.63.0 — trocas de raridade: quem passou a nascer numa raridade acima sobe de graça para a nova raridade mínima
 * (degrau base); quem passou a ir só até uma raridade abaixo volta para o topo novo com reembolso (igual à v0.62.0).
 * Cópias repetidas fora da faixa viram cópias da raridade mais próxima dentro dela.
 */
export function migrateV63(merged: SaveData, raw: Partial<SaveData>): SaveData {
  capAboveMax(merged, raw);
  for (const [id, c] of Object.entries(merged.cards)) {
    const def = CHAR_BY_ID[id];
    if (def && Number.isFinite(c.stars) && c.stars < def.minStars) merged.cards[id] = { ...c, stars: def.minStars, plus: 0, xp: 0 };
  }
  for (const [id, row] of Object.entries(merged.dupes ?? {})) {
    const def = CHAR_BY_ID[id];
    if (!def) continue;
    for (const k of Object.keys(row)) {
      const r = Number(k);
      if (r < def.minStars && row[r] > 0) {
        addDupe(merged.dupes!, id, def.minStars, row[r]);
        delete row[r];
      }
    }
  }
  merged.v63 = true;
  return merged;
}

/** Volta para o topo (máx.++) quem está acima da raridade máxima, devolvendo Essências e itens de cada Despertar. */
function capAboveMax(merged: SaveData, raw: Partial<SaveData>): void {
  const gear: GearBag = normalizeGear(raw.gear);
  let essencias = 0;
  for (const [id, c] of Object.entries(merged.cards)) {
    const def = CHAR_BY_ID[id];
    if (!def || !Number.isFinite(c.stars) || c.stars <= def.maxStars) continue;
    // cada Despertar feito a partir do topo novo (máx.++) até onde a carta estava
    let st = def.maxStars;
    let step = MAX_STEP;
    const target = Math.min(6, Math.floor(c.stars)) * 10 + stepOf(c);
    while (st * 10 + step < target) {
      essencias += ascendCostFor(st, step);
      const g = charGear(id);
      const reqs = step === 0 ? g.plus : step === 1 ? g.plus2 : g.awaken;
      for (const r of reqs) addGear(gear, r.id, reqRarity(r, st));
      if (step < MAX_STEP) step++;
      else {
        st++;
        step = 0;
      }
    }
    merged.cards[id] = { ...c, stars: def.maxStars, plus: MAX_STEP, xp: 0 };
  }
  for (const [id, row] of Object.entries(merged.dupes ?? {})) {
    const def = CHAR_BY_ID[id];
    if (!def) continue;
    for (const k of Object.keys(row)) {
      const r = Number(k);
      if (r > def.maxStars && row[r] > 0) {
        addDupe(merged.dupes!, id, def.maxStars, row[r]);
        delete row[r];
      }
    }
  }
  if (essencias > 0) {
    merged.essencias = (merged.essencias ?? 0) + essencias;
    raw.gear = gear;
  }
}

export function migrateV23(d: SaveData): SaveData {
  for (const [id, c] of Object.entries(d.cards)) {
    const old = c as unknown as LegacyCard;
    const charId = old.charId ?? id;
    if (!d.v23) d.cards[id] = migrateOldCard({ ...old, charId });
    else if (!d.v24) d.cards[id] = migrateBarV24({ ...migrateOldCard({ charId, stars: old.stars, plus: old.plus, xp: 0 }), xp: Math.max(0, Math.floor(old.xp ?? 0)) });
    else d.cards[id] = migrateOldCard({ charId, stars: old.stars, plus: old.plus, xp: old.xp });
  }
  d.v23 = true;
  d.v24 = true;
  return d;
}

/**
 * v0.25.0: saves de antes do tutorial já jogaram — pulam o tutorial e ficam com tudo o que tinham.
 * Saves novos só têm a etapa conferida (0 a 3).
 */
export function migrateV25(merged: SaveData, raw: Partial<SaveData>): SaveData {
  const t = Math.floor(Number(raw.tutorial));
  merged.tutorial = raw.v25 && t >= TUT_BATTLE1 && t <= TUT_DONE ? t : TUT_DONE;
  merged.v25 = true;
  return merged;
}
/**
 * v0.26.0: o nível de perfil passa a vir do XP de perfil. Save antigo ganha o XP do nível que tinha
 * (1 + fases vencidas no Fácil, até 11), a energia cheia desse nível e 0 de Ouro — o baralho não perde espaço.
 */
export function migrateV26(merged: SaveData, raw: Partial<SaveData>, now = Date.now()): SaveData {
  merged.profile = raw.v26 ? normalizeProfile(raw.profile, 1, now) : normalizeProfile(undefined, profileLevelFor(merged.cleared.length), now);
  merged.v26 = true;
  return merged;
}

/** v0.68.0: curva de XP de perfil nova — o XP salvo é convertido para continuar no mesmo nível (e na mesma fração da barra). */
export function migrateV68(merged: SaveData, raw: Partial<SaveData>): SaveData {
  if (!raw.v68 && raw.v26 && merged.profile) merged.profile.xp = convertOldXp(merged.profile.xp);
  merged.v68 = true;
  return merged;
}

/** Vida do Comandante nos 10 níveis de antes da v0.70.0. */
const LEADER_HP_V62 = [20, 26, 32, 38, 44, 48, 52, 56, 60, 64];
/**
 * v0.70.0: o Comandante passa de 10 para 30 níveis. O nível novo é o que o Poder do baralho atual alcança nos requisitos
 * novos, sem passar da vida que ele já tinha (nível 1 continua 1).
 */
export function migrateV70(merged: SaveData, raw: Partial<SaveData>): SaveData {
  if (!raw.v70 && merged.leaders) {
    const power = deckPower(deckCards(merged).filter((c) => !isSpell(c.charId)));
    for (const [id, st] of Object.entries(merged.leaders)) {
      const def = LEADERS.find((l) => l.id === id);
      if (!def || st.level <= 1) continue;
      const oldHp = LEADER_HP_V62[Math.min(LEADER_HP_V62.length, st.level) - 1];
      let byHp = 1;
      while (byHp < def.hpByLevel.length && def.hpByLevel[byHp] <= oldHp) byHp++;
      st.level = Math.max(1, Math.min(byHp, reachableLevel(def, 1, power)));
    }
  }
  merged.v70 = true;
  return merged;
}

/** Confere as cópias guardadas (personagem válido que você tem, raridade 1–6, quantidade inteira > 0). */
export function normalizeDupes(v: unknown, cards: Record<string, OwnedCard>): Dupes {
  const out: Dupes = {};
  if (!v || typeof v !== 'object') return out;
  for (const [id, row] of Object.entries(v as Record<string, unknown>)) {
    if (!CHAR_BY_ID[id] || !cards[id] || !row || typeof row !== 'object') continue;
    for (const [r, k] of Object.entries(row as Record<string, unknown>)) {
      const stars = Math.floor(Number(r));
      const n = Math.floor(Number(k));
      if (stars >= 1 && stars <= 6 && n > 0) addDupe(out, id, stars, n);
    }
  }
  return out;
}

/**
 * v0.32.0: ganhar um personagem dá 1 cópia; o baralho só usa as cópias que você tem (até 3).
 * Save antigo: cada personagem que você já tinha ganha +2 cópias guardadas (3 no total, na raridade inicial dele),
 * para ninguém perder espaço no baralho.
 */
export function migrateV32(merged: SaveData, raw: Partial<SaveData>): SaveData {
  merged.dupes = normalizeDupes(raw.dupes, merged.cards);
  if (!raw.v32)
    for (const id of Object.keys(merged.cards)) {
      const def = CHAR_BY_ID[id];
      if (def && !def.summonOnly && dupeCount(merged.dupes, id) < MAX_COPIES - 1) addDupe(merged.dupes, id, def.minStars, MAX_COPIES - 1 - dupeCount(merged.dupes, id));
    }
  merged.genXp = Math.max(0, Math.floor(Number(raw.genXp) || 0));
  merged.v32 = true;
  return merged;
}

/** raridade válida para o personagem (dentro da faixa mínima–máxima dele) */
const clampStars = (id: string, st: number) => {
  const def = CHAR_BY_ID[id];
  return Math.max(def.minStars, Math.min(def.maxStars, Number.isFinite(st) ? st : def.minStars));
};
/**
 * v0.71.0 — cada cópia é uma carta própria. Save antigo: as cópias que o baralho usava (todas na cor da carta)
 * viram cópias próprias NA COR, DEGRAU E XP DA PRINCIPAL (ninguém perde força); cada uma gasta uma cópia guardada.
 * As cópias guardadas que sobram continuam guardadas (com a raridade delas).
 */
export function migrateV71(merged: SaveData, raw: Partial<SaveData>): SaveData {
  merged.extra = raw.extra as SaveData['extra'];
  merged.pick = raw.pick as SaveData['pick'];
  normalizeCopies(merged, clampStars);
  // cópia tirada da caixa e nunca treinada nem posta no baralho volta a ser guardada (pode ser desmanchada)
  for (const id of Object.keys(merged.extra ?? {})) compactCopies(merged, id);
  if (!raw.v71) {
    merged.extra = {};
    merged.pick = {};
    const ids = merged.deck.filter((id, i, a) => !isSpell(id) && CHAR_BY_ID[id] && merged.cards[id] && a.indexOf(id) === i);
    for (const id of ids) {
      const main = merged.cards[id];
      const want = Math.max(1, Math.min(MAX_COPIES, Math.floor(Number(raw.copies?.[id] ?? MAX_COPIES)) || MAX_COPIES));
      const pick = [0];
      while (pick.length < want) {
        const row = merged.dupes?.[id];
        const r = row ? Math.max(...Object.keys(row).map(Number).filter((k) => row[k] > 0)) : NaN;
        if (!Number.isFinite(r) || !takeDupe(merged.dupes!, id, r)) break;
        ((merged.extra[id] ??= [])).push({ charId: id, stars: main.stars, plus: stepOf(main), xp: main.xp });
        pick.push(merged.extra[id].length);
      }
      merged.pick[id] = pick;
    }
  }
  merged.v71 = true;
  return merged;
}

/** Confere as cópias de feitiço (feitiço que existe, quantidade inteira > 0). */
export function normalizeSpells(v: unknown): SpellBag {
  const out: SpellBag = {};
  if (!v || typeof v !== 'object') return out;
  for (const [id, k] of Object.entries(v as Record<string, unknown>)) {
    const n = Math.floor(Number(k));
    if (isSpell(id) && n > 0) out[id] = n;
  }
  return out;
}

/**
 * v0.41.0: os feitiços viraram cartas colecionáveis. Save antigo fica com os feitiços que estavam no baralho
 * (com as cópias que o baralho usava, até 3), para ninguém perder nada; os outros passam a vir do Banner e das fases.
 */
export function migrateV41(merged: SaveData, raw: Partial<SaveData>): SaveData {
  merged.spells = normalizeSpells(raw.spells);
  if (!raw.v41)
    for (const id of Array.isArray(raw.deck) ? raw.deck : []) {
      if (!isSpell(id)) continue;
      const n = Math.max(1, Math.min(MAX_COPIES, Math.floor(Number(raw.copies?.[id] ?? MAX_COPIES)) || MAX_COPIES));
      merged.spells[id] = Math.max(merged.spells[id] ?? 0, n);
    }
  merged.v41 = true;
  return merged;
}

/** v0.41.0: todos os feitiços com `n` cópias (conta ADM). */
export const allSpells = (n: number): SpellBag => Object.fromEntries(SPELLS.map((s) => [s.id, n]));

/**
 * v0.39.0 — mapa do mundo com 100 fases. As fases 1–10 continuam sendo as mesmas (região 1): o progresso, as ⭐ e o
 * limite do dia de antes valem como estavam. A conversão só confere as listas (números de 1 a 100, sem repetir, em
 * ordem), tira estrelas de fases que não existem e abre o mapa na última região liberada no Fácil.
 */
export function migrateV39(d: SaveData): SaveData {
  const ok = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 1 && (v as number) <= WORLD_STAGE_COUNT;
  const clean = (v: unknown) => [...new Set(Array.isArray(v) ? v.filter(ok) : [])].sort((a, b) => a - b);
  d.cleared = clean(d.cleared);
  d.clearedDiff = { normal: clean(d.clearedDiff?.normal), dificil: clean(d.clearedDiff?.dificil) };
  if (d.stars) for (const k of Object.keys(d.stars)) if (!ok(Number(k.split(':')[1]))) delete d.stars[k];
  if (!Number.isInteger(d.region) || d.region! < 1 || d.region! > REGION_COUNT || !regionUnlocked(d, 'facil', d.region!)) {
    d.region = Math.max(...Array.from({ length: REGION_COUNT }, (_, k) => k + 1).filter((r) => regionUnlocked(d, 'facil', r)));
  }
  d.v39 = true;
  return d;
}

export const tutorialDone = (d: SaveData) => (d.tutorial ?? TUT_DONE) >= TUT_DONE;

/** v0.20.0: garante os campos da Aventura (dificuldade, progresso por dificuldade, limite diário) bem formados. */
export function normalizeV20(d: SaveData): SaveData {
  const ids = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is number => Number.isInteger(x) && x >= 1) : []);
  const cd = d.clearedDiff && typeof d.clearedDiff === 'object' ? d.clearedDiff : {};
  d.clearedDiff = { normal: ids(cd.normal), dificil: ids(cd.dificil) };
  if (!d.daily || typeof d.daily.day !== 'string' || typeof d.daily.used !== 'object' || !d.daily.used) d.daily = undefined;
  if (!DIFFICULTIES.includes(d.difficulty as Difficulty)) d.difficulty = 'facil';
  // v0.21.0: estrelas. Fase vencida antes desta versão começa com 1 ⭐ (a de vencer); as outras são conquistadas jogando.
  const st: Record<string, number> = {};
  for (const [k, v] of Object.entries(d.stars && typeof d.stars === 'object' ? d.stars : {})) if (Number.isInteger(v) && v > 0 && v < 8) st[k] = v;
  for (const diff of DIFFICULTIES) for (const id of clearedIn(d, diff)) st[`${diff}:${id}`] = (st[`${diff}:${id}`] ?? 0) | 1;
  d.stars = st;
  return d;
}

export function writeSave(d: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* armazenamento indisponível */
  }
}

export function resetSave(): SaveData {
  localStorage.removeItem(KEY);
  return defaultSave();
}

/** Completa a equipe até 10 personagens com os possuídos que estão fora dela (mais fortes primeiro). */
export function fillTeam(d: SaveData) {
  const rest = Object.values(d.cards)
    .filter((c) => !d.deck.includes(c.charId))
    .sort((a, b) => b.stars - a.stars || stepOf(b) - stepOf(a) || b.xp - a.xp);
  for (const c of rest) if (d.deck.filter((x) => !isSpell(x)).length < DECK_MAX) d.deck.push(c.charId);
}

/** Baralho pronto para lutar? (v0.17: de 20 ao máximo do nível, cópias 1–3, ao menos 1 personagem) */
export function teamReady(d: SaveData): boolean {
  return deckIssue(d) === null;
}
