import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { FavoriteKind } from '../types';
import { FavoritesContext, favKey } from './favoritesContext';
import type { FavoritesApi } from './favoritesContext';

const STORAGE_KEY = 'dc:favorites:v1';

function loadKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((k): k is string => typeof k === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

export default function FavoritesProvider({ children }: { children: ReactNode }) {
  // Hydrate from localStorage so the shortlist survives refreshes.
  const [keys, setKeys] = useState<Set<string>>(loadKeys);

  // Persist on every change (writing storage is a side effect, not setState).
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...keys]));
    } catch {
      /* storage unavailable (private mode / SSR) — ignore */
    }
  }, [keys]);

  const has = useCallback(
    (kind: FavoriteKind, id: string) => keys.has(favKey(kind, id)),
    [keys],
  );

  const toggle = useCallback((kind: FavoriteKind, id: string) => {
    setKeys((prev) => {
      const next = new Set(prev);
      const k = favKey(kind, id);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }, []);

  const ids = useCallback(
    (kind: FavoriteKind) =>
      [...keys]
        .filter((k) => k.startsWith(`${kind}:`))
        .map((k) => k.slice(kind.length + 1)),
    [keys],
  );

  const clear = useCallback(() => setKeys(new Set()), []);

  const api = useMemo<FavoritesApi>(
    () => ({ has, toggle, ids, clear, count: keys.size }),
    [has, toggle, ids, clear, keys.size],
  );

  return <FavoritesContext.Provider value={api}>{children}</FavoritesContext.Provider>;
}
