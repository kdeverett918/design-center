import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Activity, Eye, Star } from 'lucide-react';
import './App.css';
import FavoritesProvider from './contexts/FavoritesProvider';
import { useFavorites } from './contexts/favoritesContext';
import Gallery from './components/gallery/Gallery';
import PreviewFrame from './components/preview/PreviewFrame';
import FavoriteStar from './components/cards/FavoriteStar';
import { themeById, themes } from './data/themes';
import { paletteById } from './data/palettes';
import { fontPairingById } from './data/fonts';

function Studio() {
  const [activeThemeId, setActiveThemeId] = useState<string>(themes[0]!.id);
  const { count } = useFavorites();

  const theme = themeById(activeThemeId)!;
  const palette = useMemo(() => paletteById(theme.paletteId)!, [theme]);
  const fonts = useMemo(() => fontPairingById(theme.fontPairingId)!, [theme]);

  return (
    <div className="min-h-screen">
      {/* ===== Shell header (neutral chrome) ===== */}
      <header className="sticky top-0 z-30 border-b border-shell-line bg-shell-base/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-shell-glow to-[#7c9eff]">
              <Activity size={18} className="text-shell-base" />
            </span>
            <div className="leading-tight">
              <div className="font-display text-[15px] font-semibold text-shell-ink">
                Design Center
              </div>
              <div className="text-[11px] text-shell-mute">Tech SLP Studio</div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-shell-line bg-shell-panel px-3.5 py-1.5 text-sm text-shell-mute">
            <Star size={14} className="text-amber-400" />
            <span className="font-medium text-shell-ink">{count}</span>
            <span className="hidden sm:inline">favorited</span>
          </div>
        </div>
      </header>

      {/* ===== Body: gallery + live preview ===== */}
      <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8">
        {/* intro */}
        <div className="mb-6 max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-shell-ink sm:text-4xl">
            Find the look that fits.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-shell-mute sm:text-base">
            Browse live themes, color palettes, font pairings, and animations — each shown
            in its real colors and motion. Tap a theme to preview a full page in it.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* gallery */}
          <div className="order-2 min-w-0 flex-1 lg:order-1">
            <Gallery activeThemeId={activeThemeId} onSelectTheme={setActiveThemeId} />
          </div>

          {/* live preview pane */}
          <div className="order-1 lg:order-2 lg:w-[440px] xl:w-[500px]">
            <div className="lg:sticky lg:top-[84px]">
              <PreviewPane
                key={theme.id}
                themeName={theme.name}
                tagline={theme.tagline}
                paletteName={palette.name}
                fontName={fonts.name}
                themeId={theme.id}
              >
                <PreviewFrame
                  palette={palette}
                  fonts={fonts}
                  brand={theme.name}
                  selectionKey={theme.id}
                />
              </PreviewPane>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-shell-line px-5 py-6 text-center text-xs text-shell-mute sm:px-8">
        Tech SLP Studio · Design Center — a living style gallery. Selections &amp; brief export
        coming next.
      </footer>
    </div>
  );
}

interface PreviewPaneProps {
  themeName: string;
  tagline: string;
  paletteName: string;
  fontName: string;
  themeId: string;
  children: ReactNode;
}

function PreviewPane({
  themeName,
  tagline,
  paletteName,
  fontName,
  themeId,
  children,
}: PreviewPaneProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-3xl border border-shell-line bg-shell-panel"
    >
      {/* selection bar */}
      <div className="flex items-center justify-between gap-3 border-b border-shell-line px-5 py-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-shell-glow" />
            <span className="font-display text-sm font-semibold text-shell-ink">
              {themeName}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-shell-mute">
            {tagline} · {paletteName} · {fontName}
          </p>
        </div>
        <FavoriteStar kind="theme" id={themeId} label={themeName} tone="shell" />
      </div>

      {/* the live, re-theming page */}
      <div className="h-[520px] bg-shell-base p-3">
        <div className="h-full overflow-hidden rounded-2xl border border-shell-line">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  return (
    <FavoritesProvider>
      <Studio />
    </FavoritesProvider>
  );
}
