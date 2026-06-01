import type { PreviewConfig } from '../preview/previewConfig';
import { paletteById } from '../data/palettes';
import { fontPairingById } from '../data/fonts';

export interface ShareBoard {
  paletteId: string;
  fontId: string;
  config: PreviewConfig;
  brand: string;
  notes: string;
}

const toUrlSafe = (b64: string): string =>
  b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const fromUrlSafe = (s: string): string => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
  return b64 + pad;
};

// Encode the full mood-board into a compact URL-safe token (?b=...).
export function encodeBoard(board: ShareBoard): string {
  try {
    return toUrlSafe(btoa(encodeURIComponent(JSON.stringify(board))));
  } catch {
    return '';
  }
}

// Decode + validate a share token; null if missing/corrupt or it references a
// palette/font that no longer exists.
export function decodeBoard(param: string | null): ShareBoard | null {
  if (!param) return null;
  try {
    const json = decodeURIComponent(atob(fromUrlSafe(param)));
    const p = JSON.parse(json);
    if (
      p &&
      typeof p === 'object' &&
      p.config &&
      typeof p.brand === 'string' &&
      paletteById(p.paletteId) &&
      fontPairingById(p.fontId)
    ) {
      return p as ShareBoard;
    }
  } catch {
    /* ignore */
  }
  return null;
}
