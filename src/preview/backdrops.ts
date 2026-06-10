import type { Mood, Palette } from '../types';

// =============================================================================
// Backdrops — creative hero imagery for the mixer. Two kinds behind one
// control: AI-generated mood images (pre-built webp in /preview-images) and
// SVG patterns generated at runtime FROM THE PALETTE'S OWN TOKENS (returned as
// data-URIs, so they flow through the existing heroImage pipeline and re-theme
// live). 'auto' picks an image by the palette's moods; explicit theme hero art
// always wins over backdrops (PreviewFrame only consults this when no
// heroImage was supplied).
// =============================================================================

export interface BackdropImage {
  id: string;
  label: string;
  moods: Mood[];
}

export const BACKDROP_IMAGES: BackdropImage[] = [
  { id: 'calm-water', label: 'Calm water', moods: ['calm', 'trustworthy', 'minimal'] },
  { id: 'organic-botanical', label: 'Botanical', moods: ['organic', 'calm'] },
  { id: 'bold-geometry', label: 'Bold shapes', moods: ['bold', 'energetic'] },
  { id: 'luxe-texture', label: 'Silk', moods: ['premium', 'elegant'] },
  { id: 'playful-shapes', label: 'Confetti', moods: ['playful'] },
  { id: 'tech-grid', label: 'Tech grid', moods: ['professional', 'minimal', 'bold'] },
  { id: 'warm-craft', label: 'Crafted linen', moods: ['warm', 'organic'] },
  { id: 'editorial-paper', label: 'Paper study', moods: ['minimal', 'professional'] },
  { id: 'neon-retro', label: 'Neon horizon', moods: ['bold', 'energetic', 'playful'] },
  { id: 'spa-stone', label: 'River stones', moods: ['calm', 'organic', 'elegant'] },
  { id: 'structured-arch', label: 'Architecture', moods: ['professional', 'minimal', 'premium'] },
  { id: 'kinetic-energy', label: 'Light trails', moods: ['energetic', 'bold'] },
];

export const PATTERN_IDS = ['pattern-dots', 'pattern-waves', 'pattern-blobs', 'pattern-grid'] as const;
export type PatternId = (typeof PATTERN_IDS)[number];

export const BACKDROP_OPTIONS: { id: string; label: string }[] = [
  { id: 'auto', label: 'auto' },
  { id: 'none', label: 'none' },
  ...BACKDROP_IMAGES.map((b) => ({ id: b.id, label: b.label })),
  { id: 'pattern-dots', label: 'Dots' },
  { id: 'pattern-waves', label: 'Waves' },
  { id: 'pattern-blobs', label: 'Blobs' },
  { id: 'pattern-grid', label: 'Grid' },
];
export const BACKDROP_IDS = new Set(BACKDROP_OPTIONS.map((o) => o.id));

const imageUrl = (id: string) => `/preview-images/${id}.webp`;

// Token-tinted SVG patterns, emitted as data-URIs so they ride the heroImage
// pipeline and recolor instantly when the palette changes.
function patternSvg(id: PatternId, p: Palette): string {
  const { primary, secondary, accent, surface } = p.colors;
  let body: string;
  if (id === 'pattern-dots') {
    body = `<defs><pattern id="d" width="46" height="46" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="5" fill="${primary}"/><circle cx="33" cy="33" r="5" fill="${accent}"/>
    </pattern></defs><rect width="100%" height="100%" fill="${surface}"/><rect width="100%" height="100%" fill="url(#d)" opacity="0.55"/>`;
  } else if (id === 'pattern-waves') {
    const wave = (y: number, c: string, o: number) =>
      `<path d="M0 ${y} Q 200 ${y - 80} 400 ${y} T 800 ${y} T 1200 ${y} T 1600 ${y} V 900 H 0 Z" fill="${c}" opacity="${o}"/>`;
    body = `<rect width="100%" height="100%" fill="${surface}"/>${wave(560, secondary, 0.5)}${wave(640, primary, 0.6)}${wave(740, accent, 0.55)}`;
  } else if (id === 'pattern-blobs') {
    body = `<rect width="100%" height="100%" fill="${surface}"/>
      <circle cx="320" cy="240" r="300" fill="${primary}" opacity="0.4"/>
      <circle cx="1240" cy="220" r="260" fill="${accent}" opacity="0.35"/>
      <circle cx="820" cy="720" r="340" fill="${secondary}" opacity="0.38"/>`;
  } else {
    body = `<defs><pattern id="g" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M 64 0 L 0 0 0 64" fill="none" stroke="${primary}" stroke-width="1.5" opacity="0.5"/>
    </pattern></defs><rect width="100%" height="100%" fill="${surface}"/><rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="1180" cy="280" r="180" fill="${accent}" opacity="0.3"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">${body}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Stable mood-matched image pick (hash-rotated so equal scores still vary).
export function backdropForPalette(p: Palette): string {
  let best: BackdropImage[] = [];
  let bestScore = 0;
  for (const b of BACKDROP_IMAGES) {
    const score = b.moods.filter((m) => p.moods.includes(m)).length;
    if (score > bestScore) {
      bestScore = score;
      best = [b];
    } else if (score === bestScore && score > 0) {
      best.push(b);
    }
  }
  if (best.length === 0) return imageUrl('editorial-paper');
  let hash = 0;
  for (const ch of p.id) hash = (hash * 33 + ch.charCodeAt(0)) % 991;
  return imageUrl(best[hash % best.length]!.id);
}

/** Resolve a backdrop setting into a heroImage URL (or undefined for none). */
export function resolveBackdropImage(backdrop: string, palette: Palette): string | undefined {
  if (backdrop === 'none') return undefined;
  if (backdrop === 'auto') return backdropForPalette(palette);
  if ((PATTERN_IDS as readonly string[]).includes(backdrop)) {
    return patternSvg(backdrop as PatternId, palette);
  }
  if (BACKDROP_IMAGES.some((b) => b.id === backdrop)) return imageUrl(backdrop);
  return undefined;
}
