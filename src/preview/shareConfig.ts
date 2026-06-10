import type { PreviewConfig } from './previewConfig';
import {
  CARD_STYLES,
  FOOTER_VARIANTS,
  HERO_VARIANTS,
  INTENSITIES,
  NAV_VARIANTS,
  sanitizePreviewConfig,
} from './previewConfig';
import { decodeToken, encodeToken } from '../lib/urlToken';

const HERO = new Set<string>(HERO_VARIANTS.map((h) => h.id));
const CARD = new Set<string>(CARD_STYLES.map((c) => c.id));
const NAV = new Set<string>(NAV_VARIANTS.map((n) => n.id));
const FOOTER = new Set<string>(FOOTER_VARIANTS.map((f) => f.id));
const MOTION = new Set<string>(INTENSITIES);

// Encode a gallery preview's PreviewConfig for a shareable ?c= token.
export function encodeConfig(config: PreviewConfig): string {
  return encodeToken(config);
}

// Decode + validate a config token; null unless every field is a known value.
export function decodeConfig(param: string | null): PreviewConfig | null {
  const p = decodeToken(param) as Partial<PreviewConfig> | null;
  if (
    p &&
    typeof p === 'object' &&
    typeof p.hero === 'string' &&
    HERO.has(p.hero) &&
    typeof p.cardStyle === 'string' &&
    CARD.has(p.cardStyle) &&
    typeof p.nav === 'string' &&
    NAV.has(p.nav) &&
    typeof p.footer === 'string' &&
    FOOTER.has(p.footer) &&
    Array.isArray(p.sections) &&
    p.sections.every((s) => typeof s === 'string') &&
    typeof p.motion === 'string' &&
    MOTION.has(p.motion)
  ) {
    // Newer optional fields (e.g. scheme) default through the sanitizer so
    // tokens minted before they existed keep decoding.
    return sanitizePreviewConfig(p);
  }
  return null;
}
