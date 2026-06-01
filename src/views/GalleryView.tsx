import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PreviewConfig } from '../preview/previewConfig';
import { configForTheme, layoutToConfig } from '../preview/previewConfig';
import { decodeConfig, encodeConfig } from '../preview/shareConfig';
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

  // Initial config: a shared ?c= token wins, else the theme's defaults.
  const [config, setConfig] = useState<PreviewConfig>(
    () => decodeConfig(params.get('c')) ?? configForTheme(theme),
  );
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

  const applyLayout = (previewKey: string) => {
    // Sections are multi-select — clicking toggles them in/out of the page.
    if (previewKey.startsWith('sec-')) {
      setConfig((c) => ({
        ...c,
        sections: c.sections.includes(previewKey)
          ? c.sections.filter((s) => s !== previewKey)
          : [...c.sections, previewKey],
      }));
      return;
    }
    const patch = layoutToConfig(previewKey);
    if (patch) setConfig((c) => ({ ...c, ...patch }));
  };

  const shareGallery = async () => {
    const url = `${window.location.origin}/?theme=${activeThemeId}&c=${encodeConfig(config)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard unavailable */
    }
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
          <Gallery
            activeThemeId={activeThemeId}
            onSelectTheme={selectTheme}
            config={config}
            onApplyLayout={applyLayout}
          />
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
              onShare={shareGallery}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
