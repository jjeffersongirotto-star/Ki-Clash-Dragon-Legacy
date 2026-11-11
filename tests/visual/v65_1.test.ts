import { afterEach, describe, expect, it } from 'vitest';
import { CHAR_ART_URLS, CHAR_THUMB_URLS, FACE_URLS, LEADER_ENEMY_URL, LEADER_PLAYER_URL } from '../../src/ui/art';
import { cardHTML, spellCardHTML, spellMiniHTML } from '../../src/ui/components';
import { ICON_URLS, SPELL_ART_URLS } from '../../src/ui/icons';
import { cachedCardImages, cardPreloadUrls, preloadCardImages, resetCardPreloadForTests } from '../../src/ui/preload';

afterEach(() => {
  resetCardPreloadForTests();
});

describe('v0.65.1 — artes das cartas pré-carregadas ao abrir o jogo', () => {
  it('reúne todas as artes de carta empacotadas no app (miniaturas primeiro, sem URL remota)', () => {
    const urls = cardPreloadUrls();
    expect(new Set(urls).size).toBe(urls.length);
    expect(CHAR_THUMB_URLS.length).toBe(121);
    expect(CHAR_ART_URLS.length).toBe(121);
    expect(FACE_URLS.length).toBe(121);
    expect(SPELL_ART_URLS.length).toBe(13);
    expect(ICON_URLS.length).toBe(200);
    expect(urls.slice(0, CHAR_THUMB_URLS.length)).toEqual([...CHAR_THUMB_URLS]);
    for (const u of [...CHAR_THUMB_URLS, ...CHAR_ART_URLS, ...FACE_URLS, ...SPELL_ART_URLS, ...ICON_URLS, LEADER_PLAYER_URL, LEADER_ENEMY_URL]) {
      expect(urls).toContain(u);
    }
    expect(urls).toHaveLength(CHAR_THUMB_URLS.length + CHAR_ART_URLS.length + FACE_URLS.length + SPELL_ART_URLS.length + ICON_URLS.length + 2);
    for (const u of urls) {
      expect(u).not.toMatch(/^https?:\/\//);
      expect(u).toMatch(/\.(webp)(\?.*)?$/i);
    }
  });

  it('decodifica cada URL e guarda o mesmo objeto Image no cache do módulo', async () => {
    const created: { src: string }[] = [];
    class FakeImage {
      src = '';
      complete = true;
      naturalWidth = 1;
      decode() {
        return Promise.resolve();
      }
      constructor() {
        created.push(this);
      }
    }
    const g = globalThis as unknown as { Image?: unknown };
    const prev = g.Image;
    g.Image = FakeImage;
    try {
      const r = await preloadCardImages();
      expect(r.total).toBe(cardPreloadUrls().length);
      expect(r.done).toBe(r.total);
      expect(created).toHaveLength(r.total);
      expect(cachedCardImages()).toHaveLength(r.total);
      expect(cachedCardImages()[0]).toBe(created[0]);
      const again = await preloadCardImages();
      expect(again.done).toBe(r.total);
      expect(created).toHaveLength(r.total); // não cria de novo
    } finally {
      g.Image = prev;
    }
  });

  it('cartas e feitiços das listas não usam loading=lazy nem decoding=async', () => {
    const grid = cardHTML({ charId: 'nyx', stars: 6, plus: true }, { grid: true });
    const detail = cardHTML({ charId: 'nyx', stars: 6, plus: true });
    const spell = spellCardHTML('f-investida');
    const mini = spellMiniHTML('f-investida');
    for (const html of [grid, detail, spell, mini]) {
      expect(html).not.toContain('loading="lazy"');
      expect(html).not.toContain('decoding="async"');
    }
  });
});
