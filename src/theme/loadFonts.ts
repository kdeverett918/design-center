import type { FontFace, FontPairing } from '../types';

// Dynamically inject a Google Fonts <link> for a pairing. Deduped by id so the
// same pairing is only requested once, even with many cards on screen.
//
// Fontshare is supported as a source label in the data model for future growth;
// in Phase 0/1 every pairing is Google. Non-google faces are skipped gracefully.

function googleFamilyParam(face: FontFace): string {
  const fam = face.family.replace(/ /g, '+');
  const weights = [...face.weights].sort((a, b) => a - b).join(';');
  return `family=${fam}:wght@${weights}`;
}

export function loadFonts(fonts: FontPairing): void {
  if (typeof document === 'undefined') return;

  const id = `gf-${fonts.id}`;
  if (document.getElementById(id)) return;

  const googleFaces = [fonts.heading, fonts.body].filter(
    (f) => f.source === 'google',
  );
  if (googleFaces.length === 0) return;

  // Dedupe identical families (single-family pairings like Daylight/Murmur).
  const seen = new Set<string>();
  const params = googleFaces
    .filter((f) => {
      const key = `${f.family}:${f.weights.join(',')}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(googleFamilyParam)
    .join('&');

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`;
  document.head.appendChild(link);
}
