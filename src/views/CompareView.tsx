import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, Check, Link2 } from 'lucide-react';
import Button from '../components/ui/Button';
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

// Resolve a slot's theme id: a valid URL param wins, else the favorited fallback
// captured for a fresh visit, else the default theme for that slot.
function resolveSlot(param: string | null, seed: string): string {
  if (param && themeById(param)) return param;
  return seed;
}

export default function CompareView() {
  const { ids } = useFavorites();
  const [params, setParams] = useSearchParams();

  // Capture the favorited shortlist ONCE so seeding (for a fresh visit with no
  // ?a/?b) doesn't fight later edits. The URL is the source of truth for the
  // active pair — these are only fallbacks when a param is absent/invalid.
  const [seeds] = useState<{ a: string; b: string }>(() => {
    const favIds = ids('theme');
    const seedA = favIds[0] && themeById(favIds[0]) ? favIds[0] : themes[0]!.id;
    const seedB = favIds[1] && themeById(favIds[1]) ? favIds[1] : themes[1]!.id;
    return { a: seedA, b: seedB };
  });

  const aId = resolveSlot(params.get('a'), seeds.a);
  const bId = resolveSlot(params.get('b'), seeds.b);

  // Keep both params present once a selection is made so the link is shareable.
  const setPair = (next: { a: string; b: string }) => {
    setParams({ a: next.a, b: next.b }, { replace: false });
  };

  const setSlotA = (id: string) => setPair({ a: id, b: bId });
  const setSlotB = (id: string) => setPair({ a: aId, b: id });
  const swap = () => setPair({ a: bId, b: aId });

  const [copied, setCopied] = useState(false);
  const shareComparison = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
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
        <div className="flex items-center gap-2">
          <Button tone="accent" onClick={swap}>
            <ArrowLeftRight size={15} />
            Swap
          </Button>
          <Button tone="info" onClick={shareComparison}>
            {copied ? <Check size={15} /> : <Link2 size={15} />}
            {copied ? 'Copied' : 'Share comparison'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CompareSlot slot="A" themeId={aId} onChange={setSlotA} />
        <CompareSlot slot="B" themeId={bId} onChange={setSlotB} />
      </div>
    </div>
  );
}
