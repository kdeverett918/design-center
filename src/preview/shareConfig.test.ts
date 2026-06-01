import { describe, expect, it } from 'vitest';
import { decodeConfig, encodeConfig } from './shareConfig';
import { configForTheme } from './previewConfig';
import { themes } from '../data/themes';
import { encodeToken } from '../lib/urlToken';

const cfg = { ...configForTheme(themes[0]!), hero: 'editorial' as const, sections: ['sec-pricing-tiers'] };

describe('shareConfig', () => {
  it('round-trips a valid PreviewConfig', () => {
    const token = encodeConfig(cfg);
    expect(token).toBeTruthy();
    expect(token).not.toMatch(/[+/=]/);
    expect(decodeConfig(token)).toEqual(cfg);
  });

  it('rejects missing, corrupt, or out-of-range configs', () => {
    expect(decodeConfig(null)).toBeNull();
    expect(decodeConfig('@@nope@@')).toBeNull();
    expect(decodeConfig(encodeToken({ hero: 'split' }))).toBeNull(); // missing fields
    expect(decodeConfig(encodeToken({ ...cfg, hero: 'bogus' }))).toBeNull(); // bad hero
    expect(decodeConfig(encodeToken({ ...cfg, motion: 'turbo' }))).toBeNull(); // bad motion
  });
});
