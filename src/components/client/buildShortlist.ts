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
}

function addSection(lines: string[], title: string, count: number, items: string[]): void {
  if (count === 0) return;
  lines.push('', `${title} (${count})`, ...items);
}

export function buildShortlistText({ groups, count }: ShortlistInput): string {
  const itemLabel = count === 1 ? 'saved item' : 'saved items';
  const lines = ['DESIGN SHORTLIST', `${count} ${itemLabel}`];

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
      ];
    }),
  );

  addSection(
    lines,
    'Palettes',
    groups.palettes.length,
    groups.palettes.map(
      (palette) =>
        `- ${palette.name}${palette.isDark ? ' (dark)' : ''}: primary ${palette.colors.primary}, accent ${palette.colors.accent}, background ${palette.colors.background}`,
    ),
  );

  addSection(
    lines,
    'Fonts',
    groups.fonts.length,
    groups.fonts.flatMap((fonts) => [
      `- ${fonts.name}: ${fonts.heading.family} heading + ${fonts.body.family} body`,
      `  ${fonts.personality}`,
    ]),
  );

  addSection(
    lines,
    'Layouts',
    groups.layouts.length,
    groups.layouts.map((layout) => `- ${layout.name} (${layout.type}): ${layout.description}`),
  );

  addSection(
    lines,
    'Animations',
    groups.animations.length,
    groups.animations.map(
      (animation) =>
        `- ${animation.name} (${animation.category}, ${animation.intensity}): ${animation.effect}`,
    ),
  );

  return lines.join('\n');
}
