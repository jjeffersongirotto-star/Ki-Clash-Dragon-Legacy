/**
 * Estado do app: conta e save abertos, Comandante, perfil, energia e Ouro de Dragão.
 * v0.28.1: separado do main.ts (organização do código, sem mudar o jogo).
 */
import { getChar } from '../core/characters';
import { STAGES } from '../core/campaign';
import { deckPower } from '../core/power';
import { getLeader } from '../core/leaders';
import { energyHTML, gemHTML, goldHTML } from '../ui/components';
import { getSpell, isSpell } from '../core/spells';
import { gameAlert } from '../ui/dialog';
import { rawSaveHas, deckMax, hasSave, loadSave, setSaveKey, writeSave, type SaveData } from '../ui/save';
import type { Difficulty } from '../core/adventure';
import { FIRST_WIN_MULT, PROFILE_MAX, addProfileXp, energyMax, goldFor, msToNextEnergy, profileXpFor, tickEnergy, totalXpFor, newProfile, type ProfileState } from '../core/profile';
import { adminSave, loadAccounts, saveKeyFor } from '../ui/accounts';

export const app = document.getElementById('app')!;
// v0.16.0: contas locais — cada conta tem o seu progresso neste aparelho
export const accounts = loadAccounts();
export function openAccountSave(): SaveData {
  const id = accounts.current;
  setSaveKey(saveKeyFor(id));
  if (id && accounts.accounts[id]?.admin && !hasSave()) writeSave(adminSave());
  // v0.17.0: a ADM que já existia ganha uma vez o baralho de 40 com feitiços
  if (id && accounts.accounts[id]?.admin && !rawSaveHas('"v17":true')) {
    const d = loadSave();
    const a = adminSave();
    d.deck = a.deck;
    d.copies = a.copies;
    writeSave(d);
    return d;
  }
  const d = loadSave();
  // v0.20.0: a ADM tem todas as fases vencidas em todas as dificuldades
  if (id && accounts.accounts[id]?.admin && (!d.clearedDiff?.dificil?.length || Object.values(d.stars ?? {}).some((v) => v !== 7))) {
    const a = adminSave();
    d.clearedDiff = a.clearedDiff;
    d.stars = a.stars; // v0.21.0: ADM com 3 ⭐ em tudo
    writeSave(d);
  }
  // v0.23.0: a ADM tem todos os personagens no topo (raridade máxima "++")
  if (id && accounts.accounts[id]?.admin && Object.values(adminSave().cards).some((c) => d.cards[c.charId]?.stars !== c.stars || d.cards[c.charId]?.plus !== c.plus)) {
    d.cards = { ...d.cards, ...adminSave().cards };
    writeSave(d);
  }
  // v0.26.0: a ADM tem o perfil no nível 100, muita energia e muito Ouro de Dragão
  if (id && accounts.accounts[id]?.admin && (d.profile?.xp ?? 0) < totalXpFor(PROFILE_MAX)) {
    d.profile = adminSave().profile;
    writeSave(d);
  }
  // v0.32.0: a ADM ganha uma vez 9 cópias guardadas de cada personagem (para testar o Desmanchar)
  if (id && accounts.accounts[id]?.admin && !rawSaveHas('"admDupes32":true')) {
    d.dupes = adminSave().dupes;
    (d as SaveData & { admDupes32?: boolean }).admDupes32 = true;
    writeSave(d);
  }
  return d;
}
export let save: SaveData = openAccountSave();
/** troca o save aberto (ao entrar/sair de uma conta) */
export const setSave = (d: SaveData) => (save = d);
export const firstChar = () => save.deck.find((id) => !isSpell(id) && save.cards[id]) ?? Object.keys(save.cards)[0];
export let trainSel: string = firstChar();
export const setTrainSel = (id: string) => (trainSel = id);

export const persist = () => writeSave(save);
export const unlockStage = (charId: string) => STAGES.find((s) => s.pack.includes(charId))?.id;

// ---------------- v0.13: PODER e COMANDANTE ----------------
/** v0.17: o Poder do baralho soma cada personagem uma vez (cópias e feitiços não contam) */
export const teamCards = () => save.deck.filter((id) => !isSpell(id) && save.cards[id]).map((id) => save.cards[id]);
export const entryName = (id: string) => (isSpell(id) ? `${getSpell(id).icon} ${getSpell(id).name}` : getChar(id).name);
/** Poder do baralho = soma do Poder das cartas da equipe */
export const teamPower = () => deckPower(teamCards());
export const activeLeader = () => getLeader(save.activeLeader);
export const leaderLevel = () => Math.max(1, save.leaders?.[activeLeader().id]?.level ?? 1);
export const fmt = (n: number) => n.toLocaleString('pt-BR');

// ---------------- v0.26.0: PERFIL, ENERGIA e OURO DE DRAGÃO ----------------
export const prof = (): ProfileState => (save.profile ??= newProfile());
/** energia atual (já com a recuperação do tempo que passou) */
export const energyNow = () => tickEnergy(prof()).energy;
export const resPills = () => `<span class="res-energy">${energyHTML(energyNow(), energyMax(prof()))}</span><span>${goldHTML(fmt(prof().gold))}</span>${save.gems ? `<span>${gemHTML(fmt(save.gems))}</span>` : ''}`;
/** "4 min 12 s" até a próxima energia */
export function nextEnergyText(): string {
  const ms = msToNextEnergy(prof());
  const m = Math.floor(ms / 60000);
  const sec = Math.ceil((ms % 60000) / 1000);
  return m ? `${m} min ${sec} s` : `${sec} s`;
}
/** Aviso de nível de perfil novo (energia ganha e baralho maior). */
export function levelNote(r: { levels: number; energy: number; level: number }, deckBefore: number): string {
  if (!r.levels) return '';
  const grew = deckMax(save) > deckBefore;
  return `<p class="hint">⬆ Nível de perfil <b>${r.level}</b>! +${r.energy} ⚡ de energia${grew ? ` · o baralho agora aceita até <b>${deckMax(save)}</b> cartas` : ''}.</p>`;
}
/** XP de perfil e Ouro de uma vitória ou Repetir (em dobro na primeira vitória). */
export function grantProfileAndGold(stageId: number, diff: Difficulty, first = false): string {
  const mult = first ? FIRST_WIN_MULT : 1;
  const gold = goldFor(stageId, diff) * mult;
  const xp = profileXpFor(stageId, diff) * mult;
  prof().gold += gold;
  const before = deckMax(save);
  const r = addProfileXp(prof(), xp);
  return `<div class="res big"><span>${goldHTML(`+${fmt(gold)}`)}</span><span>👤 +${xp} XP de perfil</span></div>${levelNote(r, before)}`;
}
/** Nível de perfil já subido ao gastar energia no começo da batalha (mostrado no fim). */
export let pendingLevelNote = '';
export const setPendingLevelNote = (html: string) => (pendingLevelNote = html);
export async function noEnergy(cost: number) {
  await gameAlert('Energia insuficiente', `Esta fase custa ⚡ ${cost} e você tem ⚡ ${energyNow()}. A energia recupera 1 a cada 6 minutos (a próxima em ${nextEnergyText()}) e enche ao subir de nível de perfil.`, '⚡');
}
