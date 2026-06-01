import { createContext, useContext } from 'react';
import type { FavoriteKind } from '../types';

export interface FavoritesApi {
  has: (kind: FavoriteKind, id: string) => boolean;
  toggle: (kind: FavoriteKind, id: string) => void;
  count: number;
  ids: (kind: FavoriteKind) => string[];
}

export const FavoritesContext = createContext<FavoritesApi | null>(null);

// Phase 0/1: favorites live in local React state. The context boundary means we
// can swap the implementation to Firestore later without touching any card UI.
export function useFavorites(): FavoritesApi {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within <FavoritesProvider>');
  return ctx;
}

export const favKey = (kind: FavoriteKind, id: string): string => `${kind}:${id}`;
