import type { CSSProperties } from 'react';
import type { FontPairing, Palette } from '../types';
import { bestOn } from './contrast';

// Writes a palette + font pairing onto an element's CSS custom properties.
// Every token utility (text-ink, bg-surface, font-heading, …) reads these vars,
// so the subtree re-themes live. Scope it to a card root or the preview frame.
export function applyTheme(
  el: HTMLElement,
  palette: Palette,
  fonts: FontPairing,
): void {
  const c = palette.colors;
  el.style.setProperty('--color-primary', c.primary);
  el.style.setProperty('--color-secondary', c.secondary);
  el.style.setProperty('--color-accent', c.accent);
  el.style.setProperty('--color-ink', c.ink);
  el.style.setProperty('--color-muted', c.muted);
  el.style.setProperty('--color-surface', c.surface);
  el.style.setProperty('--color-bg', c.background);
  el.style.setProperty('--color-on-primary', bestOn(c.primary));
  el.style.setProperty('--color-on-accent', bestOn(c.accent));
  el.style.setProperty('--font-heading', `"${fonts.heading.family}", system-ui, sans-serif`);
  el.style.setProperty('--font-body', `"${fonts.body.family}", system-ui, sans-serif`);
  // Expose dark-ness for any conditional treatment (e.g. shadow strength).
  el.dataset.dark = palette.isDark ? 'true' : 'false';
}

// Color-only vars (palette swatches — fonts inherit the shell display face).
export function colorVars(palette: Palette): CSSProperties {
  const c = palette.colors;
  return {
    ['--color-primary' as string]: c.primary,
    ['--color-secondary' as string]: c.secondary,
    ['--color-accent' as string]: c.accent,
    ['--color-ink' as string]: c.ink,
    ['--color-muted' as string]: c.muted,
    ['--color-surface' as string]: c.surface,
    ['--color-bg' as string]: c.background,
    ['--color-on-primary' as string]: bestOn(c.primary),
    ['--color-on-accent' as string]: bestOn(c.accent),
  } as CSSProperties;
}

// Build inline style object form (useful for SSR-safe / declarative scoping).
export function themeVars(palette: Palette, fonts: FontPairing): CSSProperties {
  const c = palette.colors;
  return {
    ['--color-primary' as string]: c.primary,
    ['--color-secondary' as string]: c.secondary,
    ['--color-accent' as string]: c.accent,
    ['--color-ink' as string]: c.ink,
    ['--color-muted' as string]: c.muted,
    ['--color-surface' as string]: c.surface,
    ['--color-bg' as string]: c.background,
    ['--color-on-primary' as string]: bestOn(c.primary),
    ['--color-on-accent' as string]: bestOn(c.accent),
    ['--font-heading' as string]: `"${fonts.heading.family}", system-ui, sans-serif`,
    ['--font-body' as string]: `"${fonts.body.family}", system-ui, sans-serif`,
  } as CSSProperties;
}
