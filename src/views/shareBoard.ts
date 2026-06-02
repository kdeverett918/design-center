import type { PreviewConfig } from '../preview/previewConfig';
import { paletteById } from '../data/palettes';
import { fontPairingById } from '../data/fonts';
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
    // Tolerate older tokens that predate the animations field.
    return { ...p, animationIds: Array.isArray(p.animationIds) ? p.animationIds : [] } as ShareBoard;
  }
  return null;
}
