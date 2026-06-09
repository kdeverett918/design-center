// Lightweight client-side search used by the gallery. Token-based "fuzzy enough"
// matching: the query is split on whitespace and every token must appear as a
// substring somewhere in the item's searchable text. No dependency, no index —
// the library tops out at ~50 items per tab.
export function matchesQuery(parts: ReadonlyArray<string | undefined>, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = parts.filter(Boolean).join(' ').toLowerCase();
  return q.split(/\s+/).every((token) => haystack.includes(token));
}
