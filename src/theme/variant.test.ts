import { describe, expect, it } from 'vitest';
import { palettes } from '../data/palettes';
import { bestOn, contrastRatio } from './contrast';
import { hexToHsl, hslToHex, paletteVariant, resolvePalette } from './variant';

// Derived variants must clear the exact same WCAG bars the hand-curated
// palettes are tested against in contrast.test.ts — for every palette.
describe('paletteVariant — derived modes stay accessible', () => {
  it('flips isDark and keeps identity metadata for all 50 palettes', () => {
    for (const p of palettes) {
      const v = paletteVariant(p);
      expect(v.isDark, p.id).toBe(!p.isDark);
      expect(v.moods).toEqual(p.moods);
      expect(v.name).toContain(p.name);
    }
  });

  it('ink meets AA (4.5) on background and surface', () => {
    for (const p of palettes) {
      const v = paletteVariant(p);
      expect(contrastRatio(v.colors.ink, v.colors.background), `${p.id} ink/bg`).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(v.colors.ink, v.colors.surface), `${p.id} ink/surface`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('muted meets AA-large (3.0) on background and surface', () => {
    for (const p of palettes) {
      const v = paletteVariant(p);
      expect(contrastRatio(v.colors.muted, v.colors.background), `${p.id} muted/bg`).toBeGreaterThanOrEqual(3.0);
      expect(contrastRatio(v.colors.muted, v.colors.surface), `${p.id} muted/surface`).toBeGreaterThanOrEqual(3.0);
    }
  });

  it('on-primary and on-accent text meet AA (4.5)', () => {
    for (const p of palettes) {
      const v = paletteVariant(p);
      expect(contrastRatio(bestOn(v.colors.primary), v.colors.primary), `${p.id} on-primary`).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(bestOn(v.colors.accent), v.colors.accent), `${p.id} on-accent`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('brand hues survive the transform (Δh ≤ 2° when saturated)', () => {
    const hueDelta = (a: number, b: number) => {
      const d = Math.abs(a - b) % 360;
      return d > 180 ? 360 - d : d;
    };
    for (const p of palettes) {
      const v = paletteVariant(p);
      const base = hexToHsl(p.colors.primary);
      const derived = hexToHsl(v.colors.primary);
      // Hue is meaningless for near-grays; only assert when saturated enough.
      if (base.s > 0.05 && derived.s > 0.05) {
        expect(hueDelta(base.h, derived.h), p.id).toBeLessThanOrEqual(2);
      }
    }
  });

  it('memoizes per source palette', () => {
    const p = palettes[0]!;
    expect(paletteVariant(p)).toBe(paletteVariant(p));
  });
});

describe('resolvePalette', () => {
  const light = palettes.find((p) => !p.isDark)!;
  const dark = palettes.find((p) => p.isDark)!;

  it('auto returns the design as designed', () => {
    expect(resolvePalette(light, 'auto')).toBe(light);
    expect(resolvePalette(dark, 'auto')).toBe(dark);
  });

  it('matching scheme returns the base; opposite returns the variant', () => {
    expect(resolvePalette(light, 'light')).toBe(light);
    expect(resolvePalette(dark, 'dark')).toBe(dark);
    expect(resolvePalette(light, 'dark').isDark).toBe(true);
    expect(resolvePalette(dark, 'light').isDark).toBe(false);
  });
});

describe('hex↔hsl helpers', () => {
  it('round-trips every palette color within 1/255 per channel', () => {
    const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
    for (const p of palettes) {
      for (const hex of Object.values(p.colors)) {
        const back = hslToHex(hexToHsl(hex));
        for (let i = 0; i < 3; i++) {
          expect(Math.abs(channel(back, i) - channel(hex, i)), `${p.id} ${hex}`).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});
