import { describe, expect, it } from 'vitest';
import { BattleView } from '../../src/ui/battleView';

describe('v0.67.10 — tempo da partida entre as duas vidas', () => {
  it('conta segundos até 59 e depois minutos:segundos', () => {
    expect(BattleView.fmtTime(0)).toBe('0');
    expect(BattleView.fmtTime(59)).toBe('59');
    expect(BattleView.fmtTime(60)).toBe('01:00');
    expect(BattleView.fmtTime(64)).toBe('01:04');
    expect(BattleView.fmtTime(65)).toBe('01:05');
    expect(BattleView.fmtTime(725)).toBe('12:05');
  });
});
