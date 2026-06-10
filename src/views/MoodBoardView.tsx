import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { m as motion, useReducedMotion } from 'framer-motion';
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
  Star,
  Type,
  Wand2,
} from 'lucide-react';
import { decodeBoard, encodeBoard } from './shareBoard';
import { INDUSTRIES, INDUSTRY_LABELS, MOODS } from '../data/taxonomy';
import { recommendThemes } from '../lib/quiz';
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
import { themeById, themes } from '../data/themes';
import type { AnimationIntensity, Industry, Mood, Palette, Theme } from '../types';
import { loadFonts } from '../theme/loadFonts';
import Button, { buttonClasses } from '../components/ui/Button';
import ThemeTicker from '../components/layout/ThemeTicker';
import PreviewStage from '../components/preview/PreviewStage';
import MotionPicker from '../components/moodboard/MotionPicker';
import BriefSummary from '../components/client/BriefSummary';
import SendBrief from '../components/client/SendBrief';

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

// Themes outside the curated quick-picks have no hand-tuned effect set — seed
// them with a sensible default for their motion intensity instead.
const INTENSITY_EFFECTS: Record<AnimationIntensity, string[]> = {
  subtle: ['fade-up'],
  standard: ['fade-up', 'hover-lift'],
  expressive: ['stagger-reveal', 'hover-lift', 'gradient-drift'],
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
  // Bumped by the motion panel's Replay so one-shot entrances can be re-watched.
  const [replaySignal, setReplaySignal] = useState(0);

  const palette = useMemo(() => paletteById(paletteId)!, [paletteId]);
  const fonts = useMemo(() => fontPairingById(fontId)!, [fontId]);

  // Only the active pairing's fonts load up front — the dropdown menu loads the
  // rest of the library the first time it opens.
  useEffect(() => {
    const pairing = fontPairingById(fontId);
    if (pairing) loadFonts(pairing);
  }, [fontId]);

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
      scheme: 'auto',
      voice: 'auto',
      backdrop: 'auto',
      logoStyle: 'pulse',
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
    const effects = THEME_EFFECTS[themeId] ?? INTENSITY_EFFECTS[theme.animationIntensity];
    setAnimationIds(effects);
  };

  const reset = () => {
    setPaletteId(DEFAULT_PALETTE_ID);
    setFontId(DEFAULT_FONT_ID);
    setConfig(DEFAULT_CONFIG);
    setBrand('Your Practice');
    setNotes('');
    setAnimationIds(DEFAULT_ANIMATIONS);
  };

  // Highlight a seed tile when the current palette + font match that theme.
  const activeThemeId = useMemo(
    () =>
      themes.find((t) => t.paletteId === paletteId && t.fontPairingId === fontId)?.id ?? null,
    [paletteId, fontId],
  );

  // "Find your direction" organizer — the guided-quiz concept, folded inline.
  // Picking an industry and/or up to three vibe words re-ranks the seed tiles
  // using the same scoring the old quiz used; clearing returns to the curated set.
  const [guideIndustry, setGuideIndustry] = useState<Industry | null>(null);
  const [guideVibes, setGuideVibes] = useState<Mood[]>([]);
  const guideActive = guideIndustry !== null || guideVibes.length > 0;
  const guidedPicks = useMemo(() => {
    if (!guideActive) return null;
    return recommendThemes(
      {
        industry: guideIndustry,
        vibes: guideVibes,
        scheme: 'either',
        energy: 'standard',
        density: 'between',
      },
      themes,
      6,
    );
  }, [guideActive, guideIndustry, guideVibes]);
  const toggleGuideVibe = (vibe: Mood) => {
    setGuideVibes((vs) =>
      vs.includes(vibe) ? vs.filter((v) => v !== vibe) : vs.length >= 3 ? vs : [...vs, vibe],
    );
  };
  const clearGuide = () => {
    setGuideIndustry(null);
    setGuideVibes([]);
  };

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
      <section className="relative overflow-hidden border-b border-shell-line pb-5">
        {/* Sculpted-paper hero art, one per shell mode: charcoal ribbon with a
            warm edge light (dark) / ivory folds in soft daylight (light).
            Backgrounds, not <img> — the hidden mode's file never downloads.
            The shell-base scrims re-tint themselves when the mode flips. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="hero-art-dark absolute inset-0 bg-cover bg-right"
            style={{ backgroundImage: 'url(/shell/hero-dark.webp)' }}
          />
          <div
            className="hero-art-light absolute inset-0 bg-cover bg-right"
            style={{ backgroundImage: 'url(/shell/hero-light.webp)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-shell-base via-shell-base/70 to-shell-base/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-shell-base via-transparent to-transparent" />
        </div>
        {/* gallery lighting: two glows that slowly wander (frozen for reduced motion) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 -top-32 h-72 w-72 rounded-full bg-shell-glow/10 blur-[96px] motion-safe:animate-glow-drift"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-24 h-56 w-56 rounded-full bg-shell-glow/[0.06] blur-[80px] motion-safe:animate-glow-drift [animation-delay:-7s]"
        />
        <div className="relative flex flex-col gap-4 sm:gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-shell-line bg-shell-panel/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
              <Sparkles size={13} className="text-shell-glow" />
              Tech SLP Studio Mood Board
            </div>
            <h1 className="font-display text-[2.15rem] font-semibold leading-[0.98] tracking-tight text-shell-ink sm:text-6xl xl:text-7xl">
              Stop describing your dream website.{' '}
              <span className="text-shell-glow">Point at it.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-shell-mute sm:mt-4 sm:text-lg">
              Start from a styled direction, tune the palette and type live, then send a clean
              brief the moment the preview feels right.
            </p>
            <p className="mt-3 text-sm text-shell-mute">
              Not sure where to start?{' '}
              <a
                href="#find-direction"
                className="font-semibold text-shell-glow underline decoration-shell-glow/40 underline-offset-2 hover:decoration-shell-glow"
              >
                Tell us the vibe and we&rsquo;ll rank the directions
              </a>
              .
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

        <div className="relative mt-4 grid grid-cols-3 gap-1.5 sm:gap-2">
          <SignalPill icon={<PaletteIcon size={14} />} label="Palette" value={palette.name} />
          <SignalPill icon={<Type size={14} />} label="Type" value={fonts.name} />
          <SignalPill
            icon={<Wand2 size={14} />}
            label="Motion"
            value={`${animationIds.length || 'No'} effect${animationIds.length === 1 ? '' : 's'}`}
          />
        </div>
      </section>

      <ThemeTicker />

      <HowItWorks />

      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px] xl:items-start">
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
            replaySignal={replaySignal}
          />
        </div>

        <div className="space-y-5">
          <div className="rounded-[28px] border border-shell-line bg-shell-panel p-4 shadow-[0_20px_70px_-55px_rgba(0,0,0,0.8)] sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-semibold text-shell-ink">Shape the brief</h2>
                <p className="mt-0.5 text-xs leading-relaxed text-shell-mute">
                  {activeThemeId ? themeById(activeThemeId)?.tagline : 'Custom direction'}
                </p>
              </div>
              <Button tone="danger" size="sm" onClick={reset} className="shrink-0 whitespace-nowrap">
                <RotateCcw size={13} /> Start over
              </Button>
            </div>

            <div id="find-direction" className="mb-5 scroll-mt-24">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
                  <Sparkles size={12} className="text-shell-glow" />
                  Find your direction
                </div>
                {guideActive && (
                  <button
                    type="button"
                    onClick={clearGuide}
                    className="text-[11px] font-semibold text-shell-mute transition-colors hover:text-shell-ink"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* the quiz, folded in: tap your world + up to 3 vibe words */}
              <div className="mb-2.5 flex flex-wrap gap-1">
                {INDUSTRIES.map((i) => (
                  <GuideChip
                    key={i}
                    label={INDUSTRY_LABELS[i]}
                    active={guideIndustry === i}
                    onClick={() => setGuideIndustry((cur) => (cur === i ? null : i))}
                  />
                ))}
              </div>
              <div className="mb-3 flex flex-wrap gap-1">
                {MOODS.map((mood) => (
                  <GuideChip
                    key={mood}
                    label={mood}
                    active={guideVibes.includes(mood)}
                    onClick={() => toggleGuideVibe(mood)}
                    capitalize
                    hue="violet"
                  />
                ))}
              </div>

              {guidedPicks && (
                <p className="mb-2 text-[11px] text-shell-mute" aria-live="polite">
                  Ranked for you — best match first.
                </p>
              )}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(guidedPicks
                  ? guidedPicks.map(({ theme, reasons }) => ({
                      theme,
                      subtitle: reasons.length ? reasons[0] : undefined,
                    }))
                  : QUICK_PICK_THEMES.map((theme) => ({ theme, subtitle: undefined }))
                ).map(({ theme, subtitle }) => (
                  <ThemeSeedButton
                    key={theme.id}
                    theme={theme}
                    subtitle={subtitle}
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

            <Field label="Color palette">
              <PalettePicker value={paletteId} onChange={setPaletteId} />
            </Field>

            <Field label="Type pairing">
              <FontPicker value={fontId} onChange={setFontId} />
            </Field>

            <MotionPicker
              selected={animationIds}
              onToggle={toggleAnimation}
              onClear={() => setAnimationIds([])}
              onReplay={() => setReplaySignal((n) => n + 1)}
            />

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

// Four-step orientation strip so first-time visitors instantly get the flow.
// Scroll-revealed with a gentle stagger; plain mount for reduced-motion users.
const HOW_IT_WORKS_STEPS = [
  {
    icon: <Sparkles size={16} />,
    title: 'Start from a style',
    body: 'Seed the board from a designer-built direction — never a blank page.',
  },
  {
    icon: <PaletteIcon size={16} />,
    title: 'Make it yours',
    body: 'Tune palette, type, layout, and motion and watch the preview restyle live.',
  },
  {
    icon: <Star size={16} />,
    title: 'Star what you love',
    body: 'Shortlist themes, palettes, and effects from the gallery as you browse.',
  },
  {
    icon: <Mail size={16} />,
    title: 'Send the brief',
    body: 'One click emails Kristine your exact picks — colors, type, and notes included.',
  },
];

function HowItWorks() {
  const reduce = useReducedMotion();
  return (
    <section aria-label="How it works" className="border-b border-shell-line py-4">
      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {HOW_IT_WORKS_STEPS.map((step, i) => (
          <motion.li
            key={step.title}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex items-start gap-3 rounded-2xl border border-shell-line bg-shell-panel/50 p-3.5"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-shell-glow/10 text-shell-glow">
              {step.icon}
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[11px] font-semibold text-shell-glow">
                  0{i + 1}
                </span>
                <h3 className="text-sm font-semibold text-shell-ink">{step.title}</h3>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-shell-mute">{step.body}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
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
    <div className="flex min-w-0 items-center gap-1.5 rounded-2xl border border-shell-line bg-shell-panel/70 px-2 py-2 sm:gap-2 sm:px-3 sm:py-2.5">
      <span className="hidden h-7 w-7 shrink-0 place-items-center rounded-full bg-shell-glow/10 text-shell-glow sm:grid">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-shell-mute sm:text-[11px]">
          {label}
        </div>
        <div className="truncate text-xs font-semibold text-shell-ink sm:text-sm">{value}</div>
      </div>
    </div>
  );
}

// Two chip families, two hues: sky = "your world" (industry), violet = "your
// vibe" — the same color language the motion picker uses for its categories.
const GUIDE_HUES = {
  sky: {
    on: 'border-transparent bg-sky-600 text-white shadow-sm shadow-sky-600/30',
    off: 'border-shell-line bg-shell-base/45 text-shell-mute hover:border-sky-400/60 hover:text-shell-ink',
  },
  violet: {
    on: 'border-transparent bg-violet-600 text-white shadow-sm shadow-violet-600/30',
    off: 'border-shell-line bg-shell-base/45 text-shell-mute hover:border-violet-400/60 hover:text-shell-ink',
  },
} as const;

function GuideChip({
  label,
  active,
  onClick,
  capitalize = false,
  hue = 'sky',
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  capitalize?: boolean;
  hue?: keyof typeof GUIDE_HUES;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-2 py-1 text-[11px] font-semibold transition-colors ${
        capitalize ? 'capitalize' : ''
      } ${active ? GUIDE_HUES[hue].on : GUIDE_HUES[hue].off}`}
    >
      {label}
    </button>
  );
}

function ThemeSeedButton({
  theme,
  active,
  onClick,
  subtitle,
}: {
  theme: Theme;
  active: boolean;
  onClick: () => void;
  /** Optional override for the palette·font line — used for "why this" reasons. */
  subtitle?: string;
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
        <span className="mt-0.5 block truncate text-[11px] text-shell-mute">
          {subtitle ?? `${p.name} · ${f.name}`}
        </span>
      </span>
      {active && <Check size={14} className="text-shell-glow" />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Compact dropdown pickers — the palette/type libraries live behind one clean
// control each instead of sprawling swatch grids, so the panel stays short.
// ---------------------------------------------------------------------------

// Shared popover behavior: closes on outside pointer or Escape.
function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

// Mini strip: page background + the three role colors in order — a truer
// "what you'll get" preview than a diagonal gradient blob.
function PaletteSwatch({ palette, className }: { palette: Palette; className?: string }) {
  const { background, primary, secondary, accent } = palette.colors;
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 rounded-md ring-1 ring-black/20 ${className ?? 'h-5 w-12'}`}
      style={{
        background: `linear-gradient(90deg, ${background} 0 25%, ${primary} 25% 50%, ${secondary} 50% 75%, ${accent} 75% 100%)`,
      }}
    />
  );
}

function DropdownPanel({
  label,
  search,
  children,
}: {
  label: string;
  search?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="absolute inset-x-0 z-30 mt-2 overflow-hidden rounded-2xl border border-shell-line bg-shell-panel shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75)]">
      {search}
      <div role="listbox" aria-label={label} className="max-h-72 overflow-y-auto scrollbar-thin p-1.5">
        {children}
      </div>
    </div>
  );
}

// Type-to-filter row at the top of a picker menu. Enter picks the first match.
// Focus is only grabbed on fine-pointer devices — on phones an auto-focused
// input pops the keyboard over the very list the client is trying to read.
function MenuSearch({
  value,
  onChange,
  onPickFirst,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  onPickFirst: () => void;
  placeholder: string;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus();
  }, []);
  return (
    <div className="border-b border-shell-line p-1.5">
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onPickFirst();
          }
        }}
        placeholder={placeholder}
        aria-label={label}
        className="w-full rounded-lg border border-transparent bg-shell-base px-2.5 py-1.5 text-sm text-shell-ink placeholder:text-shell-mute focus:border-shell-glow/50 focus:outline-none"
      />
    </div>
  );
}

