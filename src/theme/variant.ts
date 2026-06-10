import type { Hex, Palette, PaletteColors } from '../types';
import { bestOn, contrastRatio } from './contrast';

// =============================================================================
// Per-design light/dark variants.
//
// Every palette in the library is hand-curated as EITHER light or dark. This
// module derives the opposite-mode rendition at runtime so any design can be
// previewed "with dark mode on" (or a dark design in daylight):
//   - neutrals flip (background/surface/ink/muted) while keeping the palette's
//     chromatic character via a hue seed,
//   - brand roles (primary/secondary/accent) keep their HUE and walk their
//     lightness until they pass the same WCAG bars the base palettes are
//     tested against.
// Derived palettes are cached per source id and never persisted — the stored
// bit is the preview's `scheme` setting; resolution happens at render time.
// =============================================================================

export type PreviewScheme = 'auto' | 'light' | 'dark';

interface Hsl {
  h: number; // 0–360
  s: number; // 0–1
  l: number; // 0–1
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function hexToHsl(hex: string): Hsl {
  const raw = hex.replace('#', '');
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return { h, s, l };
}

export function hslToHex({ h, s, l }: Hsl): Hex {
  const hue2rgb = (p: number, q: number, t: number) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hn = ((h % 360) + 360) % 360 / 360;
    r = hue2rgb(p, q, hn + 1 / 3);
    g = hue2rgb(p, q, hn);
    b = hue2rgb(p, q, hn - 1 / 3);
  }
  const toHex = (v: number) => Math.round(clamp(v, 0, 1) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}` as Hex;
}

// Walk lightness until the candidate clears `target` contrast against every
// background. The neutral bounds we pick for bg/surface make the rail
// fallbacks (#fff / #10131a) provably sufficient, so this always terminates
// with a passing color.
function tuneText(
  seed: Hsl,
  against: string[],
  target: number,
  dir: 'lighten' | 'darken',
): Hex {
  const { h } = seed;
  let { s, l } = seed;
  for (let i = 0; i < 90; i++) {
    const cur = hslToHex({ h, s, l });
    if (against.every((b) => contrastRatio(cur, b) >= target)) return cur;
    l = dir === 'lighten' ? Math.min(1, l + 0.01) : Math.max(0, l - 0.01);
    if (l === 1 || l === 0) s = Math.max(0, s - 0.1);
  }
  return dir === 'lighten' ? ('#ffffff' as Hex) : ('#10131a' as Hex);
}

// Brand roles keep their hue; lightness walks out of the mid-luminance dead
// zone (where neither white nor near-black text reaches 4.5:1) in the
// direction that suits the new mode, and stays visible against the page.
function tuneRole(hex: string, toDark: boolean, bg: string): Hex {
  const { h } = hexToHsl(hex);
  let { s, l } = hexToHsl(hex);
  for (let i = 0; i < 70; i++) {
    const cur = hslToHex({ h, s, l });
    if (contrastRatio(bestOn(cur), cur) >= 4.5 && contrastRatio(cur, bg) >= 1.6) return cur;
    l = clamp(l + (toDark ? 0.015 : -0.015), 0.02, 0.98);
    if (l === 0.98 || l === 0.02) s = Math.max(0, s - 0.05);
  }
  return hslToHex({ h, s, l });
}

function deriveVariant(p: Palette): Palette {
  const toDark = !p.isDark;
  // Keep the palette's chromatic character: seed neutral hues from the
  // original background when it carries tint, else from the primary.
  const bgHsl = hexToHsl(p.colors.background);
  const seedH = bgHsl.s > 0.06 ? bgHsl.h : hexToHsl(p.colors.primary).h;
  const seedS = Math.max(bgHsl.s, 0.04);

  const background = toDark
    ? hslToHex({ h: seedH, s: Math.min(seedS * 0.6, 0.22), l: 0.09 })
    : hslToHex({ h: seedH, s: Math.min(seedS, 0.08), l: 0.985 });
  const surface = toDark
    ? hslToHex({ h: seedH, s: Math.min(seedS * 0.6, 0.22), l: 0.14 })
    : hslToHex({ h: seedH, s: Math.min(seedS, 0.12), l: 0.945 });

  const textDir = toDark ? 'lighten' : 'darken';
  const ink = tuneText(
    { h: seedH, s: 0.1, l: toDark ? 0.95 : 0.13 },
    [background, surface],
    4.5,
    textDir,
  );
  const muted = tuneText(
    { h: seedH, s: 0.14, l: toDark ? 0.7 : 0.42 },
    [background, surface],
    3.0,
    textDir,
  );

  const colors: PaletteColors = {
    background,
    surface,
    ink,
    muted,
    primary: tuneRole(p.colors.primary, toDark, background),
    secondary: tuneRole(p.colors.secondary, toDark, background),
    accent: tuneRole(p.colors.accent, toDark, background),
  };

  return {
    id: `${p.id}:${toDark ? 'dark' : 'light'}`,
    name: `${p.name} (${toDark ? 'Dark' : 'Light'})`,
    isDark: toDark,
    moods: p.moods,
    blurb: p.blurb,
    colors,
  };
}

const cache = new Map<string, Palette>();

/** Derived opposite-mode rendition of a palette (memoized per source id). */
export function paletteVariant(p: Palette): Palette {
  const hit = cache.get(p.id);
  if (hit) return hit;
  const v = deriveVariant(p);
  cache.set(p.id, v);
  return v;
}

/** Resolve the palette a preview should render for the chosen scheme. */
export function resolvePalette(p: Palette, scheme: PreviewScheme): Palette {
  if (scheme === 'auto' || (scheme === 'dark') === p.isDark) return p;
  return paletteVariant(p);
}
