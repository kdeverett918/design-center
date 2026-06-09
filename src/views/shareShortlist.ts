import type { FavoriteKind } from '../types';
import { themeById } from '../data/themes';
import { paletteById } from '../data/palettes';
import { fontPairingById } from '../data/fonts';
import { animationById } from '../data/animations';
import { layoutById } from '../data/layouts';
import { decodeToken, encodeToken } from '../lib/urlToken';

export interface SharedShortlist {
  keys: string[];
  notes: Record<string, string>;
}

const RESOLVERS: Record<FavoriteKind, (id: string) => unknown> = {
  theme: themeById,
  palette: paletteById,
  font: fontPairingById,
  animation: animationById,
  layout: layoutById,
};

function isValidKey(key: unknown): key is string {
  if (typeof key !== 'string') return false;
  const i = key.indexOf(':');
  if (i <= 0) return false;
  const kind = key.slice(0, i) as FavoriteKind;
  const resolve = RESOLVERS[kind];
  return Boolean(resolve && resolve(key.slice(i + 1)));
}

// Encode the ordered shortlist (+ notes) into a compact ?s= token.
export function encodeShortlist(entries: { key: string; note: string }[]): string {
  const notes: Record<string, string> = {};
  for (const e of entries) if (e.note) notes[e.key] = e.note;
  return encodeToken({ keys: entries.map((e) => e.key), notes });
}

// Decode + validate; drops keys that no longer resolve against the library.
// Returns null when nothing usable survives (corrupt/empty/stale token).
export function decodeShortlist(param: string | null): SharedShortlist | null {
  const p = decodeToken(param) as Partial<SharedShortlist> | null;
  if (!p || !Array.isArray(p.keys)) return null;
  const keys = p.keys.filter(isValidKey);
  if (keys.length === 0) return null;
  const notes: Record<string, string> = {};
  if (p.notes && typeof p.notes === 'object') {
    for (const k of keys) {
      const n = (p.notes as Record<string, unknown>)[k];
      if (typeof n === 'string' && n) notes[k] = n;
    }
  }
  return { keys, notes };
}
