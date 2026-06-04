import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, ChevronDown, Link2, RotateCcw, Shuffle } from 'lucide-react';
import { decodeBoard, encodeBoard } from './shareBoard';
import type { PreviewConfig } from '../preview/previewConfig';
import {
  CARD_STYLES,
  DEFAULT_PREVIEW_CONFIG,
  FOOTER_VARIANTS,
  HERO_VARIANTS,
  INTENSITIES,
  NAV_VARIANTS,
  sanitizePreviewConfig,
} from '../preview/previewConfig';
import { palettes, paletteById } from '../data/palettes';
import { fontPairings, fontPairingById } from '../data/fonts';
import { animationById, animationPresets } from '../data/animations';
import type { AnimationCategory } from '../types';
import { loadFonts } from '../theme/loadFonts';
import PreviewStage from '../components/preview/PreviewStage';
import BriefSummary from '../components/client/BriefSummary';
import SendBrief from '../components/client/SendBrief';

// Order the "Motion & effects" picker presents its categories in.
const ANIMATION_CATEGORIES: AnimationCategory[] = [
  'entrance',
  'scroll',
  'hover',
  'cursor',
  'continuous',
  'transition',
];

const STORAGE_KEY = 'dc:moodboard:v1';

// Shared canonical default so saved/shared/shuffled boards never drift apart.
const DEFAULT_CONFIG: PreviewConfig = DEFAULT_PREVIEW_CONFIG;

interface SavedBoard {
  paletteId: string;
  fontId: string;
  config: PreviewConfig;
  brand: string;
  notes: string;
  animationIds: string[];
}

