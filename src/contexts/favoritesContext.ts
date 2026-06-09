import { createContext, useContext } from 'react';
import type { FavoriteKind } from '../types';

export interface FavoritesApi {
  has: (kind: FavoriteKind, id: string) => boolean;
  toggle: (kind: FavoriteKind, id: string) => void;
  clear: () => void;
  count: number;
  /** Ordered ids for one kind (insertion order, user-reorderable). */
  ids: (kind: FavoriteKind) => string[];
  /** The client's note on a favorite ('' when none). */
  note: (kind: FavoriteKind, id: string) => string;
  setNote: (kind: FavoriteKind, id: string, note: string) => void;
  /** Move a favorite one slot up (-1) or down (+1) within its kind. */
  move: (kind: FavoriteKind, id: string, delta: -1 | 1) => void;
  /** Merge a shared shortlist: append unseen keys (with optional notes). */
  addMany: (keys: string[], notes?: Record<string, string>) => void;
  /** Raw ordered keys + notes — used to build share links. */
  entries: { key: string; note: string }[];
}

export const FavoritesContext = createContext<FavoritesApi | null>(null);

// Favorites are local-first (localStorage) by design — the Design Center has no
// sign-in. The context boundary still isolates storage from all card UI.
export function useFavorites(): FavoritesApi {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within <FavoritesProvider>');
  return ctx;
}

export const favKey = (kind: FavoriteKind, id: string): string => `${kind}:${id}`;
