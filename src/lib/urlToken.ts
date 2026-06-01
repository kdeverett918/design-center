// Compact, URL-safe encoding of small JSON state for shareable links.

const toUrlSafe = (b64: string): string =>
  b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const fromUrlSafe = (s: string): string => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
  return b64 + pad;
};

export function encodeToken(obj: unknown): string {
  try {
    return toUrlSafe(btoa(encodeURIComponent(JSON.stringify(obj))));
  } catch {
    return '';
  }
}

// Returns the parsed value or null on missing/corrupt input. Caller validates shape.
export function decodeToken(param: string | null): unknown {
  if (!param) return null;
  try {
    return JSON.parse(decodeURIComponent(atob(fromUrlSafe(param))));
  } catch {
    return null;
  }
}
