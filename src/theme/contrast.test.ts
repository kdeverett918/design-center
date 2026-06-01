import { describe, expect, it } from 'vitest';
import { palettes } from '../data/palettes';
import { bestOn, contrastRatio } from './contrast';

// WCAG thresholds: 4.5 for normal text, 3.0 for large/secondary text.
const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;

describe('palette contrast (readability)', () => {
  it('body text (ink) is clearly legible on background and surface', () => {
    for (const p of palettes) {
      const { ink, background, surface } = p.colors;
      expect(contrastRatio(ink, background), `${p.id}: ink/bg`).toBeGreaterThanOrEqual(AA_NORMAL);
      expect(contrastRatio(ink, surface), `${p.id}: ink/surface`).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });

  it('secondary text (muted) meets at least AA-large on background and surface', () => {
    for (const p of palettes) {
      const { muted, background, surface } = p.colors;
      expect(contrastRatio(muted, background), `${p.id}: muted/bg`).toBeGreaterThanOrEqual(AA_LARGE);
      expect(contrastRatio(muted, surface), `${p.id}: muted/surface`).toBeGreaterThanOrEqual(AA_LARGE);
    }
  });

  it('on-primary text is legible on every primary surface (buttons, hero, stats)', () => {
    for (const p of palettes) {
      const onP = bestOn(p.colors.primary);
      expect(contrastRatio(onP, p.colors.primary), `${p.id}: onPrimary/primary`).toBeGreaterThanOrEqual(
        AA_NORMAL,
      );
    }
  });

  it('on-accent text is legible on every accent surface', () => {
    for (const p of palettes) {
      const onA = bestOn(p.colors.accent);
      expect(contrastRatio(onA, p.colors.accent), `${p.id}: onAccent/accent`).toBeGreaterThanOrEqual(
        AA_NORMAL,
      );
    }
  });
});
