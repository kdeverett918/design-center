import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { FavoriteKind } from '../types';
import { FavoritesContext, favKey } from './favoritesContext';
import type { FavoritesApi } from './favoritesContext';

// v2 stores an ORDERED array of { k: 'kind:id', n: note } so the shortlist can
// be reordered and annotated. v1 (a plain array of 'kind:id' strings) is
// migrated transparently on first load and left in place as a fallback.
const STORAGE_KEY = 'dc:favorites:v2';
const LEGACY_KEY = 'dc:favorites:v1';

export interface FavoriteEntry {
  key: string;
  note: string;
}

function loadEntries(): FavoriteEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((e): e is { k: string; n?: string } => Boolean(e) && typeof e.k === 'string')
          .map((e) => ({ key: e.k, note: typeof e.n === 'string' ? e.n : '' }));
      }
      return [];
    }
    // Migrate a v1 shortlist (unordered keys, no notes).
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((k): k is string => typeof k === 'string')
          .map((key) => ({ key, note: '' }));
      }
    }
  } catch {
    /* storage unavailable or corrupt — start clean */
  }
  return [];
}

export default function FavoritesProvider({ children }: { children: ReactNode }) {
  // Hydrate from localStorage so the shortlist survives refreshes.
  const [entries, setEntries] = useState<FavoriteEntry[]>(loadEntries);

  // Persist on every change (writing storage is a side effect, not setState).
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entries.map((e) => (e.note ? { k: e.key, n: e.note } : { k: e.key }))),
      );
    } catch {
      /* storage unavailable (private mode / SSR) — ignore */
    }
  }, [entries]);

  const has = useCallback(
    (kind: FavoriteKind, id: string) => entries.some((e) => e.key === favKey(kind, id)),
    [entries],
  );

  const toggle = useCallback((kind: FavoriteKind, id: string) => {
    const k = favKey(kind, id);
    setEntries((prev) =>
      prev.some((e) => e.key === k) ? prev.filter((e) => e.key !== k) : [...prev, { key: k, note: '' }],
    );
  }, []);

  const ids = useCallback(
    (kind: FavoriteKind) =>
      entries.filter((e) => e.key.startsWith(`${kind}:`)).map((e) => e.key.slice(kind.length + 1)),
    [entries],
  );

  const note = useCallback(
    (kind: FavoriteKind, id: string) => entries.find((e) => e.key === favKey(kind, id))?.note ?? '',
    [entries],
  );

  const setNote = useCallback((kind: FavoriteKind, id: string, value: string) => {
    const k = favKey(kind, id);
    setEntries((prev) => prev.map((e) => (e.key === k ? { ...e, note: value } : e)));
  }, []);

  // Swap with the nearest neighbour OF THE SAME KIND so reordering one group
  // never scrambles another.
  const move = useCallback((kind: FavoriteKind, id: string, delta: -1 | 1) => {
    const k = favKey(kind, id);
    setEntries((prev) => {
      const sameKind = prev
        .map((e, index) => ({ e, index }))
        .filter(({ e }) => e.key.startsWith(`${kind}:`));
      const pos = sameKind.findIndex(({ e }) => e.key === k);
      const target = pos + delta;
      if (pos < 0 || target < 0 || target >= sameKind.length) return prev;
      const next = [...prev];
      const a = sameKind[pos]!.index;
      const b = sameKind[target]!.index;
      [next[a], next[b]] = [next[b]!, next[a]!];
      return next;
    });
  }, []);

  const addMany = useCallback((keys: string[], notes?: Record<string, string>) => {
    setEntries((prev) => {
      const seen = new Set(prev.map((e) => e.key));
      const added = keys
        .filter((k) => typeof k === 'string' && k.includes(':') && !seen.has(k))
        .map((key) => ({ key, note: notes?.[key] ?? '' }));
      return added.length ? [...prev, ...added] : prev;
    });
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  const api = useMemo<FavoritesApi>(
    () => ({ has, toggle, ids, note, setNote, move, addMany, clear, count: entries.length, entries }),
    [has, toggle, ids, note, setNote, move, addMany, clear, entries],
  );

  return <FavoritesContext.Provider value={api}>{children}</FavoritesContext.Provider>;
}
