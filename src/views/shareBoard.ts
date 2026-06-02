import type { PreviewConfig } from '../preview/previewConfig';
import { sanitizePreviewConfig } from '../preview/previewConfig';
import { paletteById } from '../data/palettes';
import { fontPairingById } from '../data/fonts';
import { animationById } from '../data/animations';
import { decodeToken, encodeToken } from '../lib/urlToken';

export interface ShareBoard {
  paletteId: string;
  fontId: string;
  config: PreviewConfig;
  brand: string;
  notes: string;
  animationIds: string[];
}

// Encode the full mood-board into a compact URL-safe token (?b=...).
export function encodeBoard(board: ShareBoard): string {
  return encodeToken(board);
}

// Decode + validate a share token; null if missing/corrupt or it references a
// palette/font that no longer exists.
export function decodeBoard(param: string | null): ShareBoard | null {
  const p = decodeToken(param) as Partial<ShareBoard> | null;
  if (
    p &&
    typeof p === 'object' &&
    p.config &&
    typeof p.brand === 'string' &&
    p.paletteId &&
    p.fontId &&
    paletteById(p.paletteId) &&
    fontPairingById(p.fontId)
  ) {
    // Validate against the current schema: merge the config onto defaults and
    // drop any animation ids that no longer resolve (legacy/tampered tokens).
    return {
      ...p,
      config: sanitizePreviewConfig(p.config),
      animationIds: Array.isArray(p.animationIds)
        ? p.animationIds.filter((id) => typeof id === 'string' && animationById(id))
        : [],
    } as ShareBoard;
  }
  return null;
}
