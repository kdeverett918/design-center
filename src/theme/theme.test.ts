import { beforeEach, describe, expect, it } from 'vitest';
import { applyTheme, colorVars, themeVars } from './applyTheme';
import { loadFonts } from './loadFonts';
import { paletteById } from '../data/palettes';
import { fontPairingById } from '../data/fonts';
import type { FontPairing } from '../types';

const meridian = paletteById('meridian')!;
const nocturne = paletteById('nocturne')!;
const clearwater = fontPairingById('clearwater')!;
const daylight = fontPairingById('daylight')!; // single-family pairing

describe('applyTheme', () => {
  it('writes every color + font CSS var onto the element', () => {
    const el = document.createElement('div');
    applyTheme(el, meridian, clearwater);
    expect(el.style.getPropertyValue('--color-primary')).toBe(meridian.colors.primary);
    expect(el.style.getPropertyValue('--color-bg')).toBe(meridian.colors.background);
    expect(el.style.getPropertyValue('--color-ink')).toBe(meridian.colors.ink);
    expect(el.style.getPropertyValue('--font-heading')).toContain(clearwater.heading.family);
    expect(el.style.getPropertyValue('--font-body')).toContain(clearwater.body.family);
  });

  it('marks dark palettes via data-dark', () => {
    const light = document.createElement('div');
    applyTheme(light, meridian, clearwater);
    expect(light.dataset.dark).toBe('false');

    const dark = document.createElement('div');
    applyTheme(dark, nocturne, clearwater);
    expect(dark.dataset.dark).toBe('true');
  });
});

describe('themeVars / colorVars', () => {
  it('themeVars maps colors and fonts', () => {
    const vars = themeVars(meridian, clearwater) as Record<string, string>;
    expect(vars['--color-bg']).toBe(meridian.colors.background);
    expect(vars['--color-accent']).toBe(meridian.colors.accent);
    expect(vars['--font-heading']).toContain(clearwater.heading.family);
  });

  it('colorVars maps only colors (no font vars)', () => {
    const vars = colorVars(meridian) as Record<string, string>;
    expect(vars['--color-primary']).toBe(meridian.colors.primary);
    expect(vars['--font-heading']).toBeUndefined();
    expect(vars['--font-body']).toBeUndefined();
  });
});

describe('loadFonts', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('injects exactly one <link> per pairing', () => {
    loadFonts(clearwater);
    const link = document.getElementById('gf-clearwater') as HTMLLinkElement | null;
    expect(link).not.toBeNull();
    expect(link?.rel).toBe('stylesheet');
    expect(link?.href).toContain('fonts.googleapis.com');
    expect(link?.href).toContain('Poppins');
    expect(link?.href).toContain('Inter');
    expect(document.head.querySelectorAll('link').length).toBe(1);
  });

  it('dedupes on repeat calls for the same pairing', () => {
    loadFonts(clearwater);
    loadFonts(clearwater);
    loadFonts(clearwater);
    expect(document.head.querySelectorAll('link#gf-clearwater').length).toBe(1);
    expect(document.head.querySelectorAll('link').length).toBe(1);
  });

  it('adds a separate link per distinct pairing', () => {
    loadFonts(clearwater);
    loadFonts(daylight);
    expect(document.head.querySelectorAll('link').length).toBe(2);
    expect(document.getElementById('gf-daylight')).not.toBeNull();
  });

  it('dedupes faces with identical family AND weights into one family param', () => {
    const synthetic: FontPairing = {
      id: 'synthetic-single',
      name: 'Synthetic',
      personality: 'test',
      goodFor: ['healthcare'],
      heading: { family: 'Lexend', source: 'google', weights: [400] },
      body: { family: 'Lexend', source: 'google', weights: [400] },
    };
    loadFonts(synthetic);
    const href = (document.getElementById('gf-synthetic-single') as HTMLLinkElement).href;
    const familyCount = (href.match(/family=/g) ?? []).length;
    expect(familyCount).toBe(1);
    expect(href).toContain('Lexend');
  });

  it('keeps both params when a single-family pairing uses different weights', () => {
    // Daylight = Lexend/Lexend but heading [500,700] vs body [400] → two params.
    loadFonts(daylight);
    const href = (document.getElementById('gf-daylight') as HTMLLinkElement).href;
    const familyCount = (href.match(/family=/g) ?? []).length;
    expect(familyCount).toBe(2);
    expect(href).toContain('Lexend');
  });
});
