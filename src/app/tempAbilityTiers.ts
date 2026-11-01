/**
 * TEMP — nível das habilidades só para o editor de balanceamento (sem efeito no jogo).
 * Básica < Normal < Épica (da pior para a melhor). Remover junto com o editor.
 */
import type { AbilityId } from '../core/types';

export type AbilityTier = 'basica' | 'normal' | 'epica';

const T = (tier: AbilityTier, ids: AbilityId[]) => ids.map((id) => [id, tier] as const);

export const ABILITY_TIER: Partial<Record<AbilityId, AbilityTier>> = Object.fromEntries([
  ...T('basica', ['diagFrente', 'diagTras', 'guarda', 'longoAlcance', 'flechaDupla', 'barreira', 'mare', 'precisao', 'olhoAguia', 'cacaMagos', 'sopro', 'espinhos', 'ombrada', 'regeneracao', 'escudoInicial', 'investida', 'ataqueCostas', 'marcaSede', 'disparoSombrio', 'vigia']),
  ...T('normal', ['salto', 'perfurante', 'retaguarda', 'menorVida', 'lotus', 'inabalavel', 'tambor', 'brasa', 'surpresa', 'sifao', 'reflexo', 'critico', 'provocar', 'sangramento', 'lentidao', 'veneno', 'maldicao', 'purificar', 'furia', 'explosao', 'congelar', 'gritoGuerra', 'protetor', 'queimadura', 'vampirismo', 'vinganca', 'couracaAdaptativa', 'retaliacao', 'perfurar']),
  ...T('epica', ['prole', 'contraGolpe', 'renascer', 'anjo', 'necromancia', 'atordoar', 'teleporte', 'anular', 'ultimaResistencia', 'evasao', 'dominio', 'copiador', 'clone', 'raioCadeia', 'execucao', 'sedeEterna', 'ressurreicao']),
]);

export const TIER_LABEL: Record<AbilityTier, string> = { basica: 'Básica', normal: 'Normal', epica: 'Épica' };
export const TIER_ORDER: AbilityTier[] = ['basica', 'normal', 'epica'];
export const tierOf = (id: string): AbilityTier => ABILITY_TIER[id as AbilityId] ?? 'normal';
