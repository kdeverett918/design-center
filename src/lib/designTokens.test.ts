import { describe, expect, it } from 'vitest';
import { toCssVars, toJson, toTailwind } from './designTokens';
import { paletteById } from '../data/palettes';
import { fontPairingById } from '../data/fonts';
import { themes } from '../data/themes';
import { configForTheme } from '../preview/previewConfig';

const palette = paletteById('meridian')!;
const fonts = fontPairingById('clearwater')!;
const config = configForTheme(themes[0]!);

describe('toCssVars', () => {
  it('emits a :root block with color + font custom properties', () => {
    const css = toCssVars(palette, fonts);
    expect(css).toContain(':root {');
    expect(css).toContain(`--color-primary: ${palette.colors.primary};`);
    expect(css).toContain('--color-primary: #2B6CB0;');
    expect(css).toContain(`--font-heading: "${fonts.heading.family}"`);
  });
});

describe('toJson', () => {
  it('round-trips as valid JSON with the expected shape', () => {
    const json = toJson(palette, fonts, config);
    const parsed = JSON.parse(json) as {
      name: string;
      colors: { primary: string };
      typography: { heading: { family: string } };
      layout: { hero: string };
      animations: string[];
    };
    expect(parsed.colors.primary).toBe(palette.colors.primary);
    expect(parsed.typography.heading.family).toBe(fonts.heading.family);
    expect(parsed.layout.hero).toBeDefined();
    // animations defaults to [] when not supplied
    expect(parsed.animations).toEqual([]);
  });

  it('includes the chosen animations when supplied', () => {
    const json = toJson(palette, fonts, config, ['fade-up', 'hover-lift']);
    const parsed = JSON.parse(json) as { animations: string[] };
    expect(parsed.animations).toEqual(['fade-up', 'hover-lift']);
  });
});

describe('toTailwind', () => {
  it('emits a theme.extend snippet with colors + font families', () => {
    const snippet = toTailwind(palette, fonts);
    expect(snippet).toContain('theme:');
    expect(snippet).toContain('extend:');
    expect(snippet).toContain(palette.colors.primary);
    expect(snippet).toContain(fonts.heading.family);
  });
});
