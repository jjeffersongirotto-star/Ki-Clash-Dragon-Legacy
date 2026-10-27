import { describe, expect, it } from 'vitest';
import { DRAG_THRESHOLD, dropAction, ghostTransform, shouldStartDrag } from '../../src/ui/drag';
import { createBattle, deploy, deployCells, DEPLOY_DEPTH } from '../../src/core/battle';
import { PLAYABLE } from '../../src/core/characters';

const deck10 = PLAYABLE.slice(0, 10).map((d) => ({ charId: d.id, stars: d.minStars }));

describe('v0.14.4 — arrastar a carta até o campo', () => {
  it('toque curto continua sendo toque; só vira arrasto depois de mover o dedo', () => {
    expect(DRAG_THRESHOLD).toBeGreaterThan(4);
    expect(shouldStartDrag(0, 0)).toBe(false);
    expect(shouldStartDrag(3, 4)).toBe(false);
    expect(shouldStartDrag(0, -DRAG_THRESHOLD)).toBe(true);
    expect(shouldStartDrag(8, -8)).toBe(true);
  });
  it('a carta fantasma só usa transform e fica com o ponto pego embaixo do dedo', () => {
    expect(ghostTransform(200, 150, 20, 30, 1)).toBe('translate3d(180px, 120px, 0) scale(1)');
    expect(ghostTransform(200, 150, 20, 30)).toMatch(/^translate3d\(-?\d+px, -?\d+px, 0\) scale\(1\.06\)$/);
  });
  it('soltar numa casa destacada invoca; em casa não destacada ou fora do campo cancela', () => {
    expect(dropAction({ valid: true })).toBe('deploy');
    expect(dropAction({ valid: false })).toBe('cancel');
    expect(dropAction(null)).toBe('cancel');
  });
  it('as casas destacadas no arrasto são as mesmas do toque (só a sua zona) e as regras da contagem valem igual', () => {
    const s = createBattle({ playerDeck: deck10, enemyDeck: deck10, playerHeroHp: 30, enemyHeroHp: 30, seed: 5 });
    const cells = deployCells(s, 'player');
    expect(cells.length).toBeGreaterThan(0);
    for (const [, c] of cells) expect(c).toBeLessThan(DEPLOY_DEPTH);
    s.decks.player.hand.forEach((h) => (h.wait = 0));
    expect(deploy(s, 'player', 0, 0, s.cols - 1).ok).toBe(false); // zona inimiga: cancela
    s.decks.player.hand[0].wait = 2;
    expect(deploy(s, 'player', 0, 0, 0).ok).toBe(false); // carta ainda esperando: não invoca
    s.decks.player.hand.forEach((h) => (h.wait = 0));
    expect(deploy(s, 'player', 0, 0, 0).ok).toBe(true);
  });
});
