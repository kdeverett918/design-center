import { describe, expect, it } from 'vitest';
import { animationById } from '../../data/animations';
import { fontPairingById } from '../../data/fonts';
import { layoutById } from '../../data/layouts';
import { paletteById } from '../../data/palettes';
import { themeById } from '../../data/themes';
import { buildShortlistText } from './buildShortlist';

describe('buildShortlistText', () => {
  it('summarizes every shortlisted category', () => {
    const text = buildShortlistText({
      count: 5,
      groups: {
        themes: [themeById('obsidian')!],
        palettes: [paletteById('reef')!],
        fonts: [fontPairingById('telemetry')!],
        layouts: [layoutById('sec-pricing-tiers')!],
        animations: [animationById('fade-up')!],
      },
    });

    expect(text).toContain('DESIGN SHORTLIST');
    expect(text).toContain('5 saved items');
    expect(text).toContain('Obsidian');
    expect(text).toContain('Reef');
    expect(text).toContain('Telemetry');
    expect(text).toContain('Pricing Tiers');
    expect(text).toContain('Fade Up');
  });

  it('omits empty sections', () => {
    const text = buildShortlistText({
      count: 1,
      groups: {
        themes: [themeById('stillwater')!],
        palettes: [],
        fonts: [],
        layouts: [],
        animations: [],
      },
    });

    expect(text).toContain('1 saved item');
    expect(text).toContain('Themes (1)');
    expect(text).not.toContain('Palettes');
  });
});
