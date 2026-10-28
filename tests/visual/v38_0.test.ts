import { describe, expect, it } from 'vitest';
import { COMMANDER_LOOK, COMMANDER_REJECTED, isCleanCommander } from '../../src/core/commanders';
import { STAGES, STAGE_COMMANDERS, stageCommander } from '../../src/core/campaign';
import { DIFFICULTIES, stageFor } from '../../src/core/adventure';
import { PLAYABLE } from '../../src/core/characters';
import { enemyCommanderBattle, hasCutout } from '../../src/ui/art';

describe('v0.38.0 — Comandantes sem cortes', () => {
  it('as 120 artes foram triadas: cada personagem está ou na tabela (recorte limpo) ou nos recusados, com motivo', () => {
    const ids = PLAYABLE.map((d) => d.id);
    expect(ids).toHaveLength(120);
    for (const id of ids) {
      const ok = id in COMMANDER_LOOK;
      const no = id in COMMANDER_REJECTED;
      expect(ok !== no, id).toBe(true);
      if (no) expect(COMMANDER_REJECTED[id].length, id).toBeGreaterThan(5);
    }
    expect(Object.keys(COMMANDER_LOOK).length).toBeGreaterThanOrEqual(70);
  });

  it('a Nyx, o Zarek e os outros cortados não são Comandante e não têm recorte no jogo', () => {
    for (const id of ['nyx', 'zarek', 'riku', 'hana', 'ren']) {
      expect(isCleanCommander(id), id).toBe(false);
      expect(hasCutout(id), id).toBe(false);
    }
    expect(STAGE_COMMANDERS).not.toContain('nyx');
    expect(STAGE_COMMANDERS).not.toContain('zarek');
  });

  it('todo Comandante de fase, em todas as dificuldades, tem recorte limpo e não se repete', () => {
    for (const diff of DIFFICULTIES)
      for (const st of STAGES) {
        const c = stageCommander(stageFor(st.id, diff));
        if (!c) continue;
        expect(isCleanCommander(c.charId), `${diff} ${st.id} ${c.charId}`).toBe(true);
        expect(hasCutout(c.charId), c.charId).toBe(true);
      }
    const ids = STAGE_COMMANDERS.filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('altura realista: gigantes acima do bárbaro, sentados e agachados bem abaixo; sem efeito desenhado por cima', () => {
    expect(COMMANDER_LOOK.gorath.h).toBeGreaterThan(1);
    expect(COMMANDER_LOOK.mei.h).toBeLessThan(0.7);
    expect(COMMANDER_LOOK.grub.h).toBeLessThan(COMMANDER_LOOK.krag.h);
    const h = enemyCommanderBattle({ charId: 'lyra', stars: 2 });
    expect(h).toContain('hero-cut flip');
    expect(h).not.toContain('cmd-swirl');
  });
});
