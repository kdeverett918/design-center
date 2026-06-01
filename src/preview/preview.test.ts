import { describe, expect, it } from 'vitest';
import {
  CARD_STYLES,
  HERO_VARIANTS,
  INTENSITIES,
  configForTheme,
  layoutToConfig,
} from './previewConfig';
import type { CardStyle, HeroVariant } from './previewConfig';
import { hoverLift, motionSpec } from './motion';
import { themes } from '../data/themes';

const HERO_IDS = HERO_VARIANTS.map((h) => h.id);
const CARD_IDS = CARD_STYLES.map((c) => c.id);

describe('configForTheme', () => {
  it('returns a valid hero + card style and mirrors the theme motion', () => {
    themes.forEach((t) => {
      const cfg = configForTheme(t);
      expect(HERO_IDS).toContain(cfg.hero);
      expect(CARD_IDS).toContain(cfg.cardStyle);
      expect(cfg.motion).toBe(t.animationIntensity);
    });
  });

  it('falls back to split/elevated for an unknown theme', () => {
    const cfg = configForTheme({
      id: 'unknown',
      name: 'Unknown',
      tagline: '',
      moods: [],
      industries: [],
      paletteId: 'meridian',
      fontPairingId: 'clearwater',
      animationIntensity: 'standard',
    });
    expect(cfg.hero).toBe<HeroVariant>('split');
    expect(cfg.cardStyle).toBe<CardStyle>('elevated');
    expect(cfg.motion).toBe('standard');
  });

  it('exposes the three intensities', () => {
    expect(INTENSITIES).toEqual(['subtle', 'standard', 'expressive']);
  });
});

describe('layoutToConfig', () => {
  it('maps hero/card previewKeys to config patches', () => {
    expect(layoutToConfig('hero-editorial')).toEqual({ hero: 'editorial' });
    expect(layoutToConfig('hero-gradient-mesh')).toEqual({ hero: 'gradient-mesh' });
    expect(layoutToConfig('card-glass')).toEqual({ cardStyle: 'glass' });
    expect(layoutToConfig('card-inset')).toEqual({ cardStyle: 'inset' });
  });

  it('returns null for non-applicable or unknown keys', () => {
    expect(layoutToConfig('sec-pricing-tiers')).toBeNull();
    expect(layoutToConfig('nav-sidebar')).toBeNull();
    expect(layoutToConfig('hero-nonsense')).toBeNull();
  });
});

describe('motionSpec', () => {
  it('reduced mode produces no transform (opacity-only, both states equal)', () => {
    const spec = motionSpec('expressive', true);
    expect(spec.item.hidden).toEqual({ opacity: 1 });
    expect(spec.item.show).toEqual({ opacity: 1 });
    // no y / filter transforms in reduced mode
    expect(spec.item.hidden).not.toHaveProperty('y');
    expect(spec.item.show).not.toHaveProperty('filter');
  });

  it('non-reduced specs include a y transform that grows with intensity', () => {
    const subtle = motionSpec('subtle', false).item.hidden as Record<string, number>;
    const expressive = motionSpec('expressive', false).item.hidden as Record<string, number>;
    expect(subtle.y).toBeGreaterThan(0);
    expect(expressive.y).toBeGreaterThan(subtle.y);
  });

  it('expressive adds a blur filter; subtle does not', () => {
    expect(motionSpec('expressive', false).item.hidden).toHaveProperty('filter');
    expect(motionSpec('subtle', false).item.hidden).not.toHaveProperty('filter');
  });
});

describe('hoverLift', () => {
  it('returns 0 when reduced', () => {
    expect(hoverLift('expressive', true)).toBe(0);
  });

  it('scales negative lift with intensity', () => {
    expect(hoverLift('subtle', false)).toBe(-2);
    expect(hoverLift('standard', false)).toBe(-4);
    expect(hoverLift('expressive', false)).toBe(-7);
  });
});
