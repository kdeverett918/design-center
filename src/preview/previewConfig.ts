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
  | 'showcase'
  | 'overlap'
  | 'siderail';

export type CardStyle =
  | 'elevated'
  | 'bordered'
  | 'glass'
  | 'accentbar'
  | 'gradient'
  | 'inset';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

// Nav/footer are layout previewKeys (e.g. 'nav-sticky-clear', 'footer-minimal').
export type NavVariant = 'nav-sticky-clear' | 'nav-centered-logo';
export type FooterVariant = 'footer-minimal' | 'footer-mega' | 'footer-cta-band';

export interface PreviewConfig {
  hero: HeroVariant;
  cardStyle: CardStyle;
  /** Top-bar nav variant (sidebar isn't a marketing-page nav). */
  nav: NavVariant;
  /** Footer variant. */
  footer: FooterVariant;
  /** Extra sections (by layout previewKey) inserted after the feature cards. */
  sections: string[];
  motion: AnimationIntensity;
}

export const NAV_VARIANTS: { id: NavVariant; label: string }[] = [
  { id: 'nav-sticky-clear', label: 'Sticky' },
  { id: 'nav-centered-logo', label: 'Centered' },
];

export const FOOTER_VARIANTS: { id: FooterVariant; label: string }[] = [
  { id: 'footer-minimal', label: 'Minimal' },
  { id: 'footer-mega', label: 'Mega' },
  { id: 'footer-cta-band', label: 'CTA band' },
];

// Default sections inserted into a fresh preview (reproduces the classic page).
const DEFAULT_SECTIONS = ['sec-stats-band', 'sec-testimonial-slider'];

export const HERO_VARIANTS: { id: HeroVariant; label: string }[] = [
  { id: 'split', label: 'Split' },
  { id: 'centered', label: 'Centered' },
  { id: 'fullbleed', label: 'Full-bleed' },
  { id: 'gradient-mesh', label: 'Gradient mesh' },
  { id: 'typeonly', label: 'Type-only' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'overlap', label: 'Overlap' },
  { id: 'siderail', label: 'Side rail' },
];

export const CARD_STYLES: { id: CardStyle; label: string }[] = [
  { id: 'elevated', label: 'Elevated' },
  { id: 'bordered', label: 'Bordered' },
  { id: 'glass', label: 'Glass' },
  { id: 'accentbar', label: 'Accent bar' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'inset', label: 'Inset' },
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
  bisque: { hero: 'siderail', cardStyle: 'inset' },
  voltage: { hero: 'overlap', cardStyle: 'accentbar' },
  claret: { hero: 'editorial', cardStyle: 'inset' },
  teahouse: { hero: 'siderail', cardStyle: 'bordered' },
  tundra: { hero: 'overlap', cardStyle: 'glass' },
  caravan: { hero: 'split', cardStyle: 'inset' },
};

const HERO_IDS = new Set<string>(HERO_VARIANTS.map((h) => h.id));
const CARD_IDS = new Set<string>(CARD_STYLES.map((c) => c.id));
const NAV_IDS = new Set<string>(NAV_VARIANTS.map((n) => n.id));
const FOOTER_IDS = new Set<string>(FOOTER_VARIANTS.map((f) => f.id));

// Map a single-select layout previewKey (hero / card / nav / footer) to a
// PreviewConfig patch. Sections are multi-select (toggled), so they return null
// here and are handled by the caller. Also null for non-applicable layouts
// (e.g. nav-sidebar — a dashboard pattern, not a marketing-page nav).
export function layoutToConfig(previewKey: string): Partial<PreviewConfig> | null {
  if (previewKey.startsWith('hero-')) {
    const v = previewKey.slice(5);
    return HERO_IDS.has(v) ? { hero: v as HeroVariant } : null;
  }
  if (previewKey.startsWith('card-')) {
    const v = previewKey.slice(5);
    return CARD_IDS.has(v) ? { cardStyle: v as CardStyle } : null;
  }
  if (previewKey.startsWith('nav-')) {
    return NAV_IDS.has(previewKey) ? { nav: previewKey as NavVariant } : null;
  }
  if (previewKey.startsWith('footer-')) {
    return FOOTER_IDS.has(previewKey) ? { footer: previewKey as FooterVariant } : null;
  }
  return null;
}

export function configForTheme(theme: Theme): PreviewConfig {
  const d = THEME_DEFAULTS[theme.id] ?? {};
  return {
    hero: d.hero ?? 'split',
    cardStyle: d.cardStyle ?? 'elevated',
    nav: 'nav-sticky-clear',
    footer: 'footer-minimal',
    sections: [...DEFAULT_SECTIONS],
    motion: theme.animationIntensity,
  };
}
