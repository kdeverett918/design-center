// =============================================================================
// Design Center — type system
//
// Two layers, kept separate on purpose:
//   1. The Library  — static curated content (this file's first interfaces).
//                     Lives in src/data/*. No database. Versioned, fast, free.
//   2. Selections   — what a client favorites / mixes / submits. The only thing
//                     that will ever touch a backend (Phase 3+). Typed here now.
// =============================================================================

export type Hex = `#${string}`;

export type Mood =
  | 'calm'
  | 'trustworthy'
  | 'warm'
  | 'bold'
  | 'premium'
  | 'playful'
  | 'minimal'
  | 'organic'
  | 'elegant'
  | 'energetic'
  | 'professional';

export type Industry =
  | 'healthcare'
  | 'wellness'
  | 'saas'
  | 'creative'
  | 'professional'
  | 'education'
  | 'ecommerce'
  | 'nonprofit';

export type AnimationIntensity = 'subtle' | 'standard' | 'expressive';

export type FontSource = 'google' | 'fontshare';

// ----- Palettes -------------------------------------------------------------

export interface PaletteColors {
  primary: Hex;
  secondary: Hex;
  accent: Hex;
  ink: Hex; // primary text (light text on dark palettes)
  muted: Hex; // secondary text / captions
  surface: Hex; // cards & raised sections
  background: Hex; // page background
}

export interface Palette {
  id: string;
  name: string;
  isDark: boolean;
  moods: Mood[];
  colors: PaletteColors;
}

// ----- Font pairings --------------------------------------------------------

export interface FontFace {
  family: string;
  source: FontSource;
  weights: number[];
}

export interface FontPairing {
  id: string;
  name: string;
  personality: string;
  goodFor: Industry[];
  heading: FontFace;
  body: FontFace;
}

// ----- Animations -----------------------------------------------------------

export type AnimationCategory =
  | 'entrance'
  | 'scroll'
  | 'hover'
  | 'cursor'
  | 'continuous'
  | 'transition';

export type AnimationLibrary =
  | 'framer-motion'
  | 'css'
  | 'intersection-observer'
  | 'view-transitions';

export interface AnimationPreset {
  id: string;
  name: string;
  category: AnimationCategory;
  effect: string;
  library: AnimationLibrary;
  durationMs: number; // 0 = scroll-driven / no fixed duration
  easing: string; // cubic-bezier, named easing, or "spring"
  intensity: AnimationIntensity;
}

// ----- Layouts --------------------------------------------------------------

export interface LayoutPreset {
  id: string;
  name: string;
  type: 'hero' | 'nav' | 'section' | 'card' | 'footer';
  description: string;
  previewKey: string; // maps to a sample component rendered in the preview
}

// ----- Themes (bundle palette + fonts + motion + layout defaults) -----------

export interface Theme {
  id: string;
  name: string;
  tagline: string;
  moods: Mood[];
  industries: Industry[];
  paletteId: string;
  fontPairingId: string;
  animationIntensity: AnimationIntensity;
  /**
   * Optional pre-generated hero background image (web-optimized .webp under
   * /theme-images/<id>.webp). Image-bearing hero variants (split / fullbleed /
   * showcase / overlap) render it behind a token-tint scrim; absent → the
   * existing CSS gradient. Themed only — the à-la-carte mixer stays gradient so
   * live re-theming is never broken by a fixed raster.
   */
  heroImage?: string;
}

// ----- Client selections (Phase 3+, typed now so seams stay clean) ----------

export type SelectionStatus =
  | 'browsing'
  | 'shortlisted'
  | 'submitted'
  | 'approved';

export interface ClientSelection {
  id: string;
  clientId: string;
  projectName: string;
  themeId?: string; // full theme...
  paletteId?: string; // ...or à-la-carte mix
  fontPairingId?: string;
  animationIntensity?: AnimationIntensity;
  selectedLayouts: string[];
  favorites: string[]; // ids of anything starred
  notes: string;
  status: SelectionStatus;
  createdAt: number;
  updatedAt: number;
}

// ----- Favorites (Phase 0/1 local-state shape) ------------------------------

export type FavoriteKind = 'theme' | 'palette' | 'font' | 'animation' | 'layout';

export interface FavoriteRef {
  kind: FavoriteKind;
  id: string;
}
