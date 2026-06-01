import { useMemo, useState } from 'react';
import type { PreviewConfig } from '../preview/previewConfig';
import { configForTheme } from '../preview/previewConfig';
import { themeById, themes } from '../data/themes';
import { paletteById } from '../data/palettes';
import { fontPairingById } from '../data/fonts';
import Gallery from '../components/gallery/Gallery';
import PreviewStage from '../components/preview/PreviewStage';

export default function GalleryView() {
  const [activeThemeId, setActiveThemeId] = useState(themes[0]!.id);
  const [config, setConfig] = useState<PreviewConfig>(() => configForTheme(themes[0]!));

  const theme = themeById(activeThemeId)!;
  const palette = useMemo(() => paletteById(theme.paletteId)!, [theme]);
  const fonts = useMemo(() => fontPairingById(theme.fontPairingId)!, [theme]);

  const selectTheme = (id: string) => {
    const t = themeById(id);
    if (!t) return;
    setActiveThemeId(id);
    setConfig(configForTheme(t)); // reset layout/motion to the theme's defaults
  };

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8">
      <div className="mb-6 max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-shell-ink sm:text-4xl">
          Find the look that fits.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-shell-mute sm:text-base">
          Browse live themes, color palettes, font pairings, and animations — each shown in its
          real colors and motion. Tap a theme to preview a full page, then tune the layout.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="order-2 min-w-0 flex-1 lg:order-1">
          <Gallery activeThemeId={activeThemeId} onSelectTheme={selectTheme} />
        </div>

        <div className="order-1 lg:order-2 lg:w-[440px] xl:w-[500px]">
          <div className="lg:sticky lg:top-[84px]">
            <PreviewStage
              palette={palette}
              fonts={fonts}
              brand={theme.name}
              selectionKey={theme.id}
              config={config}
              onConfig={(patch) => setConfig((c) => ({ ...c, ...patch }))}
              title={theme.name}
              subtitle={`${theme.tagline} · ${palette.name} · ${fonts.name}`}
              favorite={{ kind: 'theme', id: theme.id, label: theme.name }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
