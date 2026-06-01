import type { AnimationIntensity, Theme } from '../types';

// The shape of a live preview: which hero, which card style, how much motion.
// Drives both the theme presets and the à-la-carte mood board.

export type HeroVariant =
  | 'split'
  | 'centered'
  | 'fullbleed'
  | 'gradient-mesh'
  | 'typeonly'
  | 'editorial'
  | 'showcase';

export type CardStyle = 'elevated' | 'bordered' | 'glass' | 'accentbar' | 'gradient';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export interface PreviewConfig {
  hero: HeroVariant;
  cardStyle: CardStyle;
  motion: AnimationIntensity;
}

export const HERO_VARIANTS: { id: HeroVariant; label: string }[] = [
  { id: 'split', label: 'Split' },
  { id: 'centered', label: 'Centered' },
  { id: 'fullbleed', label: 'Full-bleed' },
  { id: 'gradient-mesh', label: 'Gradient mesh' },
  { id: 'typeonly', label: 'Type-only' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'showcase', label: 'Showcase' },
];

export const CARD_STYLES: { id: CardStyle; label: string }[] = [
  { id: 'elevated', label: 'Elevated' },
  { id: 'bordered', label: 'Bordered' },
  { id: 'glass', label: 'Glass' },
  { id: 'accentbar', label: 'Accent bar' },
  { id: 'gradient', label: 'Gradient' },
];

export const INTENSITIES: AnimationIntensity[] = ['subtle', 'standard', 'expressive'];

// Sensible per-theme defaults so each preset opens with a fitting layout.
const THEME_DEFAULTS: Record<string, Partial<PreviewConfig>> = {
  stillwater: { hero: 'split', cardStyle: 'elevated' },
  vital: { hero: 'centered', cardStyle: 'accentbar' },
  haven: { hero: 'fullbleed', cardStyle: 'bordered' },
  quietude: { hero: 'split', cardStyle: 'elevated' },
  dispatch: { hero: 'typeonly', cardStyle: 'bordered' },
  launchpad: { hero: 'gradient-mesh', cardStyle: 'glass' },
  obsidian: { hero: 'fullbleed', cardStyle: 'glass' },
  joyride: { hero: 'gradient-mesh', cardStyle: 'accentbar' },
  terracotta: { hero: 'fullbleed', cardStyle: 'bordered' },
  frost: { hero: 'centered', cardStyle: 'elevated' },
  meadow: { hero: 'split', cardStyle: 'bordered' },
  velvet: { hero: 'editorial', cardStyle: 'gradient' },
  keystone: { hero: 'showcase', cardStyle: 'accentbar' },
  sunbeam: { hero: 'gradient-mesh', cardStyle: 'gradient' },
  inferno: { hero: 'fullbleed', cardStyle: 'glass' },
  onyx: { hero: 'showcase', cardStyle: 'glass' },
};

export function configForTheme(theme: Theme): PreviewConfig {
  const d = THEME_DEFAULTS[theme.id] ?? {};
  return {
    hero: d.hero ?? 'split',
    cardStyle: d.cardStyle ?? 'elevated',
    motion: theme.animationIntensity,
  };
}
