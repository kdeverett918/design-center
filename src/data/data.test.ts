import { describe, expect, it } from 'vitest';
import { palettes, paletteById } from './palettes';
import { fontPairings, fontPairingById } from './fonts';
import { themes, themeById } from './themes';
import { animationPresets, animationById } from './animations';
import { layoutPresets, layoutById } from './layouts';
import { sectionFor } from '../components/preview/sections/registry';
import { layoutToConfig } from '../preview/previewConfig';
import {
  INDUSTRIES,
  MOODS,
  matchIndustries,
  matchMoods,
} from './taxonomy';
import type { PaletteColors } from '../types';

const HEX = /^#[0-9A-Fa-f]{6}$/;
const COLOR_ROLES: (keyof PaletteColors)[] = [
  'primary',
  'secondary',
  'accent',
  'ink',
  'muted',
  'surface',
  'background',
];

describe('data integrity — counts', () => {
  it('has the expected catalog sizes', () => {
    expect(palettes).toHaveLength(50);
    expect(fontPairings).toHaveLength(43);
    expect(themes).toHaveLength(46);
    expect(animationPresets).toHaveLength(39);
  });
});

describe('palettes', () => {
  it('have unique, lowercase ids', () => {
    const ids = palettes.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toBe(id.toLowerCase()));
  });

  it('every color is a 6-digit hex', () => {
    palettes.forEach((p) => {
      COLOR_ROLES.forEach((role) => {
        expect(p.colors[role], `${p.id}.${role}`).toMatch(HEX);
      });
    });
  });

  it('paletteById resolves real ids and returns undefined otherwise', () => {
    expect(paletteById('meridian')?.name).toBe('Meridian');
    expect(paletteById('does-not-exist')).toBeUndefined();
  });

  it('dark palettes are flagged', () => {
    const dark = palettes.filter((p) => p.isDark).map((p) => p.id).sort();
    expect(dark).toEqual([
      'blacklime',
      'bluehour',
      'carbon',
      'chrome',
      'ember',
      'glacier',
      'lagoon',
      'nebula',
      'nocturne',
      'noir',
      'vapor',
    ]);
  });
});

describe('font pairings', () => {
  it('have unique, lowercase ids', () => {
    const ids = fontPairings.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toBe(id.toLowerCase()));
  });

  it('every face has a non-empty family and at least one weight', () => {
    fontPairings.forEach((f) => {
      [f.heading, f.body].forEach((face) => {
        expect(face.family.length).toBeGreaterThan(0);
        expect(face.weights.length).toBeGreaterThan(0);
      });
    });
  });

  it('fontPairingById resolves', () => {
    expect(fontPairingById('clearwater')?.name).toBe('Clearwater');
    expect(fontPairingById('nope')).toBeUndefined();
  });
});

describe('themes', () => {
  it('have unique, lowercase ids', () => {
    const ids = themes.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toBe(id.toLowerCase()));
  });

  it('every paletteId resolves to a real palette', () => {
    themes.forEach((t) => {
      expect(paletteById(t.paletteId), `${t.id} → ${t.paletteId}`).toBeDefined();
    });
  });

  it('every fontPairingId resolves to a real pairing', () => {
    themes.forEach((t) => {
      expect(fontPairingById(t.fontPairingId), `${t.id} → ${t.fontPairingId}`).toBeDefined();
    });
  });

  it('themeById resolves', () => {
    expect(themeById('obsidian')?.name).toBe('Obsidian');
    expect(themeById('ghost')).toBeUndefined();
  });
});

describe('animations', () => {
  it('have unique, lowercase ids', () => {
    const ids = animationPresets.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toBe(id.toLowerCase()));
  });

  it('durationMs is non-negative', () => {
    animationPresets.forEach((a) => expect(a.durationMs).toBeGreaterThanOrEqual(0));
  });

  it('animationById resolves', () => {
    expect(animationById('fade-up')?.name).toBe('Fade Up');
    expect(animationById('zzz')).toBeUndefined();
  });

  it('every preset has a valid category, including the cursor category', () => {
    const valid = new Set(['entrance', 'scroll', 'hover', 'cursor', 'continuous', 'transition']);
    animationPresets.forEach((a) => expect(valid.has(a.category)).toBe(true));
    const cursor = animationPresets.filter((a) => a.category === 'cursor');
    expect(cursor.length).toBeGreaterThanOrEqual(5);
  });
});

describe('layouts', () => {
  it('have unique ids and layoutById resolves', () => {
    const ids = layoutPresets.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(layoutById('hero-split')?.name).toBe('Split Hero');
    expect(layoutById('missing')).toBeUndefined();
  });

  it('every section layout has a registered preview component', () => {
    layoutPresets
      .filter((l) => l.type === 'section')
      .forEach((l) => expect(sectionFor(l.previewKey), l.previewKey).toBeDefined());
  });

  it('every hero/card layout maps to a valid config patch', () => {
    layoutPresets
      .filter((l) => l.type === 'hero' || l.type === 'card')
      .forEach((l) => expect(layoutToConfig(l.previewKey), l.previewKey).not.toBeNull());
  });
});

describe('taxonomy match functions', () => {
  it('empty selection matches everything (no constraint)', () => {
    expect(matchMoods(['calm'], [])).toBe(true);
    expect(matchIndustries(['healthcare'], [])).toBe(true);
  });

  it('returns true on overlap and false when disjoint', () => {
    expect(matchMoods(['calm', 'warm'], ['warm'])).toBe(true);
    expect(matchMoods(['calm'], ['bold'])).toBe(false);
    expect(matchIndustries(['saas', 'creative'], ['creative'])).toBe(true);
    expect(matchIndustries(['healthcare'], ['ecommerce'])).toBe(false);
  });

  it('taxonomy vocab covers every mood/industry used in data', () => {
    const usedMoods = new Set(palettes.flatMap((p) => p.moods).concat(themes.flatMap((t) => t.moods)));
    usedMoods.forEach((m) => expect(MOODS).toContain(m));
    const usedIndustries = new Set(
      fontPairings.flatMap((f) => f.goodFor).concat(themes.flatMap((t) => t.industries)),
    );
    usedIndustries.forEach((i) => expect(INDUSTRIES).toContain(i));
  });
});

describe('client-facing copy completeness', () => {
  it('every palette has a distinct blurb', () => {
    const blurbs = palettes.map((p) => p.blurb ?? '');
    blurbs.forEach((b, i) => expect(b.length, palettes[i]!.id).toBeGreaterThan(20));
    expect(new Set(blurbs).size).toBe(blurbs.length);
  });

  it('every font pairing has a distinct specimen sentence (no pangrams)', () => {
    const specimens = fontPairings.map((f) => f.specimen ?? '');
    specimens.forEach((s, i) => {
      expect(s.length, fontPairings[i]!.id).toBeGreaterThan(8);
      expect(s.toLowerCase()).not.toContain('quick brown fox');
    });
    expect(new Set(specimens).size).toBe(specimens.length);
  });

  it('every theme has a distinct story', () => {
    const stories = themes.map((t) => t.story ?? '');
    stories.forEach((s, i) => expect(s.length, themes[i]!.id).toBeGreaterThan(30));
    expect(new Set(stories).size).toBe(stories.length);
  });
});
