import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  LayoutGrid,
  Link2,
  Mail,
  Palette as PaletteIcon,
  RotateCcw,
  Shuffle,
  Sparkles,
  Type,
  Wand2,
} from 'lucide-react';
import { decodeBoard, encodeBoard } from './shareBoard';
import type { PreviewConfig } from '../preview/previewConfig';
import {
  CARD_STYLES,
  configForTheme,
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
import { themeById } from '../data/themes';
import type { AnimationCategory, Palette, Theme } from '../types';
import { loadFonts } from '../theme/loadFonts';
import Button, { buttonClasses } from '../components/ui/Button';
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

// A curated handful of standout themes for the "Start from a theme" quick-pick.
// Clicking one seeds the whole mix (palette + font + config) so people start from
// something great instead of a blank slate, then fine-tune below. Filtered against
// the live `themes` list so a renamed/removed id can never break the row.
const QUICK_PICK_THEME_IDS = [
  'quietsignal',
  'bluehour',
  'limelight',
  'sherbetstudio',
  'stillwater',
  'launchpad',
  'obsidian',
  'terracotta',
];
const QUICK_PICK_THEMES = QUICK_PICK_THEME_IDS.map(themeById).filter(
  (t): t is NonNullable<typeof t> => Boolean(t),
);

const STORAGE_KEY = 'dc:moodboard:v1';

const FEATURED_PALETTE_IDS = [
  'oatmilk',
  'bluehour',
  'blacklime',
  'sherbet',
  'meridian',
  'sage',
  'noir',
  'aurora',
  'lagoon',
  'newsprint',
];
const FEATURED_PALETTES = FEATURED_PALETTE_IDS.map(paletteById).filter(
  (p): p is Palette => Boolean(p),
);

const FEATURED_FONT_IDS = [
  'folio',
  'tidepool',
  'rebar',
  'gumdrop',
  'clearwater',
  'blueprint',
  'broadsheet',
  'maison',
  'eucalyptus',
  'spectacle',
];
const FEATURED_FONTS = FEATURED_FONT_IDS.map(fontPairingById).filter(
  (f): f is NonNullable<ReturnType<typeof fontPairingById>> => Boolean(f),
);

const THEME_EFFECTS: Record<string, string[]> = {
  quietsignal: ['fade-up', 'underline-grow'],
  bluehour: ['fade-up', 'gentle-float'],
  limelight: ['kinetic-type', 'cursor-spotlight', 'glitch-shift'],
  sherbetstudio: ['bounce-in', 'pop-scale', 'confetti-burst'],
  stillwater: ['fade-up'],
  launchpad: ['stagger-reveal', 'hover-lift'],
  obsidian: ['blur-in', 'image-zoom', 'cursor-dot'],
  terracotta: ['scroll-reveal', 'gentle-float'],
};

const DEFAULT_THEME_ID = 'quietsignal';
const DEFAULT_THEME = themeById(DEFAULT_THEME_ID);
const DEFAULT_PALETTE_ID = DEFAULT_THEME?.paletteId ?? 'meridian';
const DEFAULT_FONT_ID = DEFAULT_THEME?.fontPairingId ?? 'clearwater';
// Shared canonical default so saved/shared/shuffled boards never drift apart.
const DEFAULT_CONFIG: PreviewConfig = DEFAULT_THEME
  ? configForTheme(DEFAULT_THEME)
  : DEFAULT_PREVIEW_CONFIG;
const DEFAULT_ANIMATIONS = THEME_EFFECTS[DEFAULT_THEME_ID] ?? [];

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
  const [paletteId, setPaletteId] = useState(() => initial?.paletteId ?? DEFAULT_PALETTE_ID);
  const [fontId, setFontId] = useState(() => initial?.fontId ?? DEFAULT_FONT_ID);
  const [config, setConfig] = useState<PreviewConfig>(() => initial?.config ?? DEFAULT_CONFIG);
  const [brand, setBrand] = useState(() => initial?.brand ?? 'Your Practice');
  const [notes, setNotes] = useState(() => initial?.notes ?? '');
  const [animationIds, setAnimationIds] = useState<string[]>(
    () => initial?.animationIds ?? DEFAULT_ANIMATIONS,
  );
  const [copied, setCopied] = useState(false);
  // The motion picker is the densest control, so it starts collapsed — but if a
  // restored share/saved board already has picks, open it so they're visible.
  const [motionOpen, setMotionOpen] = useState(
    () => (initial?.animationIds?.length ?? DEFAULT_ANIMATIONS.length) > 0,
  );

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

  // Seed the whole mix from a polished theme so people start from something great.
  const seedFromTheme = (themeId: string) => {
    const theme = themeById(themeId);
    if (!theme) return;
    setPaletteId(theme.paletteId);
    setFontId(theme.fontPairingId);
    setConfig(configForTheme(theme));
    const effects = THEME_EFFECTS[themeId] ?? [];
    setAnimationIds(effects);
    setMotionOpen(effects.length > 0);
  };

  const reset = () => {
    setPaletteId(DEFAULT_PALETTE_ID);
    setFontId(DEFAULT_FONT_ID);
    setConfig(DEFAULT_CONFIG);
    setBrand('Your Practice');
    setNotes('');
    setAnimationIds(DEFAULT_ANIMATIONS);
    setMotionOpen(DEFAULT_ANIMATIONS.length > 0);
  };

  // Highlight a quick-pick chip when the current palette + font match that theme.
  const activeThemeId = useMemo(
    () =>
      QUICK_PICK_THEMES.find((t) => t.paletteId === paletteId && t.fontPairingId === fontId)?.id ??
      null,
    [paletteId, fontId],
  );

  const toggleAnimation = (id: string) => {
    setAnimationIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const copyShareLink = async () => {
    const token = encodeBoard({ paletteId, fontId, config, brand, notes, animationIds });
    const url = `${window.location.origin}/?b=${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] px-4 pb-10 pt-5 sm:px-8">
      <section className="relative overflow-hidden border-b border-shell-line pb-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 -top-32 h-72 w-72 rounded-full bg-shell-glow/10 blur-[96px]"
        />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-shell-line bg-shell-panel/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
              <Sparkles size={13} className="text-shell-glow" />
              Tech SLP Studio Mood Board
            </div>
            <h1 className="font-display text-[2.55rem] font-semibold leading-[0.98] tracking-tight text-shell-ink sm:text-6xl xl:text-7xl">
              Build the design direction.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-shell-mute sm:text-lg">
              Start from a styled direction, tune the palette and type, then send a clean brief when
              the preview feels right.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden rounded-full border border-shell-line px-3 py-2 text-xs text-shell-mute sm:inline-flex">
              Saved automatically
            </span>
            <Button tone="info" onClick={copyShareLink}>
              {copied ? <Check size={15} /> : <Link2 size={15} />}
              {copied ? 'Link copied' : 'Share link'}
            </Button>
            <Link to="/gallery" aria-label="Browse theme library" className={buttonClasses('neutral', 'md')}>
              <LayoutGrid size={15} /> Browse gallery
            </Link>
            <Button tone="accent" onClick={shuffle}>
              <Shuffle size={15} /> Surprise me
            </Button>
          </div>
        </div>

        <div className="relative mt-6 grid gap-2 sm:grid-cols-3">
          <SignalPill icon={<PaletteIcon size={14} />} label="Palette" value={palette.name} />
          <SignalPill icon={<Type size={14} />} label="Type" value={fonts.name} />
          <SignalPill
            icon={<Wand2 size={14} />}
            label="Motion"
            value={`${animationIds.length || 'No'} effect${animationIds.length === 1 ? '' : 's'}`}
          />
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px] xl:items-start">
        <div className="min-w-0 xl:sticky xl:top-24">
          <PreviewStage
            palette={palette}
            fonts={fonts}
            brand={brand}
            selectionKey={`${paletteId}:${fontId}`}
            config={config}
            onConfig={(patch) => setConfig((c) => ({ ...c, ...patch }))}
            title="Live direction"
            subtitle={`${palette.name} · ${fonts.name}`}
            height={620}
            effects={animationIds}
            instantMount
          />
        </div>

        <div className="space-y-5">
          <div className="rounded-[28px] border border-shell-line bg-shell-panel p-4 shadow-[0_20px_70px_-55px_rgba(0,0,0,0.8)] sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-semibold text-shell-ink">Shape the brief</h2>
                <p className="mt-0.5 text-xs leading-relaxed text-shell-mute">
                  {activeThemeId ? QUICK_PICK_THEMES.find((t) => t.id === activeThemeId)?.tagline : 'Custom direction'}
                </p>
              </div>
              <Button tone="danger" size="sm" onClick={reset} className="shrink-0 whitespace-nowrap">
                <RotateCcw size={13} /> Start over
              </Button>
            </div>

            <div className="mb-5">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
                <Sparkles size={12} className="text-shell-glow" />
                Styled starts
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                {QUICK_PICK_THEMES.map((theme) => (
                  <ThemeSeedButton
                    key={theme.id}
                    theme={theme}
                    active={theme.id === activeThemeId}
                    onClick={() => seedFromTheme(theme.id)}
                  />
                ))}
              </div>
            </div>

            <Field label="Brand name" htmlFor="mb-brand">
              <input
                id="mb-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-lg border border-shell-line bg-shell-base px-3 py-2 text-sm text-shell-ink outline-none focus:border-shell-glow/60"
              />
            </Field>

            <Field label="Featured palettes">
              <div className="grid grid-cols-5 gap-2">
                {FEATURED_PALETTES.map((p) => (
                  <PaletteButton
                    key={p.id}
                    palette={p}
                    active={p.id === paletteId}
                    onClick={() => setPaletteId(p.id)}
                  />
                ))}
              </div>
              <details className="group mt-2">
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-shell-line px-3 py-2 text-xs font-semibold text-shell-mute transition-colors hover:text-shell-ink">
                  Full palette library
                  <ChevronDown
                    size={14}
                    className="transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  />
                </summary>
                <div className="mt-2 grid max-h-44 grid-cols-8 gap-1.5 overflow-y-auto scrollbar-thin pr-1">
                  {palettes.map((p) => (
                    <PaletteButton
                      key={p.id}
                      palette={p}
                      active={p.id === paletteId}
                      onClick={() => setPaletteId(p.id)}
                    />
                  ))}
                </div>
              </details>
            </Field>

            <Field label="Featured type">
              <div className="grid grid-cols-2 gap-1.5">
                {FEATURED_FONTS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={f.id === fontId}
                    onClick={() => setFontId(f.id)}
                    className={`flex items-center justify-between gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors ${
                      f.id === fontId
                        ? 'border-shell-glow bg-shell-glow/15 font-semibold text-shell-ink'
                        : 'border-shell-line text-shell-mute hover:border-shell-glow/40 hover:text-shell-ink'
                    }`}
                    style={{ fontFamily: `"${f.heading.family}", system-ui, sans-serif` }}
                  >
                    <span className="truncate">{f.name}</span>
                    {f.id === fontId && <Check size={12} className="shrink-0 text-shell-glow" />}
                  </button>
                ))}
              </div>
              <details className="group mt-2">
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-shell-line px-3 py-2 text-xs font-semibold text-shell-mute transition-colors hover:text-shell-ink">
                  Full type library
                  <ChevronDown
                    size={14}
                    className="transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  />
                </summary>
                <div className="mt-2 grid max-h-44 grid-cols-2 gap-1.5 overflow-y-auto scrollbar-thin pr-1">
                  {fontPairings.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={f.id === fontId}
                      onClick={() => setFontId(f.id)}
                      className={`flex items-center justify-between gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors ${
                        f.id === fontId
                          ? 'border-shell-glow bg-shell-glow/15 font-semibold text-shell-ink'
                          : 'border-shell-line text-shell-mute hover:border-shell-glow/40 hover:text-shell-ink'
                      }`}
                      style={{ fontFamily: `"${f.heading.family}", system-ui, sans-serif` }}
                    >
                      <span className="truncate">{f.name}</span>
                      {f.id === fontId && <Check size={12} className="shrink-0 text-shell-glow" />}
                    </button>
                  ))}
                </div>
              </details>
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

            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-shell-line bg-shell-base/60 p-3">
              <Mail size={15} className="shrink-0 text-shell-glow" />
              <p className="min-w-0 text-xs leading-relaxed text-shell-mute">
                The send form below includes the live palette, type, layout, motion, and notes.
              </p>
            </div>
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

function SignalPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-shell-line bg-shell-panel/70 px-3 py-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-shell-glow/10 text-shell-glow">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-shell-mute">{label}</div>
        <div className="truncate text-sm font-semibold text-shell-ink">{value}</div>
      </div>
    </div>
  );
}

function ThemeSeedButton({
  theme,
  active,
  onClick,
}: {
  theme: Theme;
  active: boolean;
  onClick: () => void;
}) {
  const p = paletteById(theme.paletteId);
  const f = fontPairingById(theme.fontPairingId);
  if (!p || !f) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-2.5 text-left transition-[border-color,background-color,transform] motion-safe:hover:-translate-y-0.5 ${
        active
          ? 'border-shell-glow bg-shell-glow/10 text-shell-ink'
          : 'border-shell-line bg-shell-base/45 text-shell-mute hover:border-shell-glow/45 hover:text-shell-ink'
      }`}
    >
      <span
        aria-hidden
        className="h-11 w-11 rounded-xl ring-1 ring-black/20"
        style={{
          background: `linear-gradient(135deg, ${p.colors.primary}, ${p.colors.secondary} 52%, ${p.colors.accent})`,
        }}
      />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{theme.name}</span>
        <span className="mt-0.5 block truncate text-[11px] text-shell-mute">{p.name} · {f.name}</span>
      </span>
      {active && <Check size={14} className="text-shell-glow" />}
    </button>
  );
}

function PaletteButton({
  palette,
  active,
  onClick,
}: {
  palette: Palette;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={palette.name}
      title={palette.name}
      onClick={onClick}
      className={`aspect-square min-h-9 rounded-xl ring-2 ring-offset-2 ring-offset-shell-panel transition-transform hover:scale-105 ${
        active ? 'scale-105 ring-shell-glow' : 'ring-transparent hover:ring-shell-line'
      }`}
      style={{
        background: `linear-gradient(135deg, ${palette.colors.primary} 0 45%, ${palette.colors.secondary} 45% 70%, ${palette.colors.accent} 70% 100%)`,
      }}
    />
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
