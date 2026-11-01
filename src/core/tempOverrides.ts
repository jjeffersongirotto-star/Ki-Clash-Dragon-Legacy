/** TEMP (v0.56.0): espera (rodadas) trocada pelo editor de balanceamento — ver src/app/tempCardBalanceEditor.ts. */
export const TEMP_WAIT: Record<string, number> = {};
/** TEMP (v0.58.0): ATQ/vida base por raridade (degrau 0) trocados pelo editor — [id][estrelas]. */
export const TEMP_STATS: Record<
  string,
  Record<number, { atk: number; hp: number }>
> = {};
