import { useState } from 'react';
import { m as motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import type { Palette, PaletteColors } from '../../types';
import { colorVars } from '../../theme/applyTheme';
import FavoriteStar from './FavoriteStar';

// Swatch roles shown as a row; hex reveals on hover.
const ROLES: { key: keyof PaletteColors; label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'accent', label: 'Accent' },
  { key: 'surface', label: 'Surface' },
  { key: 'ink', label: 'Ink' },
];

export default function PaletteCard({ palette }: { palette: Palette }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copyHex = async (key: string, hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1400);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0 },
      }}
      className="group overflow-hidden rounded-3xl border border-shell-line bg-shell-panel"
    >
      {/* Live specimen rendered in the palette's own colors. */}
      <div
        style={colorVars(palette) as CSSProperties}
        className="relative bg-bg p-5"
        data-dark={palette.isDark ? 'true' : 'false'}
      >
        <div className="absolute right-3 top-3">
          <FavoriteStar kind="palette" id={palette.id} label={palette.name} tone="onLight" />
        </div>
        <div className="font-heading text-base font-semibold text-ink">{palette.name}</div>
        <p className="mt-0.5 text-xs capitalize text-muted">{palette.moods.join(' · ')}</p>
        {palette.blurb && (
          <p className="mt-2 text-[13px] leading-relaxed text-ink">{palette.blurb}</p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-onPrimary">
            Button
          </span>
          <span className="rounded-lg tk-tint-secondary px-3 py-1.5 text-xs font-medium text-ink">
            Chip
          </span>
          <span className="ml-auto h-6 w-6 rounded-md border tk-line bg-surface" />
        </div>
      </div>

      {/* Swatch row — hex on hover. */}
      <div className="grid grid-cols-5">
        {ROLES.map(({ key, label }) => {
          const hex = palette.colors[key];
          const isHover = hovered === key;
          const isCopied = copied === key;
          return (
            <button
              key={key}
              type="button"
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(key)}
              onBlur={() => setHovered(null)}
              onClick={() => copyHex(key, hex)}
              className="relative h-14"
              style={{ backgroundColor: hex }}
              aria-label={`Copy ${label} ${hex}`}
            >
              <span
                className={`absolute inset-x-0 bottom-1 text-center font-ui text-[9px] font-semibold uppercase tracking-wide transition-opacity ${
                  isHover || isCopied ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ color: contrastText(hex) }}
              >
                {isCopied ? 'Copied' : hex}
              </span>
            </button>
          );
        })}
      </div>
    </motion.article>
  );
}

// Quick luminance check to pick legible hex-label text over each swatch.
function contrastText(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.92)';
}
