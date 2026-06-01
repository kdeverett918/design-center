import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PreviewConfig } from '../preview/previewConfig';
import { configForTheme } from '../preview/previewConfig';
import { themeById, themes } from '../data/themes';
import { paletteById } from '../data/palettes';
import { fontPairingById } from '../data/fonts';
import Gallery from '../components/gallery/Gallery';
import PreviewStage from '../components/preview/PreviewStage';

export default function GalleryView() {
  const [params, setParams] = useSearchParams();
  // Active theme is driven by the ?theme= URL param so previews are shareable
  // and the favorites view can deep-link straight to one.
  const paramTheme = params.get('theme');
  const activeThemeId = paramTheme && themeById(paramTheme) ? paramTheme : themes[0]!.id;

  const theme = themeById(activeThemeId)!;
  const palette = useMemo(() => paletteById(theme.paletteId)!, [theme]);
  const fonts = useMemo(() => fontPairingById(theme.fontPairingId)!, [theme]);

  const [config, setConfig] = useState<PreviewConfig>(() => configForTheme(theme));
  // Reset layout/motion to the theme's defaults when the theme changes (incl. via
  // a ?theme= deep link) — the React-recommended "adjust state during render"
  // pattern, so no effect is needed.
  const [prevThemeId, setPrevThemeId] = useState(theme.id);
  if (theme.id !== prevThemeId) {
    setPrevThemeId(theme.id);
    setConfig(configForTheme(theme));
  }

  const selectTheme = (id: string) => {
    const t = themeById(id);
    if (!t) return;
    setParams(id === themes[0]!.id ? {} : { theme: id }, { replace: false });
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
