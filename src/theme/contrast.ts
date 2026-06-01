import type { Hex } from '../types';

// WCAG relative-luminance + contrast helpers. Used both to pick a legible
// "on-primary" text color per palette and by the contrast audit tests.

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// Near-black and near-white candidates for text that sits on a colored surface.
const ON_DARK: Hex = '#10131a';
const ON_LIGHT: Hex = '#ffffff';

// Pick whichever of near-black / white is more legible on the given background.
export function bestOn(bg: string): Hex {
  return contrastRatio(bg, ON_DARK) >= contrastRatio(bg, ON_LIGHT) ? ON_DARK : ON_LIGHT;
}
