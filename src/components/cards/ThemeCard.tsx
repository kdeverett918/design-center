import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Theme } from '../../types';
import { paletteById } from '../../data/palettes';
import { fontPairingById } from '../../data/fonts';
import ThemedScope from '../../theme/ThemedScope';
import MiniSamplePage from '../preview/MiniSamplePage';
import FavoriteStar from './FavoriteStar';

interface ThemeCardProps {
  theme: Theme;
  active: boolean;
  onSelect: (themeId: string) => void;
}

// A tiny, fully-colored live page in the theme's own DNA. The grid of these is
// the colorful showroom wall — each card different colors + fonts at rest.
export default function ThemeCard({ theme, active, onSelect }: ThemeCardProps) {
  const palette = paletteById(theme.paletteId);
  const fonts = fontPairingById(theme.fontPairingId);
  if (!palette || !fonts) return null;

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className={`group relative overflow-hidden rounded-3xl border bg-shell-panel transition-colors ${
        active ? 'border-shell-glow ring-1 ring-shell-glow/50' : 'border-shell-line'
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(theme.id)}
        className="block w-full text-left outline-none"
        aria-label={`Preview the ${theme.name} theme`}
      >
        {/* live mini page in its own palette + fonts */}
        <ThemedScope
          palette={palette}
          fonts={fonts}
          className="h-64 overflow-hidden border-b border-shell-line"
        >
          <MiniSamplePage brand={theme.name} />
        </ThemedScope>

        {/* meta row (shell chrome) */}
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-semibold text-shell-ink">
                {theme.name}
              </h3>
              <span className="rounded-full border border-shell-line px-2 py-0.5 text-[10px] capitalize text-shell-mute">
                {theme.animationIntensity}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-shell-mute">{theme.tagline}</p>
          </div>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-shell-base text-shell-mute transition-colors group-hover:text-shell-glow">
            <ArrowUpRight size={15} />
          </span>
        </div>
      </button>

      {/* palette + font readout */}
      <div className="flex items-center justify-between gap-2 border-t border-shell-line px-5 py-3">
        <div className="flex items-center gap-1.5">
          {(['primary', 'secondary', 'accent'] as const).map((role) => (
            <span
              key={role}
              className="h-3.5 w-3.5 rounded-full ring-1 ring-black/20"
              style={{ backgroundColor: palette.colors[role] }}
            />
          ))}
          <span className="ml-1 text-[11px] text-shell-mute">
            {palette.name} · {fonts.name}
          </span>
        </div>
        <FavoriteStar kind="theme" id={theme.id} label={theme.name} tone="shell" />
      </div>
    </motion.article>
  );
}
