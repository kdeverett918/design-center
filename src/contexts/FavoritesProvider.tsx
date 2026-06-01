import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { FavoriteKind } from '../types';
import { FavoritesContext, favKey } from './favoritesContext';
import type { FavoritesApi } from './favoritesContext';

export default function FavoritesProvider({ children }: { children: ReactNode }) {
  const [keys, setKeys] = useState<Set<string>>(() => new Set());

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
