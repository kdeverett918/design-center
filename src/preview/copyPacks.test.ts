import { describe, expect, it } from 'vitest';
import { COPY_PACKS, fill, packById, packForPalette } from './copyPacks';
import { palettes } from '../data/palettes';

describe('copy packs', () => {
  it('every pack is complete', () => {
    for (const p of COPY_PACKS) {
      expect(p.headline.length, p.id).toBeGreaterThan(10);
      expect(p.sub.length, p.id).toBeGreaterThan(40);
      expect(p.eyebrow.length, p.id).toBeGreaterThan(5);
      expect(p.features, p.id).toHaveLength(3);
      expect(p.stats, p.id).toHaveLength(4);
      expect(p.testimonials, p.id).toHaveLength(3);
      expect(p.navLinks, p.id).toHaveLength(3);
      expect(p.miniFeatures, p.id).toHaveLength(2);
      expect(p.marqueeWords.length, p.id).toBeGreaterThanOrEqual(4);
      expect(p.ctaPrimary, p.id).toBeTruthy();
      expect(p.ctaSecondary, p.id).toBeTruthy();
      expect(p.navCta, p.id).toBeTruthy();
      expect(p.footerTagline, p.id).toBeTruthy();
      expect(p.footerCta, p.id).toBeTruthy();
      expect(p.miniBody, p.id).toBeTruthy();
    }
  });

  it('ids and headlines are unique', () => {
    const ids = COPY_PACKS.map((p) => p.id);
    const headlines = COPY_PACKS.map((p) => p.headline);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(headlines).size).toBe(headlines.length);
  });

  it('fill replaces {brand} everywhere it appears', () => {
    expect(fill('Welcome to {brand}, by {brand}.', 'Acme')).toBe('Welcome to Acme, by Acme.');
  });

  it('packForPalette is deterministic and total over the library', () => {
    const seen = new Set<string>();
    for (const palette of palettes) {
      const pack = packForPalette(palette);
      expect(pack, palette.id).toBeDefined();
      expect(packForPalette(palette).id, palette.id).toBe(pack.id);
      seen.add(pack.id);
    }
    // The library's mood spread should exercise several voices, not one.
    expect(seen.size).toBeGreaterThanOrEqual(4);
  });

  it('packById resolves every pack and rejects unknowns', () => {
    for (const p of COPY_PACKS) expect(packById(p.id)).toBe(p);
    expect(packById('nope')).toBeUndefined();
  });
});
