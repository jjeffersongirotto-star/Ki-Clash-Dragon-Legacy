import { describe, expect, it } from 'vitest';
import { filterHeroes, heroCells, heroGroups, inRange, showSpellsFor } from '../../src/core/heroes';
import { getChar, PLAYABLE } from '../../src/core/characters';
import { statsFor } from '../../src/core/progression';
import { checkForUpdate, SITE_URL } from '../../src/ui/update';

const ids = (g: ReturnType<typeof heroGroups>) => g.flatMap((x) => x.types.flatMap((t) => t.chars.map((c) => c.id)));

describe('v0.64.0 — filtros dos Heróis', () => {
  it('faixas de ataque/vida', () => {
    expect(inRange(2, '1-2')).toBe(true);
    expect(inRange(3, '1-2')).toBe(false);
    expect(inRange(16, '11+')).toBe(true);
    expect(inRange(5, null)).toBe(true);
  });

  it('raridade, ataque, vida e rodadas valem juntos com grupo e tipo', () => {
    const all = heroGroups();
    expect(ids(filterHeroes(all, {}))).toEqual(ids(all));
    const f = { race: 'humano', cat: 'dps', rarity: 4, atk: '3-4', hp: '4-6', wait: 2 };
    const got = ids(filterHeroes(all, f));
    expect(got.length).toBeGreaterThan(0);
    for (const id of got) {
      const d = getChar(id);
      expect([d.race, d.category, d.wait]).toEqual(['humano', 'dps', 2]);
      const cells = heroCells(d, f);
      expect(cells).toEqual([4]);
      const s = statsFor(d, 4, 0);
      expect(inRange(s.atk, '3-4') && inRange(s.hp, '4-6')).toBe(true);
    }
    // quem não tem nenhuma carta no filtro some
    for (const d of PLAYABLE) if (!got.includes(d.id) && d.race === 'humano' && d.category === 'dps') expect(heroCells(d, f)).toEqual([]);
  });

  it('só Míticos: só aparecem as cartas Míticas', () => {
    const got = filterHeroes(heroGroups(), { rarity: 6 });
    for (const id of ids(got)) expect(heroCells(getChar(id), { rarity: 6 })).toEqual([6]);
    expect(showSpellsFor({ rarity: 6 })).toBe(true);
    expect(showSpellsFor({ atk: '1-2' })).toBe(false);
  });
});

describe('v0.64.0 — atualização automática', () => {
  const manifest = { version: '0.65.0', minNative: '0.64.0', files: [{ file_name: 'index.html', file_hash: 'a'.repeat(64) }] };
  const fetchFn = (async (url: string) => {
    if (url.startsWith(`${SITE_URL}ota-manifest.json`)) return new Response(JSON.stringify(manifest));
    return new Response(JSON.stringify({ tag_name: 'v0.65.0', assets: [{ name: 'Ki-Clash-0.65.0.apk', browser_download_url: 'apk' }] }));
  }) as typeof fetch;

  it('app instalado novo o bastante: atualiza só os arquivos (sem APK)', async () => {
    const r = await checkForUpdate({ native: true, desktop: false, current: '0.64.0', installed: '0.64.0', fetchFn });
    expect(r.status).toBe('available');
    expect(r.status === 'available' && r.ota?.version).toBe('0.65.0');
  });

  it('app instalado antigo (ou sem suporte): continua oferecendo o APK', async () => {
    const old = await checkForUpdate({ native: true, desktop: false, current: '0.63.0', installed: '0.63.0', fetchFn });
    expect(old.status === 'available' && old.ota).toBeFalsy();
    expect(old.status === 'available' && old.url).toBe('apk');
    const none = await checkForUpdate({ native: true, desktop: false, current: '0.63.0', installed: '', fetchFn });
    expect(none.status === 'available' && none.ota).toBeFalsy();
  });

  it('já na versão do site: nada a fazer', async () => {
    const r = await checkForUpdate({ native: true, desktop: false, current: '0.65.0', installed: '0.64.0', fetchFn });
    expect(r.status).toBe('latest');
  });
});
