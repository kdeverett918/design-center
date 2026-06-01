import { useMemo, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import type { Theme } from '../types';
import { configForTheme } from '../preview/previewConfig';
import { themeById, themes } from '../data/themes';
import { paletteById } from '../data/palettes';
import { fontPairingById } from '../data/fonts';
import PreviewFrame from '../components/preview/PreviewFrame';
import DeviceFrame from '../components/preview/DeviceFrame';
import { useFavorites } from '../contexts/favoritesContext';

// A single compare column: theme picker + live token-only preview + readout.
function CompareSlot({
  slot,
  themeId,
  onChange,
}: {
  slot: 'A' | 'B';
  themeId: string;
  onChange: (id: string) => void;
}) {
  const theme = themeById(themeId)!;
  const palette = useMemo(() => paletteById(theme.paletteId)!, [theme]);
  const fonts = useMemo(() => fontPairingById(theme.fontPairingId)!, [theme]);
  const config = useMemo(() => configForTheme(theme), [theme]);

  const selectId = `compare-slot-${slot}`;

  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-shell-glow/15 text-xs font-semibold text-shell-glow">
          {slot}
        </span>
        <label htmlFor={selectId} className="sr-only">
          Theme for slot {slot}
        </label>
        <select
          id={selectId}
          aria-label={`Theme for slot ${slot}`}
          value={themeId}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-full border border-shell-line bg-shell-panel px-3.5 py-1.5 text-sm font-medium text-shell-ink outline-none focus:border-shell-glow"
        >
          {themes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* live preview — mirrors PreviewStage's inline preview block */}
      <div className="bg-shell-base p-3">
        <div className="overflow-hidden rounded-2xl border border-shell-line">
          <DeviceFrame mode="desktop" height={520}>
            <PreviewFrame
              palette={palette}
              fonts={fonts}
              brand={theme.name}
              config={config}
              selectionKey={theme.id}
            />
          </DeviceFrame>
        </div>
      </div>

      {/* readout: name + tagline + palette/font + swatch dots */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold text-shell-ink">{theme.name}</h2>
          <p className="mt-0.5 truncate text-xs text-shell-mute">{theme.tagline}</p>
          <p className="mt-0.5 truncate text-[11px] text-shell-mute">
            {palette.name} · {fonts.name}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
          {(['primary', 'secondary', 'accent'] as const).map((role) => (
            <span
              key={role}
              className="h-3.5 w-3.5 rounded-full ring-1 ring-black/20"
              style={{ backgroundColor: palette.colors[role] }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Seed a slot from the user's favorited themes, falling back to a default theme.
function seedSlot(favIds: string[], favIndex: number, fallback: Theme): string {
  const favId = favIds[favIndex];
  if (favId && themeById(favId)) return favId;
  return fallback.id;
}

export default function CompareView() {
  const { ids } = useFavorites();

  // Read favorites ONCE via a lazy initializer so seeding doesn't fight user
  // edits and we never setState in an effect.
  const [slotA, setSlotA] = useState<string>(() =>
    seedSlot(ids('theme'), 0, themes[0]!),
  );
  const [slotB, setSlotB] = useState<string>(() =>
    seedSlot(ids('theme'), 1, themes[1]!),
  );

  const swap = () => {
    setSlotA(slotB);
    setSlotB(slotA);
  };

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-shell-ink sm:text-4xl">
            Compare side by side.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-shell-mute sm:text-base">
            Put two themes head to head in their real colors, fonts, and motion. Pick a theme for
            each side, then decide which direction feels right.
          </p>
        </div>
        <button
          type="button"
          onClick={swap}
          className="flex items-center gap-2 rounded-full border border-shell-line bg-shell-panel px-4 py-1.5 text-sm font-medium text-shell-mute transition-colors hover:text-shell-ink"
        >
          <ArrowLeftRight size={15} />
          Swap
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CompareSlot slot="A" themeId={slotA} onChange={setSlotA} />
        <CompareSlot slot="B" themeId={slotB} onChange={setSlotB} />
      </div>
    </div>
  );
}