function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
      {children}
    </div>
  );
}

function PalettePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { open, setOpen, ref } = useDropdown();
  const [query, setQuery] = useState('');
  const current = paletteById(value);
  const featuredIds = useMemo(() => new Set(FEATURED_PALETTES.map((p) => p.id)), []);
  const rest = useMemo(() => palettes.filter((p) => !featuredIds.has(p.id)), [featuredIds]);
  // EVERY palette gets a stable number — featured ranks 01–10, then the library
  // in order. The number is a shorthand clients can quote back ("we liked 23").
  const numberOf = useMemo(() => {
    const m = new Map<string, number>();
    [...FEATURED_PALETTES, ...rest].forEach((p, i) => m.set(p.id, i + 1));
    return m;
  }, [rest]);

  // Bring the current pick into view each time the menu opens (the search
  // field resets in the trigger handler — setState in effects is banned).
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      ref.current
        ?.querySelector('[role="option"][aria-selected="true"]')
        ?.scrollIntoView({ block: 'nearest' });
    });
  }, [open, ref]);
  if (!current) return null;

  const q = query.trim().toLowerCase();
  const matches = (p: Palette) =>
    !q || p.name.toLowerCase().includes(q) || p.moods.some((m) => m.includes(q));
  const shownFeatured = FEATURED_PALETTES.filter(matches);
  const shownRest = rest.filter(matches);

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
  };
  const num = (id: string) => String(numberOf.get(id) ?? 0).padStart(2, '0');
  const row = (p: Palette) => (
    <button
      key={p.id}
      type="button"
      role="option"
      aria-selected={p.id === value}
      onClick={() => pick(p.id)}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
        p.id === value
          ? 'bg-shell-glow/10 font-semibold text-shell-ink'
          : 'text-shell-ink/85 hover:bg-shell-base hover:text-shell-ink'
      }`}
    >
      <span className="w-5 shrink-0 font-display text-[11px] font-semibold tabular-nums text-shell-glow">
        {num(p.id)}
      </span>
      <PaletteSwatch palette={p} />
      <span className="min-w-0 flex-1 truncate">{p.name}</span>
      <span className="text-[11px] text-shell-mute">{p.isDark ? 'Dark' : 'Light'}</span>
      {p.id === value && <Check size={13} className="shrink-0 text-shell-glow" />}
    </button>
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Color palette: ${current.name}`}
        onClick={() => {
          setQuery('');
          setOpen((o) => !o);
        }}
        className="flex w-full items-center gap-2.5 rounded-xl border border-shell-line bg-shell-base px-3 py-2.5 text-left transition-colors hover:border-shell-glow/50"
      >
        <span className="shrink-0 font-display text-[11px] font-semibold tabular-nums text-shell-glow">
          {num(current.id)}
        </span>
        <PaletteSwatch palette={current} className="h-6 w-14" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-shell-ink">
          {current.name}
        </span>
        <span className="text-[11px] text-shell-mute">{current.isDark ? 'Dark' : 'Light'}</span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-shell-mute transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <DropdownPanel
          label="Color palette"
          search={
            <MenuSearch
              value={query}
              onChange={setQuery}
              onPickFirst={() => {
                const first = shownFeatured[0] ?? shownRest[0];
                if (first) pick(first.id);
              }}
              placeholder={`Search ${palettes.length} palettes — try "warm" or "bold"`}
              label="Search palettes"
            />
          }
        >
          {shownFeatured.length > 0 && <GroupLabel>Featured</GroupLabel>}
          {shownFeatured.map(row)}
          {shownRest.length > 0 && <GroupLabel>Everything else</GroupLabel>}
          {shownRest.map(row)}
          {shownFeatured.length === 0 && shownRest.length === 0 && (
            <p className="px-2.5 py-3 text-sm text-shell-mute">Nothing matches “{query}”.</p>
          )}
        </DropdownPanel>
      )}
    </div>
  );
}

function FontPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { open, setOpen, ref } = useDropdown();
  const current = fontPairingById(value);
  const featuredIds = useMemo(() => new Set(FEATURED_FONTS.map((f) => f.id)), []);
  const rest = useMemo(() => fontPairings.filter((f) => !featuredIds.has(f.id)), [featuredIds]);

  const [query, setQuery] = useState('');

  // The menu shows every name in its own face — fetch the library's fonts the
  // first time it opens (display=swap keeps the names readable while loading).
  // Also bring the current pairing into view; search resets in the trigger.
  useEffect(() => {
    if (!open) return;
    fontPairings.forEach(loadFonts);
    requestAnimationFrame(() => {
      ref.current
        ?.querySelector('[role="option"][aria-selected="true"]')
        ?.scrollIntoView({ block: 'nearest' });
    });
  }, [open, ref]);
  if (!current) return null;

  const q = query.trim().toLowerCase();
  const matches = (f: (typeof fontPairings)[number]) =>
    !q ||
    f.name.toLowerCase().includes(q) ||
    f.heading.family.toLowerCase().includes(q) ||
    f.body.family.toLowerCase().includes(q);
  const shownFeatured = FEATURED_FONTS.filter(matches);
  const shownRest = rest.filter(matches);

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
  };
  const row = (f: (typeof fontPairings)[number]) => (
    <button
      key={f.id}
      type="button"
      role="option"
      aria-selected={f.id === value}
      onClick={() => pick(f.id)}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
        f.id === value
          ? 'bg-shell-glow/10 text-shell-ink'
          : 'text-shell-ink/85 hover:bg-shell-base hover:text-shell-ink'
      }`}
    >
      <span
        className="min-w-0 flex-1 truncate text-[15px]"
        style={{ fontFamily: `"${f.heading.family}", system-ui, sans-serif` }}
      >
        {f.name}
      </span>
      <span className="hidden truncate text-[11px] text-shell-mute sm:block">
        {f.heading.family}
      </span>
      {f.id === value && <Check size={13} className="shrink-0 text-shell-glow" />}
    </button>
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Type pairing: ${current.name}`}
        onClick={() => {
          setQuery('');
          setOpen((o) => !o);
        }}
        className="flex w-full items-center gap-2.5 rounded-xl border border-shell-line bg-shell-base px-3 py-2.5 text-left transition-colors hover:border-shell-glow/50"
      >
        <span
          className="min-w-0 flex-1 truncate text-[15px] font-semibold text-shell-ink"
          style={{ fontFamily: `"${current.heading.family}", system-ui, sans-serif` }}
        >
          {current.name}
        </span>
        <span className="hidden text-[11px] text-shell-mute sm:block">
          {current.heading.family} + {current.body.family}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-shell-mute transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <DropdownPanel
          label="Type pairing"
          search={
            <MenuSearch
              value={query}
              onChange={setQuery}
              onPickFirst={() => {
                const first = shownFeatured[0] ?? shownRest[0];
                if (first) pick(first.id);
              }}
              placeholder={`Search ${fontPairings.length} pairings by name or typeface`}
              label="Search type pairings"
            />
          }
        >
          {shownFeatured.length > 0 && <GroupLabel>Featured</GroupLabel>}
          {shownFeatured.map(row)}
          {shownRest.length > 0 && <GroupLabel>Everything else</GroupLabel>}
          {shownRest.map(row)}
          {shownFeatured.length === 0 && shownRest.length === 0 && (
            <p className="px-2.5 py-3 text-sm text-shell-mute">Nothing matches “{query}”.</p>
          )}
        </DropdownPanel>
      )}
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
  const cls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-shell-mute';
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
