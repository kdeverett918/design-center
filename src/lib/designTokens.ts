// =============================================================================
// Design tokens export — pure string builders.
//
// Turns a (palette, fonts, config) selection into copy-pasteable artifacts:
//   - toCssVars  → a `:root { ... }` custom-property block
//   - toJson     → a portable design-token JSON document
//   - toTailwind → a `theme.extend` snippet for tailwind.config.js
//
// No React, no I/O, no runtime imports — just deterministic strings.
// =============================================================================

import type { FontPairing, Palette } from '../types';
import type { PreviewConfig } from '../preview/previewConfig';

// Deterministic color order shared by every exporter.
const COLOR_KEYS = [
  'primary',
  'secondary',
  'accent',
  'ink',
  'muted',
  'surface',
  'background',
] as const;

/**
 * A `:root { ... }` CSS block exposing the palette + fonts as custom
 * properties. Two-space indented, one declaration per line.
 */
export function toCssVars(palette: Palette, fonts: FontPairing): string {
  const lines = COLOR_KEYS.map(
    (key) => `  --color-${key}: ${palette.colors[key]};`,
  );
  lines.push(`  --font-heading: "${fonts.heading.family}", sans-serif;`);
  lines.push(`  --font-body: "${fonts.body.family}", sans-serif;`);
  return `:root {\n${lines.join('\n')}\n}`;
}

/**
 * A pretty-printed JSON design-token document combining the palette, the
 * typography pairing, and the preview layout config.
 */
export function toJson(
  palette: Palette,
  fonts: FontPairing,
  config: PreviewConfig,
): string {
  const colors: Record<string, string> = {};
  for (const key of COLOR_KEYS) {
    colors[key] = palette.colors[key];
  }
  const doc = {
    name: palette.name,
    colors,
    typography: {
      heading: { family: fonts.heading.family, weights: fonts.heading.weights },
      body: { family: fonts.body.family, weights: fonts.body.weights },
      pairing: fonts.name,
    },
    layout: {
      hero: config.hero,
      cardStyle: config.cardStyle,
      nav: config.nav,
      footer: config.footer,
      sections: config.sections,
      motion: config.motion,
    },
  };
  return JSON.stringify(doc, null, 2);
}

/**
 * A `theme.extend` snippet (valid-looking JS) for tailwind.config.js, mapping
 * the palette to `colors` and the pairing to `fontFamily`.
 */
export function toTailwind(palette: Palette, fonts: FontPairing): string {
  const colorLines = COLOR_KEYS.map(
    (key) => `      ${key}: '${palette.colors[key]}',`,
  ).join('\n');
  return [
    'theme: {',
    '  extend: {',
    '    colors: {',
    colorLines,
    '    },',
    '    fontFamily: {',
    `      heading: ['${fonts.heading.family}', 'sans-serif'],`,
    `      body: ['${fonts.body.family}', 'sans-serif'],`,
    '    },',
    '  },',
    '},',
  ].join('\n');
}
