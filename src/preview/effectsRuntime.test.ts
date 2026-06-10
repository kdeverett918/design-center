import { describe, expect, it } from 'vitest';
import { EMPTY_FX, anyCursor, resolveEffects } from './effectsRuntime';
import { toContentCoords } from '../components/preview/effects/usePointerField';
import { animationPresets } from '../data/animations';

describe('resolveEffects', () => {
  it('returns EMPTY_FX for no ids, unknown ids, or reduced motion', () => {
    expect(resolveEffects(undefined, false)).toBe(EMPTY_FX);
    expect(resolveEffects([], false)).toBe(EMPTY_FX);
    expect(resolveEffects(['not-a-real-effect'], false)).toBe(EMPTY_FX);
    expect(resolveEffects(['fade-up'], true)).toBe(EMPTY_FX);
  });

  it('maps every library preset to at least one runtime manifestation', () => {
    for (const preset of animationPresets) {
      const fx = resolveEffects([preset.id], false);
      expect(fx.any, `${preset.id} resolved nothing`).toBe(true);
      const manifests =
        fx.headlineFx !== null ||
        fx.blockFx !== null ||
        fx.staggerBoost ||
        fx.scrollReveal ||
        fx.countUp ||
        fx.parallax ||
        fx.confetti ||
        fx.marqueeBand !== null ||
        Object.values(fx.card).some(Boolean) ||
        Object.values(fx.cta).some(Boolean) ||
        fx.link.underline ||
        Object.values(fx.image).some(Boolean) ||
        Object.values(fx.headline).some(Boolean) ||
        anyCursor(fx) ||
        fx.pageFade ||
        fx.morphIn;
      expect(manifests, `${preset.id} has no page manifestation`).toBe(true);
    }
  });

  it('applies headline priority when several entrances are picked', () => {
    const fx = resolveEffects(['reveal-mask', 'kinetic-type', 'typewriter'], false);
    expect(fx.headlineFx).toBe('typewriter');
  });

  it('enforces one transform owner per card (tilt > wobble > lift)', () => {
    const fx = resolveEffects(['tilt-3d', 'wobble', 'hover-lift'], false);
    expect(fx.card.tilt).toBe(true);
    expect(fx.card.wobble).toBe(false);
    expect(fx.card.lift).toBe(false);
  });

  it('marquee-ticker wins over marquee', () => {
    expect(resolveEffects(['marquee', 'marquee-ticker'], false).marqueeBand).toBe('ticker');
    expect(resolveEffects(['marquee'], false).marqueeBand).toBe('quiet');
  });
});

describe('toContentCoords — scaled-frame pointer math', () => {
  it('is identity at scale 1', () => {
    const p = toContentCoords(150, 90, { left: 50, top: 40, width: 1000 }, 1000);
    expect(p).toEqual({ x: 100, y: 50 });
  });

  it('recovers content pixels inside a scaled frame', () => {
    // 1280px content rendered at 1/3 scale → visual width ~426.67.
    const p = toContentCoords(50 + 426.67 / 2, 40 + 30, { left: 50, top: 40, width: 426.67 }, 1280);
    expect(p.x).toBeCloseTo(640, 0);
    expect(p.y).toBeCloseTo(90, 0);
  });

  it('never divides by zero', () => {
    const p = toContentCoords(10, 10, { left: 0, top: 0, width: 0 }, 0);
    expect(Number.isFinite(p.x)).toBe(true);
  });
});
