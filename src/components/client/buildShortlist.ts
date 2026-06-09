import type {
  AnimationPreset,
  FontPairing,
  LayoutPreset,
  Palette,
  Theme,
} from '../../types';
import { fontPairingById } from '../../data/fonts';
import { paletteById } from '../../data/palettes';

export interface ShortlistGroups {
  themes: Theme[];
  palettes: Palette[];
  fonts: FontPairing[];
  layouts: LayoutPreset[];
  animations: AnimationPreset[];
}

export interface ShortlistInput {
  groups: ShortlistGroups;
  count: number;
  /** Per-favorite client notes keyed by 'kind:id'. */
  notes?: Record<string, string>;
}

function addSection(lines: string[], title: string, count: number, items: string[]): void {
  if (count === 0) return;
  lines.push('', `${title} (${count})`, ...items);
}

export function buildShortlistText({ groups, count, notes }: ShortlistInput): string {
  const itemLabel = count === 1 ? 'saved item' : 'saved items';
  const lines = ['DESIGN SHORTLIST', `${count} ${itemLabel}`];
  // The client's own words travel with each item — the most valuable line in
  // the whole email.
  const noteLine = (kind: string, id: string): string[] => {
    const n = notes?.[`${kind}:${id}`];
    return n ? [`  Client note: ${n}`] : [];
  };

  addSection(
    lines,
    'Themes',
    groups.themes.length,
    groups.themes.flatMap((theme) => {
      const palette = paletteById(theme.paletteId)?.name ?? theme.paletteId;
      const fonts = fontPairingById(theme.fontPairingId)?.name ?? theme.fontPairingId;
      return [
        `- ${theme.name}: ${theme.tagline}`,
        `  Palette: ${palette}`,
        `  Fonts: ${fonts}`,
        `  Motion: ${theme.animationIntensity}`,
        ...noteLine('theme', theme.id),
      ];
    }),
  );

  addSection(
    lines,
    'Palettes',
    groups.palettes.length,
    groups.palettes.flatMap((palette) => [
      `- ${palette.name}${palette.isDark ? ' (dark)' : ''}: primary ${palette.colors.primary}, accent ${palette.colors.accent}, background ${palette.colors.background}`,
      ...noteLine('palette', palette.id),
    ]),
  );

  addSection(
    lines,
    'Fonts',
    groups.fonts.length,
    groups.fonts.flatMap((fonts) => [
      `- ${fonts.name}: ${fonts.heading.family} heading + ${fonts.body.family} body`,
      `  ${fonts.personality}`,
      ...noteLine('font', fonts.id),
    ]),
  );

  addSection(
    lines,
    'Layouts',
    groups.layouts.length,
    groups.layouts.flatMap((layout) => [
      `- ${layout.name} (${layout.type}): ${layout.description}`,
      ...noteLine('layout', layout.id),
    ]),
  );

  addSection(
    lines,
    'Animations',
    groups.animations.length,
    groups.animations.flatMap((animation) => [
      `- ${animation.name} (${animation.category}, ${animation.intensity}): ${animation.effect}`,
      ...noteLine('animation', animation.id),
    ]),
  );

  return lines.join('\n');
}