// Hydrate the last saved brief, validating the referenced palette/font still exist.
function loadSaved(): SavedBoard | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && p.config && paletteById(p.paletteId) && fontPairingById(p.fontId)) {
      return {
        ...p,
        // Validate + merge so a partial/legacy saved board can't seed bad state.
        config: sanitizePreviewConfig(p.config),
        // Old saved boards predate animations; drop ids that no longer resolve.
        animationIds: Array.isArray(p.animationIds)
          ? p.animationIds.filter((id: unknown) => typeof id === 'string' && animationById(id))
          : [],
      } as SavedBoard;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export default function MoodBoardView() {
  const [params] = useSearchParams();
  // A ?b= share link wins over the locally-saved board.
  const [initial] = useState(() => decodeBoard(params.get('b')) ?? loadSaved());
  const [paletteId, setPaletteId] = useState(() => initial?.paletteId ?? 'meridian');
  const [fontId, setFontId] = useState(() => initial?.fontId ?? 'clearwater');
  const [config, setConfig] = useState<PreviewConfig>(() => initial?.config ?? DEFAULT_CONFIG);
  const [brand, setBrand] = useState(() => initial?.brand ?? 'Your Practice');
  const [notes, setNotes] = useState(() => initial?.notes ?? '');
  const [animationIds, setAnimationIds] = useState<string[]>(() => initial?.animationIds ?? []);
  const [copied, setCopied] = useState(false);
  // The motion picker is the densest control, so it starts collapsed — but if a
  // restored share/saved board already has picks, open it so they're visible.
  const [motionOpen, setMotionOpen] = useState(() => (initial?.animationIds?.length ?? 0) > 0);

  const palette = useMemo(() => paletteById(paletteId)!, [paletteId]);
  const fonts = useMemo(() => fontPairingById(fontId)!, [fontId]);

  // Load all font pairings so the picker can render each name in its own face.
  useEffect(() => {
    fontPairings.forEach(loadFonts);
  }, []);

  // Auto-save the full brief so it survives refreshes / return visits.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ paletteId, fontId, config, brand, notes, animationIds }),
      );
    } catch {
      /* ignore */
    }
  }, [paletteId, fontId, config, brand, notes, animationIds]);

  const shuffle = () => {
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
    setPaletteId(pick(palettes).id);
    setFontId(pick(fontPairings).id);
    setConfig({
      hero: pick(HERO_VARIANTS).id,
      cardStyle: pick(CARD_STYLES).id,
      nav: pick(NAV_VARIANTS).id,
      footer: pick(FOOTER_VARIANTS).id,
      sections: [...DEFAULT_CONFIG.sections],
      motion: pick(INTENSITIES),
    });
    // Pick 2–3 distinct random animations.
    const count = 2 + Math.floor(Math.random() * 2);
    const shuffled = [...animationPresets].sort(() => Math.random() - 0.5);
    setAnimationIds(shuffled.slice(0, count).map((a) => a.id));
  };

  const reset = () => {
    setPaletteId('meridian');
    setFontId('clearwater');
    setConfig(DEFAULT_CONFIG);
    setBrand('Your Practice');
    setNotes('');
    setAnimationIds([]);
  };

  const toggleAnimation = (id: string) => {
    setAnimationIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const copyShareLink = async () => {
    const token = encodeBoard({ paletteId, fontId, config, brand, notes, animationIds });
    const url = `${window.location.origin}/moodboard?b=${token}`;
    try {
      await navigator.clipboard.writeText(url);
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
            Mix your own.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-shell-mute sm:text-base">
            Pick a palette and a font — your preview updates as you go. No design skills needed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-shell-mute sm:inline">Saved automatically</span>
          <button
            type="button"
            onClick={copyShareLink}
            className="flex items-center gap-2 rounded-full border border-shell-line bg-shell-panel px-4 py-2 text-sm font-medium text-shell-ink hover:border-shell-glow/50"
          >
            {copied ? <Check size={15} className="text-emerald-400" /> : <Link2 size={15} className="text-shell-glow" />}
            {copied ? 'Link copied' : 'Share link'}
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2 rounded-full border border-shell-line bg-shell-panel px-4 py-2 text-sm font-medium text-shell-mute hover:text-shell-ink"
          >
            <RotateCcw size={15} /> Start over
          </button>
          <button
            type="button"
            onClick={shuffle}
            className="flex items-center gap-2 rounded-full border border-shell-line bg-shell-panel px-4 py-2 text-sm font-medium text-shell-ink hover:border-shell-glow/50"
          >
            <Shuffle size={15} className="text-shell-glow" /> Surprise me
          </button>
        </div>
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
            effects={animationIds}
          />
        </div>

        {/* builder + brief */}
        <div className="order-2 space-y-5 lg:w-[380px] xl:w-[420px]">
          <div className="rounded-3xl border border-shell-line bg-shell-panel p-5">
            <div className="mb-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] font-medium text-shell-mute">
              <span><span className="text-shell-glow">1</span> · Pick colors</span>
              <span aria-hidden className="text-shell-line">›</span>
              <span><span className="text-shell-glow">2</span> · Pick type</span>
              <span aria-hidden className="text-shell-line">›</span>
              <span><span className="text-shell-glow">3</span> · Send</span>
            </div>

            <Field label="Brand name" htmlFor="mb-brand">
              <input
                id="mb-brand"
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

            <div className="mb-4 last:mb-0">
              <button
                type="button"
                onClick={() => setMotionOpen((o) => !o)}
                aria-expanded={motionOpen}
                aria-controls="mb-motion-panel"
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-shell-line px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-shell-mute transition-colors hover:text-shell-ink"
              >
                <span className="flex items-center gap-1.5">
                  {motionOpen ? 'Motion & effects' : '+ Add motion (optional)'}
                  {animationIds.length > 0 && (
                    <span className="rounded-full bg-shell-glow/15 px-1.5 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-shell-glow">
                      {animationIds.length}
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 transition-transform motion-reduce:transition-none ${
                    motionOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {motionOpen && (
                <div
                  id="mb-motion-panel"
                  className="mt-2.5 max-h-52 space-y-2.5 overflow-y-auto scrollbar-thin pr-1"
                >
                  {ANIMATION_CATEGORIES.map((category) => {
                    const items = animationPresets.filter((a) => a.category === category);
                    if (!items.length) return null;
                    return (
                      <div key={category}>
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-shell-mute/80">
                          {category}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {items.map((a) => {
                            const on = animationIds.includes(a.id);
                            return (
                              <button
                                key={a.id}
                                type="button"
                                aria-pressed={on}
                                title={a.effect}
                                onClick={() => toggleAnimation(a.id)}
                                className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                                  on
                                    ? 'border-shell-glow/60 bg-shell-glow/10 text-shell-ink'
                                    : 'border-shell-line text-shell-mute hover:text-shell-ink'
                                }`}
                              >
                                {a.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Field label="Notes for the brief" htmlFor="mb-notes">
              <textarea
                id="mb-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. warm but clinical, lots of whitespace…"
                className="w-full resize-none rounded-lg border border-shell-line bg-shell-base px-3 py-2 text-sm text-shell-ink outline-none placeholder:text-shell-mute focus:border-shell-glow/60"
              />
            </Field>
          </div>

          <BriefSummary
            brand={brand}
            palette={palette}
            fonts={fonts}
            config={config}
            notes={notes}
            animationIds={animationIds}
          />

          <SendBrief
            brand={brand}
            palette={palette}
            fonts={fonts}
            config={config}
            notes={notes}
            animationIds={animationIds}
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  const cls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-shell-mute';
  return (
    <div className="mb-4 last:mb-0">
      {htmlFor ? (
        <label htmlFor={htmlFor} className={cls}>
          {label}
        </label>
      ) : (
        <div className={cls}>{label}</div>
      )}
      {children}
    </div>
  );
}
