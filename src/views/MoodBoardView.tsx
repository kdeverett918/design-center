import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Shuffle } from 'lucide-react';
import type { PreviewConfig } from '../preview/previewConfig';
import { CARD_STYLES, HERO_VARIANTS, INTENSITIES } from '../preview/previewConfig';
import { palettes, paletteById } from '../data/palettes';
import { fontPairings, fontPairingById } from '../data/fonts';
import { loadFonts } from '../theme/loadFonts';
import PreviewStage from '../components/preview/PreviewStage';
import BriefSummary from '../components/client/BriefSummary';

const DEFAULT_CONFIG: PreviewConfig = { hero: 'split', cardStyle: 'elevated', motion: 'standard' };

export default function MoodBoardView() {
  const [paletteId, setPaletteId] = useState('meridian');
  const [fontId, setFontId] = useState('clearwater');
  const [config, setConfig] = useState<PreviewConfig>(DEFAULT_CONFIG);
  const [brand, setBrand] = useState('Your Practice');
  const [notes, setNotes] = useState('');

  const palette = useMemo(() => paletteById(paletteId)!, [paletteId]);
  const fonts = useMemo(() => fontPairingById(fontId)!, [fontId]);

  // Load all font pairings so the picker can render each name in its own face.
  useEffect(() => {
    fontPairings.forEach(loadFonts);
  }, []);

  const shuffle = () => {
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
    setPaletteId(pick(palettes).id);
    setFontId(pick(fontPairings).id);
    setConfig({
      hero: pick(HERO_VARIANTS).id,
      cardStyle: pick(CARD_STYLES).id,
      motion: pick(INTENSITIES),
    });
  };

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-shell-ink sm:text-4xl">
            Mix your own.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-shell-mute sm:text-base">
            Pair any palette with any font and layout, dial the motion, and watch it come together
            live. Your choices become a copy-ready design brief.
          </p>
        </div>
        <button
          type="button"
          onClick={shuffle}
          className="flex items-center gap-2 rounded-full border border-shell-line bg-shell-panel px-4 py-2 text-sm font-medium text-shell-ink hover:border-shell-glow/50"
        >
          <Shuffle size={15} className="text-shell-glow" /> Surprise me
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* preview */}
        <div className="order-1 min-w-0 flex-1">
          <PreviewStage
            palette={palette}
            fonts={fonts}
            brand={brand}
            selectionKey={`${paletteId}:${fontId}`}
            config={config}
            onConfig={(patch) => setConfig((c) => ({ ...c, ...patch }))}
            title="Custom mix"
            subtitle={`${palette.name} · ${fonts.name}`}
            height={560}
          />
        </div>

        {/* builder + brief */}
        <div className="order-2 space-y-5 lg:w-[380px] xl:w-[420px]">
          <div className="rounded-3xl border border-shell-line bg-shell-panel p-5">
            <Field label="Brand name">
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-lg border border-shell-line bg-shell-base px-3 py-2 text-sm text-shell-ink outline-none focus:border-shell-glow/60"
              />
            </Field>

            <Field label="Palette">
              <div className="flex flex-wrap gap-1.5">
                {palettes.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={p.id === paletteId}
                    aria-label={p.name}
                    title={p.name}
                    onClick={() => setPaletteId(p.id)}
                    className={`h-8 w-8 rounded-lg ring-2 transition-transform hover:scale-105 ${
                      p.id === paletteId ? 'ring-shell-glow' : 'ring-transparent'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${p.colors.primary} 0 50%, ${p.colors.accent} 50% 100%)`,
                    }}
                  />
                ))}
              </div>
            </Field>

            <Field label="Font pairing">
              <div className="grid max-h-44 grid-cols-2 gap-1.5 overflow-y-auto scrollbar-thin pr-1">
                {fontPairings.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={f.id === fontId}
                    onClick={() => setFontId(f.id)}
                    className={`rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors ${
                      f.id === fontId
                        ? 'border-shell-glow/60 bg-shell-glow/10 text-shell-ink'
                        : 'border-shell-line text-shell-mute hover:text-shell-ink'
                    }`}
                    style={{ fontFamily: `"${f.heading.family}", system-ui, sans-serif` }}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Notes for the brief">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. warm but clinical, lots of whitespace…"
                className="w-full resize-none rounded-lg border border-shell-line bg-shell-base px-3 py-2 text-sm text-shell-ink outline-none placeholder:text-shell-mute/60 focus:border-shell-glow/60"
              />
            </Field>
          </div>

          <BriefSummary brand={brand} palette={palette} fonts={fonts} config={config} notes={notes} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
        {label}
      </div>
      {children}
    </div>
  );
}
