import { describe, expect, it } from 'vitest';
import { buildBriefText, COLOR_ROLES } from './buildBrief';
import type { BriefInput } from './buildBrief';
import { paletteById } from '../../data/palettes';
import { fontPairingById } from '../../data/fonts';
import type { PreviewConfig } from '../../preview/previewConfig';

const palette = paletteById('nocturne')!; // dark, to exercise the (dark) branch
const fonts = fontPairingById('telemetry')!;
const config: PreviewConfig = { hero: 'centered', cardStyle: 'glass', motion: 'expressive' };

const base: BriefInput = {
  brand: 'Aurora Clinic',
  themeName: 'Obsidian',
  palette,
  fonts,
  config,
};

describe('buildBriefText', () => {
  it('includes the brand and theme name', () => {
    const text = buildBriefText(base);
    expect(text).toContain('DESIGN BRIEF — Aurora Clinic');
    expect(text).toContain('Theme: Obsidian');
  });

  it('says "Custom mix" when no theme name is given', () => {
    const text = buildBriefText({ ...base, themeName: undefined });
    expect(text).toContain('Theme: Custom mix');
  });

  it('flags dark palettes and lists every palette hex', () => {
    const text = buildBriefText(base);
    expect(text).toContain(`Palette: ${palette.name} (dark)`);
    COLOR_ROLES.forEach((role) => {
      expect(text).toContain(palette.colors[role]);
    });
  });

  it('includes both font families with their weights', () => {
    const text = buildBriefText(base);
    expect(text).toContain(fonts.heading.family);
    expect(text).toContain(fonts.heading.weights.join('/'));
    expect(text).toContain(fonts.body.family);
    expect(text).toContain(fonts.name);
    expect(text).toContain(fonts.personality);
  });

  it('includes the layout config values', () => {
    const text = buildBriefText(base);
    expect(text).toContain('centered');
    expect(text).toContain('glass');
    expect(text).toContain('expressive');
  });

  it('appends trimmed notes only when present', () => {
    expect(buildBriefText(base)).not.toContain('Notes:');
    const withNotes = buildBriefText({ ...base, notes: '  warm but clinical  ' });
    expect(withNotes).toContain('Notes:');
    expect(withNotes).toContain('warm but clinical');
    expect(withNotes).not.toContain('  warm but clinical  ');
  });
});
