import type { FontPairing, Palette, PaletteColors } from '../../types';
import type { PreviewConfig } from '../../preview/previewConfig';

export interface BriefInput {
  brand: string;
  themeName?: string;
  palette: Palette;
  fonts: FontPairing;
  config: PreviewConfig;
  notes?: string;
}

export const COLOR_ROLES: (keyof PaletteColors)[] = [
  'primary',
  'secondary',
  'accent',
  'ink',
  'muted',
  'surface',
  'background',
];

// Pure builder for the copyable design brief. Kept out of the component file so
// it can be unit-tested directly (and to satisfy react-refresh's
// only-export-components rule — components export only components).
export function buildBriefText(p: BriefInput): string {
  const lines = [
    `DESIGN BRIEF — ${p.brand}`,
    p.themeName ? `Theme: ${p.themeName}` : 'Theme: Custom mix',
    '',
    `Palette: ${p.palette.name}${p.palette.isDark ? ' (dark)' : ''}`,
    ...COLOR_ROLES.map((r) => `  ${r.padEnd(11)} ${p.palette.colors[r]}`),
    '',
    `Typography:`,
    `  Heading  ${p.fonts.heading.family} (${p.fonts.heading.weights.join('/')})`,
    `  Body     ${p.fonts.body.family} (${p.fonts.body.weights.join('/')})`,
    `  Pairing  ${p.fonts.name} — ${p.fonts.personality}`,
    '',
    `Layout:`,
    `  Hero     ${p.config.hero}`,
    `  Cards    ${p.config.cardStyle}`,
    `  Motion   ${p.config.motion}`,
  ];
  if (p.notes?.trim()) {
    lines.push('', 'Notes:', `  ${p.notes.trim()}`);
  }
  return lines.join('\n');
}
