import type { FontPairing, Palette, PaletteColors } from '../../types';
import type { PreviewConfig } from '../../preview/previewConfig';
import { layoutById } from '../../data/layouts';
import { animationById } from '../../data/animations';

const layoutName = (previewKey: string): string => layoutById(previewKey)?.name ?? previewKey;
const animationName = (id: string): string => animationById(id)?.name ?? id;

export interface BriefInput {
  brand: string;
  themeName?: string;
  palette: Palette;
  fonts: FontPairing;
  config: PreviewConfig;
  notes?: string;
  animationIds?: string[];
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
    `  Nav      ${layoutName(p.config.nav)}`,
    `  Footer   ${layoutName(p.config.footer)}`,
    `  Sections ${p.config.sections.length ? p.config.sections.map(layoutName).join(', ') : 'none'}`,
    `  Motion   ${p.config.motion}`,
    `  Mode     ${p.config.scheme === 'auto' ? 'as designed' : `${p.config.scheme} variant (derived)`}`,
    '',
    `Motion & effects:`,
    ...(p.animationIds?.length
      ? p.animationIds.map((id) => `  ${animationName(id)}`)
      : ['  none']),
  ];
  if (p.notes?.trim()) {
    lines.push('', 'Notes:', `  ${p.notes.trim()}`);
  }
  return lines.join('\n');
}
