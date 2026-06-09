import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import type { FontPairing } from '../../types';
import { loadFonts } from '../../theme/loadFonts';
import { colorVars } from '../../theme/applyTheme';
import { paletteById } from '../../data/palettes';
import { themes } from '../../data/themes';
import FavoriteStar from './FavoriteStar';

// Give each pairing a representative palette so every font card reads as a
// custom, on-brand specimen — distinct in BOTH typeface and color, even when two
// pairings share a body font (e.g. Inter). Prefer the palette of a theme that
// actually uses the pairing; otherwise fall back to a hand-picked match.
const FALLBACK_PALETTE: Record<string, string> = {
  masthead: 'fathom',
  lullaby: 'halcyon',
  murmur: 'graphite',
  heirloom: 'mauveine',
};

function representativePaletteId(fontId: string): string {
  const theme = themes.find((t) => t.fontPairingId === fontId);
  return theme?.paletteId ?? FALLBACK_PALETTE[fontId] ?? 'graphite';
}

// Renders the pairing using its ACTUAL fonts (loaded on mount). The heading
// specimen leads at display size (where character shows); the body specimen is
// clearly secondary and labeled.
export default function FontCard({ pairing }: { pairing: FontPairing }) {
  useEffect(() => {
    loadFonts(pairing);
  }, [pairing]);

  const palette = useMemo(
    () => paletteById(representativePaletteId(pairing.id))!,
    [pairing.id],
  );

  const headingFont = `"${pairing.heading.family}", system-ui, sans-serif`;
  const bodyFont = `"${pairing.body.family}", system-ui, sans-serif`;

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0 },
      }}
      className="group relative overflow-hidden rounded-3xl border border-shell-line bg-shell-panel"
    >
      <div className="absolute right-4 top-4 z-10">
        <FavoriteStar kind="font" id={pairing.id} label={pairing.name} tone="onLight" />
      </div>

      {/* Themed specimen panel — its own colors + the pairing's real fonts. */}
      <div
        style={colorVars(palette) as CSSProperties}
        data-dark={palette.isDark ? 'true' : 'false'}
        className="bg-bg px-6 pb-6 pt-7"
      >
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted">
          <span>{pairing.name}</span>
        </div>

        {/* Heading specimen — large, where the typeface's character is obvious.
            Each pairing carries its own evocative sentence (never a pangram). */}
        <p
          className="mt-3 text-[34px] font-semibold leading-[1.05] tracking-tight text-ink"
          style={{ fontFamily: headingFont }}
        >
          {pairing.specimen ?? 'Care that listens.'}
        </p>
        <p
          className="mt-2 text-xl leading-snug text-primary"
          style={{ fontFamily: headingFont }}
        >
          Aa Gg Rk · 0123456789
        </p>

        {/* Body specimen — clearly secondary, in the body font. */}
        <p
          className="mt-4 border-t tk-line pt-4 text-[13px] leading-relaxed text-muted"
          style={{ fontFamily: bodyFont }}
        >
          Body text carries the everyday weight: appointments, answers, and the
          fine print — set so it reads effortlessly at any size.
        </p>
      </div>

      {/* Labels (shell chrome) — each name shown in its own font. */}
      <div className="grid grid-cols-2 gap-3 px-6 py-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: palette.colors.primary }} />
          <div className="min-w-0">
            <div className="text-shell-mute">Heading</div>
            <div className="truncate font-medium text-shell-ink" style={{ fontFamily: headingFont }}>
              {pairing.heading.family}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: palette.colors.accent }} />
          <div className="min-w-0">
            <div className="text-shell-mute">Body</div>
            <div className="truncate font-medium text-shell-ink" style={{ fontFamily: bodyFont }}>
              {pairing.body.family}
            </div>
          </div>
        </div>
        <p className="col-span-2 mt-1 truncate text-[11px] italic text-shell-mute">
          {pairing.personality}
        </p>
      </div>
    </motion.article>
  );
}
