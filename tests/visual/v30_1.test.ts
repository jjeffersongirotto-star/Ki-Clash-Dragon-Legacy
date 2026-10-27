import { describe, expect, it } from 'vitest';
import { COMMANDER_LOOK, enemyCommanderBattle, hasCutout } from '../../src/ui/art';
import { STAGES, stageCommander } from '../../src/core/campaign';
import { PLAYABLE } from '../../src/core/characters';

describe('v0.30.1 — Comandante adversário recortado e respirando', () => {
  it('todo Comandante das fases tem recorte e altura proporcional na tabela', () => {
    for (const st of STAGES) {
      const c = stageCommander(st);
      if (!c) continue; // fase 10: minotauro
      expect(hasCutout(c.charId), c.charId).toBe(true);
      expect(COMMANDER_LOOK[c.charId], c.charId).toBeDefined();
    }
  });

  it('os 20 personagens originais têm recorte e altura entre 0,4 e 1,3 do nosso bárbaro', () => {
    const originals = PLAYABLE.filter((d) => COMMANDER_LOOK[d.id]);
    expect(originals.length).toBe(Object.keys(COMMANDER_LOOK).length);
    for (const [id, look] of Object.entries(COMMANDER_LOOK)) {
      expect(hasCutout(id), id).toBe(true);
      expect(look.h).toBeGreaterThanOrEqual(0.4);
      expect(look.h).toBeLessThanOrEqual(1.3);
    }
  });

  it('na batalha: só o personagem recortado (sem carta), com a altura proporcional; sem personagem = minotauro', () => {
    const h = enemyCommanderBattle({ charId: 'mei', stars: 2 });
    expect(h).toContain('class="hero-cut"');
    expect(h).toContain(`--hs:${COMMANDER_LOOK.mei.h}`);
    expect(h).not.toContain('card');
    expect(enemyCommanderBattle({ charId: 'riku', stars: 1 })).toContain('hero-cut flip');
    expect(enemyCommanderBattle(null)).toContain('hero-leader-enemy hero-img');
  });
});
