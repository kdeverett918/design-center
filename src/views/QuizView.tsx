import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, m as motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Compass,
  Crown,
  Dumbbell,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Leaf,
  Palette as PaletteIcon,
  RotateCcw,
  Rocket,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  Wand2,
} from 'lucide-react';
import type { AnimationIntensity, Industry, Mood, Palette, Theme } from '../types';
import { INDUSTRIES, MOODS } from '../data/taxonomy';
import { themes } from '../data/themes';
import { paletteById } from '../data/palettes';
import { fontPairingById } from '../data/fonts';
import type { DensityPreference, QuizAnswers, SchemePreference } from '../lib/quiz';
import { recommendThemes } from '../lib/quiz';
import { configForTheme } from '../preview/previewConfig';
import { encodeBoard } from './shareBoard';
import { loadFonts } from '../theme/loadFonts';
import { colorVars } from '../theme/applyTheme';
import ThemedScope from '../theme/ThemedScope';
import MiniSamplePage from '../components/preview/MiniSamplePage';
import Button, { buttonClasses } from '../components/ui/Button';

// The signature easings: premium for micro, expo for macro reveals.
const EASE_PREMIUM = [0.25, 0.46, 0.45, 0.94] as const;
const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

// Friendly client-facing labels + icons over the raw taxonomy slugs.
const INDUSTRY_META: Record<Industry, { label: string; icon: ReactNode }> = {
  healthcare: { label: 'Healthcare & therapy', icon: <HeartPulse size={15} /> },
  wellness: { label: 'Wellness', icon: <Leaf size={15} /> },
  education: { label: 'Education & kids', icon: <GraduationCap size={15} /> },
  professional: { label: 'Professional services', icon: <Briefcase size={15} /> },
  saas: { label: 'Tech & SaaS', icon: <Rocket size={15} /> },
  creative: { label: 'Creative & portfolio', icon: <PaletteIcon size={15} /> },
  ecommerce: { label: 'Shop & e-commerce', icon: <ShoppingBag size={15} /> },
  nonprofit: { label: 'Nonprofit', icon: <HeartHandshake size={15} /> },
  hospitality: { label: 'Food & hospitality', icon: <UtensilsCrossed size={15} /> },
  fitness: { label: 'Fitness & movement', icon: <Dumbbell size={15} /> },
};

// Every vibe word wears its own outfit — the chip IS the design library talking.
// Fonts come from real library pairings (resolved + loaded at runtime); hues are
// decorative dots/tints only, so legibility never depends on them.
const VIBE_STYLES: Record<Mood, { fontId: string; hue: string; extra?: CSSProperties }> = {
  trustworthy: { fontId: 'masthead', hue: '#5c8bd9' },
  calm: { fontId: 'manuscript', hue: '#74b6c7', extra: { fontStyle: 'italic' } },
  warm: { fontId: 'hearth', hue: '#e0a05c' },
  organic: { fontId: 'garden', hue: '#84b078' },
  elegant: { fontId: 'couture', hue: '#cbb279', extra: { letterSpacing: '0.04em' } },
  premium: { fontId: 'maison', hue: '#d4af37' },
  minimal: {
    fontId: 'telemetry',
    hue: '#9aa3ad',
    extra: { letterSpacing: '0.22em', textTransform: 'uppercase', fontSize: '0.72rem' },
  },
  professional: { fontId: 'scholar', hue: '#7f93c4' },
  bold: { fontId: 'rebar', hue: '#e2604f', extra: { textTransform: 'uppercase' } },
  playful: { fontId: 'jellybean', hue: '#ef7fb3' },
  energetic: { fontId: 'voltage', hue: '#a8d23c' },
};

const SCHEME_OPTIONS: { id: SchemePreference; label: string; hint: string }[] = [
  { id: 'light', label: 'Bright & airy', hint: 'light backgrounds, lots of breathing room' },
  { id: 'dark', label: 'Dark & dramatic', hint: 'deep backgrounds, gallery-at-night feel' },
  { id: 'either', label: 'Surprise me', hint: 'no strong preference' },
];

const ENERGY_OPTIONS: { id: AnimationIntensity; label: string; hint: string }[] = [
  { id: 'subtle', label: 'Calm & steady', hint: 'gentle fades, nothing moves unless it must' },
  { id: 'standard', label: 'Balanced', hint: 'polished motion that stays out of the way' },
  { id: 'expressive', label: 'Energetic', hint: 'animation is part of the personality' },
];

const DENSITY_OPTIONS: { id: DensityPreference; label: string; hint: string }[] = [
  { id: 'minimal', label: 'Minimal & clean', hint: 'every element earns its place' },
  { id: 'expressive', label: 'Decorative & expressive', hint: 'texture, color, flourish' },
  { id: 'between', label: 'Somewhere between', hint: 'styled, but not shouting' },
];

const STEP_LABELS = ['Your world', 'The vibe', 'Light or dark', 'Motion', 'Density'];
const TOTAL_STEPS = 5;

const DEFAULT_ANSWERS: QuizAnswers = {
  industry: null,
  vibes: [],
  scheme: 'either',
  energy: 'standard',
  density: 'between',
};

// Palettes that dress the light/dark answer mocks (real library tokens).
const LIGHT_MOCK_PALETTE = 'meridian';
const DARK_MOCK_PALETTE = 'bluehour';

export default function QuizView() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(DEFAULT_ANSWERS);
  const done = step >= TOTAL_STEPS;

  // Load the vibe-chip faces once so each word renders in its own typeface.
  useEffect(() => {
    Object.values(VIBE_STYLES).forEach(({ fontId }) => {
      const pairing = fontPairingById(fontId);
      if (pairing) loadFonts(pairing);
    });
  }, []);

  const recs = useMemo(() => recommendThemes(answers), [answers]);

  // The library visibly narrows as hard constraints land (soft prefs don't cut).
  const matching = useMemo(() => {
    return themes.filter((t) => {
      if (step > 0 && answers.industry && !t.industries.includes(answers.industry)) return false;
      if (step > 1 && answers.vibes.length > 0 && !answers.vibes.some((v) => t.moods.includes(v)))
        return false;
      if (step > 2 && answers.scheme !== 'either') {
        const p = paletteById(t.paletteId);
        if (p && p.isDark !== (answers.scheme === 'dark')) return false;
      }
      return true;
    });
  }, [answers, step]);

  const anyAnswer = step > 0;
  const leading = anyAnswer ? recs[0] : undefined;

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const retake = () => {
    setAnswers(DEFAULT_ANSWERS);
    setStep(0);
  };

  const pickIndustry = (industry: Industry | null) => {
    setAnswers((a) => ({ ...a, industry }));
    next();
  };
  const toggleVibe = (vibe: Mood) => {
    setAnswers((a) => ({
      ...a,
      vibes: a.vibes.includes(vibe)
        ? a.vibes.filter((v) => v !== vibe)
        : a.vibes.length >= 3
          ? a.vibes
          : [...a.vibes, vibe],
    }));
  };
  const pickScheme = (scheme: SchemePreference) => {
    setAnswers((a) => ({ ...a, scheme }));
    next();
  };
  const pickEnergy = (energy: AnimationIntensity) => {
    setAnswers((a) => ({ ...a, energy }));
    next();
  };
  const pickDensity = (density: DensityPreference) => {
    setAnswers((a) => ({ ...a, density }));
    next();
  };

  // "Start from this" → seed a mood board exactly like the home quick-picks do.
  const boardLinkFor = (theme: Theme): string => {
    const token = encodeBoard({
      paletteId: theme.paletteId,
      fontId: theme.fontPairingId,
      config: configForTheme(theme),
      brand: 'Your Practice',
      notes: '',
      animationIds: [],
    });
    return `/?b=${token}`;
  };

  // Match strength relative to what THIS client could have scored.
  const maxPossible =
    (answers.industry ? 3 : 0) +
    answers.vibes.length * 3 +
    (answers.scheme !== 'either' ? 2 : 0) +
    2 +
    1;

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-8">
      {/* drifting gallery light — quiz shares the shell's lit-room feel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-shell-glow/10 blur-[100px] motion-safe:animate-glow-drift"
      />

      <div className="relative">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-shell-line bg-shell-panel/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
          <Compass size={13} className="text-shell-glow" />
          Guided start
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-shell-ink sm:text-5xl">
          {done ? 'Your shortlist, decided.' : 'Five questions. Zero overwhelm.'}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-shell-mute sm:text-base">
          {done
            ? 'These directions scored highest against your answers — every one previews live.'
            : 'Answer like you would over coffee — watch the library narrow itself down on the right.'}
        </p>
      </div>

      {!done ? (
        <div className="relative mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div className="relative min-w-0">
            {/* oversized ghost numeral — editorial wayfinding, not chrome */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-2 -top-12 select-none font-display text-[9rem] font-semibold leading-none text-shell-ink/[0.05] sm:text-[12rem]"
            >
              0{step + 1}
            </div>

            {/* progress — a lit fuse, not five gray dots */}
            <div
              className="relative z-10"
              aria-label={`Question ${step + 1} of ${TOTAL_STEPS}: ${STEP_LABELS[step]}`}
            >
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-shell-glow">
                  {STEP_LABELS[step]}
                </span>
                <span aria-hidden="true" className="h-px w-5 bg-shell-line" />
                <span className="text-xs tabular-nums text-shell-mute">
                  {step + 1} / {TOTAL_STEPS}
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-shell-line">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-shell-glow/50 via-shell-glow to-shell-glow"
                  initial={false}
                  animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
                  transition={{ duration: 0.6, ease: EASE_EXPO }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: EASE_EXPO }}
                className="relative mt-8"
              >
                {step === 0 && (
                  <Question title="What kind of practice or business is this for?">
                    <Stagger className="flex flex-wrap gap-2">
                      {INDUSTRIES.map((i) => (
                        <StaggerItem key={i}>
                          <button
                            type="button"
                            onClick={() => pickIndustry(i)}
                            aria-pressed={answers.industry === i}
                            className="group flex items-center gap-2 rounded-full border border-shell-line bg-shell-panel px-4 py-2.5 text-sm font-semibold text-shell-mute transition-all duration-300 ease-premium hover:border-shell-glow/60 hover:text-shell-ink motion-safe:hover:-translate-y-0.5"
                          >
                            <span className="text-shell-glow/70 transition-colors group-hover:text-shell-glow">
                              {INDUSTRY_META[i].icon}
                            </span>
                            {INDUSTRY_META[i].label}
                          </button>
                        </StaggerItem>
                      ))}
                      <StaggerItem>
                        <button
                          type="button"
                          onClick={() => pickIndustry(null)}
                          className="group flex items-center gap-2 rounded-full border border-dashed border-shell-line bg-transparent px-4 py-2.5 text-sm font-semibold text-shell-mute transition-all duration-300 ease-premium hover:border-shell-glow/60 hover:text-shell-ink motion-safe:hover:-translate-y-0.5"
                        >
                          <Sparkles size={15} className="text-shell-glow/70 group-hover:text-shell-glow" />
                          Something else
                        </button>
                      </StaggerItem>
                    </Stagger>
                  </Question>
                )}

                {step === 1 && (
                  <Question
                    title="Pick up to three words for the vibe."
                    hint="Each word is dressed in a face from the library — trust the one that makes you look twice."
                  >
                    <Stagger className="flex flex-wrap items-center gap-2.5">
                      {MOODS.map((m) => (
                        <StaggerItem key={m}>
                          <VibeChip
                            mood={m}
                            active={answers.vibes.includes(m)}
                            onClick={() => toggleVibe(m)}
                          />
                        </StaggerItem>
                      ))}
                    </Stagger>
                    <div className="mt-7 flex items-center gap-3">
                      <Button tone="primary" onClick={next} disabled={answers.vibes.length === 0}>
                        Next <ArrowRight size={15} />
                      </Button>
                      <span className="text-xs text-shell-mute" aria-live="polite">
                        {answers.vibes.length === 0
                          ? 'Pick at least one'
                          : `${answers.vibes.length} of 3 chosen`}
                      </span>
                    </div>
                  </Question>
                )}

                {step === 2 && (
                  <Question title="Light or dark?">
                    <Stagger className="grid gap-4 sm:grid-cols-3">
                      {SCHEME_OPTIONS.map((o) => (
                        <StaggerItem key={o.id}>
                          <SchemeCard
                            option={o}
                            active={answers.scheme === o.id}
                            onPick={() => pickScheme(o.id)}
                          />
                        </StaggerItem>
                      ))}
                    </Stagger>
                  </Question>
                )}

                {step === 3 && (
                  <Question
                    title="How much should it move?"
                    hint="The cards below are already moving the way your site would."
                  >
                    <Stagger className="grid gap-4 sm:grid-cols-3">
                      {ENERGY_OPTIONS.map((o) => (
                        <StaggerItem key={o.id}>
                          <EnergyCard
                            option={o}
                            active={answers.energy === o.id}
                            onPick={() => pickEnergy(o.id)}
                          />
                        </StaggerItem>
                      ))}
                    </Stagger>
                  </Question>
                )}

                {step === 4 && (
                  <Question title="Minimal or decorative?">
                    <Stagger className="grid gap-4 sm:grid-cols-3">
                      {DENSITY_OPTIONS.map((o) => (
                        <StaggerItem key={o.id}>
                          <DensityCard
                            option={o}
                            active={answers.density === o.id}
                            onPick={() => pickDensity(o.id)}
                          />
                        </StaggerItem>
                      ))}
                    </Stagger>
                  </Question>
                )}
              </motion.div>
            </AnimatePresence>

            {step > 0 && (
              <button
                type="button"
                onClick={back}
                className="mt-9 inline-flex items-center gap-1.5 text-sm font-semibold text-shell-mute transition-colors hover:text-shell-ink"
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}
          </div>

          {/* the narrowing rail — the library converging in real time */}
          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <div className="rounded-3xl border border-shell-line bg-shell-panel/60 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
                  Still in the running
                </span>
                <span className="font-display text-2xl font-semibold tabular-nums text-shell-ink">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={matching.length}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: EASE_PREMIUM }}
                      className="inline-block"
                    >
                      {matching.length}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-sm font-normal text-shell-mute"> / {themes.length}</span>
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-shell-line">
                <motion.div
                  className="h-full rounded-full bg-shell-glow/70"
                  initial={false}
                  animate={{ width: `${Math.max(6, (matching.length / themes.length) * 100)}%` }}
                  transition={{ duration: 0.5, ease: EASE_EXPO }}
                />
              </div>

              {leading ? (
                <div className="mt-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
                    Currently leading
                  </span>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={leading.theme.id}
                      initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reduce ? undefined : { opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.35, ease: EASE_PREMIUM }}
                      className="mt-2 overflow-hidden rounded-2xl border border-shell-line"
                    >
                      <LiveThemeMini theme={leading.theme} height="h-32" />
                      <div className="bg-shell-panel px-3 py-2.5">
                        <div className="font-display text-sm font-semibold text-shell-ink">
                          {leading.theme.name}
                        </div>
                        <div className="truncate text-[11px] text-shell-mute">
                          {leading.theme.tagline}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <p className="mt-4 text-xs leading-relaxed text-shell-mute">
                  Answer the first question and the front-runner appears here, live.
                </p>
              )}
            </div>
          </aside>
        </div>
      ) : (
        <Results
          recs={recs}
          maxPossible={maxPossible}
          boardLinkFor={boardLinkFor}
          onPreview={(id) => navigate(`/gallery?theme=${id}`)}
          onRetake={retake}
          reduce={Boolean(reduce)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step scaffolding
// ---------------------------------------------------------------------------

function Question({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="max-w-xl font-display text-2xl font-semibold leading-snug text-shell-ink sm:text-3xl">
        {title}
      </legend>
      {hint && <p className="mt-2 max-w-md text-xs leading-relaxed text-shell-mute">{hint}</p>}
      <div className="mt-6">{children}</div>
    </fieldset>
  );
}

// Choreographed entrance: children cascade in with the expo signature.
function Stagger({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={
        reduce
          ? { hidden: {}, show: {} }
          : {
              hidden: { opacity: 0, y: 14 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_EXPO } },
            }
      }
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Q2 — vibe chips, each dressed in its own library face
// ---------------------------------------------------------------------------

function VibeChip({ mood, active, onClick }: { mood: Mood; active: boolean; onClick: () => void }) {
  const style = VIBE_STYLES[mood];
  const family = fontPairingById(style.fontId)?.heading.family;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex items-center gap-2 rounded-full border px-4 py-2.5 text-[15px] transition-all duration-300 ease-premium motion-safe:hover:-translate-y-0.5 ${
        active
          ? 'border-transparent text-shell-ink shadow-sm'
          : 'border-shell-line bg-shell-panel text-shell-ink/80 hover:text-shell-ink'
      }`}
      style={{
        fontFamily: family ? `"${family}", var(--font-heading), sans-serif` : undefined,
        backgroundColor: active ? `${style.hue}26` : undefined,
        boxShadow: active ? `inset 0 0 0 1.5px ${style.hue}` : undefined,
        ...style.extra,
      }}
    >
      <span
        aria-hidden="true"
        className="h-2 w-2 shrink-0 rounded-full transition-transform group-hover:scale-125"
        style={{ backgroundColor: style.hue }}
      />
      {mood}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Q3 — light vs dark answered with real palette-token mock pages
// ---------------------------------------------------------------------------

function MockPage({ palette }: { palette: Palette }) {
  return (
    <div
      style={colorVars(palette) as CSSProperties}
      data-dark={palette.isDark ? 'true' : 'false'}
      className="h-full bg-bg p-3"
    >
      <div className="flex items-center justify-between">
        <span className="h-1.5 w-8 rounded-full bg-primary" />
        <span className="flex gap-1">
          <i className="h-1 w-3 rounded-full bg-ink/30" />
          <i className="h-1 w-3 rounded-full bg-ink/30" />
          <i className="h-1 w-3 rounded-full bg-ink/30" />
        </span>
      </div>
      <div className="mt-3 h-2.5 w-4/5 rounded-sm bg-ink/85" />
      <div className="mt-1.5 h-2.5 w-3/5 rounded-sm bg-ink/85" />
      <div className="mt-2 h-1.5 w-2/5 rounded-full bg-muted/70" />
      <span className="mt-3 inline-block rounded-full bg-accent px-3 py-1 text-[8px] font-bold text-onAccent">
        &nbsp;&nbsp;&nbsp;
      </span>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <div className="h-7 rounded-md bg-surface ring-1 ring-inset ring-ink/10" />
        <div className="h-7 rounded-md bg-surface ring-1 ring-inset ring-ink/10" />
      </div>
    </div>
  );
}

function SchemeCard({
  option,
  active,
  onPick,
}: {
  option: { id: SchemePreference; label: string; hint: string };
  active: boolean;
  onPick: () => void;
}) {
  const light = paletteById(LIGHT_MOCK_PALETTE)!;
  const dark = paletteById(DARK_MOCK_PALETTE)!;
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      className={`group w-full overflow-hidden rounded-2xl border text-left transition-all duration-300 ease-premium motion-safe:hover:-translate-y-1 ${
        active
          ? 'border-shell-glow shadow-[0_18px_50px_-30px_rgba(201,184,255,0.45)]'
          : 'border-shell-line hover:border-shell-glow/50'
      }`}
    >
      <div aria-hidden="true" className="h-32 overflow-hidden border-b border-shell-line">
        {option.id === 'light' && <MockPage palette={light} />}
        {option.id === 'dark' && <MockPage palette={dark} />}
        {option.id === 'either' && (
          <div className="grid h-full grid-cols-2">
            <MockPage palette={light} />
            <MockPage palette={dark} />
          </div>
        )}
      </div>
      <div className="bg-shell-panel p-3.5">
        <div className="text-sm font-semibold text-shell-ink">{option.label}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-shell-mute">{option.hint}</div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Q4 — motion options demonstrate themselves on a loop
// ---------------------------------------------------------------------------

// A tiny "site card" each demo animates — it must read as an object at rest,
// so faint glow rectangles are not enough: panel fill + hairline ring + content.
function DemoChip() {
  return (
    <span className="flex h-11 w-24 flex-col justify-center gap-1.5 rounded-lg bg-shell-panel px-3 ring-1 ring-shell-line">
      <i className="block h-1.5 w-12 rounded-full bg-shell-glow" />
      <i className="block h-1 w-8 rounded-full bg-shell-mute/60" />
    </span>
  );
}

function EnergyDemo({ kind, reduce }: { kind: AnimationIntensity; reduce: boolean }) {
  if (kind === 'subtle') {
    return (
      <motion.div
        aria-hidden="true"
        animate={reduce ? undefined : { opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <DemoChip />
      </motion.div>
    );
  }
  if (kind === 'standard') {
    return (
      <motion.div
        aria-hidden="true"
        className="rounded-lg shadow-lg shadow-shell-glow/25"
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <DemoChip />
      </motion.div>
    );
  }
  return (
    <div aria-hidden="true" className="flex items-end gap-3">
      <motion.span
        className="block h-4 w-4 rounded-full bg-shell-glow"
        animate={reduce ? undefined : { y: [0, -20, 0], scaleY: [1, 1.05, 0.85] }}
        transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        animate={reduce ? undefined : { rotate: [-3, 3, -3], y: [0, -3, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <DemoChip />
      </motion.div>
    </div>
  );
}

function EnergyCard({
  option,
  active,
  onPick,
}: {
  option: { id: AnimationIntensity; label: string; hint: string };
  active: boolean;
  onPick: () => void;
}) {
  const reduce = Boolean(useReducedMotion());
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      className={`group w-full overflow-hidden rounded-2xl border text-left transition-all duration-300 ease-premium motion-safe:hover:-translate-y-1 ${
        active
          ? 'border-shell-glow shadow-[0_18px_50px_-30px_rgba(201,184,255,0.45)]'
          : 'border-shell-line hover:border-shell-glow/50'
      }`}
    >
      <div className="grid h-28 place-items-center border-b border-shell-line bg-shell-base/50">
        <EnergyDemo kind={option.id} reduce={reduce} />
      </div>
      <div className="bg-shell-panel p-3.5">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-shell-ink">
          <Wand2 size={13} className="text-shell-glow" /> {option.label}
        </div>
        <div className="mt-0.5 text-xs leading-relaxed text-shell-mute">{option.hint}</div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Q5 — density shown as page anatomy, not described
// ---------------------------------------------------------------------------

function DensityMock({ kind }: { kind: DensityPreference }) {
  if (kind === 'minimal') {
    return (
      <div aria-hidden="true" className="flex h-full flex-col justify-center gap-3 p-5">
        <div className="h-2 w-2/3 rounded-full bg-shell-ink opacity-80" />
        <div className="h-1 w-1/3 rounded-full bg-shell-mute opacity-70" />
        <span className="mt-2 h-2 w-2 rounded-full bg-shell-glow" />
      </div>
    );
  }
  if (kind === 'expressive') {
    return (
      <div aria-hidden="true" className="relative h-full overflow-hidden p-4">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '10px 10px',
            color: 'var(--shell-glow)',
          }}
        />
        <div className="relative h-2 w-3/4 rounded-full bg-shell-ink opacity-80" />
        <div className="relative mt-2 flex gap-1.5">
          <span className="h-4 w-10 rounded-full bg-shell-glow opacity-60" />
          <span className="h-4 w-10 rounded-full bg-amber-400 opacity-60" />
          <span className="h-4 w-10 rounded-full bg-rose-400 opacity-60" />
        </div>
        <div className="relative mt-2.5 grid grid-cols-3 gap-1.5">
          <span className="h-8 rounded-md bg-shell-glow opacity-40" />
          <span className="h-8 rounded-md bg-shell-panel ring-1 ring-shell-line" />
          <span className="h-8 rotate-3 rounded-md bg-amber-400 opacity-40" />
        </div>
      </div>
    );
  }
  return (
    <div aria-hidden="true" className="flex h-full flex-col justify-center gap-2.5 p-5">
      <div className="h-2 w-3/4 rounded-full bg-shell-ink opacity-80" />
      <div className="h-1 w-1/2 rounded-full bg-shell-mute opacity-70" />
      <div className="mt-1 grid grid-cols-2 gap-1.5">
        <span className="h-7 rounded-md bg-shell-glow opacity-30" />
        <span className="h-7 rounded-md bg-shell-panel ring-1 ring-shell-line" />
      </div>
    </div>
  );
}

function DensityCard({
  option,
  active,
  onPick,
}: {
  option: { id: DensityPreference; label: string; hint: string };
  active: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      className={`group w-full overflow-hidden rounded-2xl border text-left transition-all duration-300 ease-premium motion-safe:hover:-translate-y-1 ${
        active
          ? 'border-shell-glow shadow-[0_18px_50px_-30px_rgba(201,184,255,0.45)]'
          : 'border-shell-line hover:border-shell-glow/50'
      }`}
    >
      <div className="h-28 border-b border-shell-line bg-shell-base/50">
        <DensityMock kind={option.id} />
      </div>
      <div className="bg-shell-panel p-3.5">
        <div className="text-sm font-semibold text-shell-ink">{option.label}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-shell-mute">{option.hint}</div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Results — winner spotlight + runners-up, asymmetric on purpose
// ---------------------------------------------------------------------------

function LiveThemeMini({ theme, height }: { theme: Theme; height: string }) {
  const palette = paletteById(theme.paletteId);
  const fonts = fontPairingById(theme.fontPairingId);
  if (!palette || !fonts) return null;
  return (
    <ThemedScope palette={palette} fonts={fonts} className={`${height} overflow-hidden`}>
      <MiniSamplePage brand={theme.name} />
    </ThemedScope>
  );
}

function MatchMeter({ pct, reduce }: { pct: number; reduce: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-shell-line">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-shell-glow/60 to-shell-glow"
          initial={reduce ? { width: `${pct}%` } : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: EASE_EXPO, delay: 0.2 }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums text-shell-ink">{pct}%</span>
    </div>
  );
}

function Results({
  recs,
  maxPossible,
  boardLinkFor,
  onPreview,
  onRetake,
  reduce,
}: {
  recs: ReturnType<typeof recommendThemes>;
  maxPossible: number;
  boardLinkFor: (theme: Theme) => string;
  onPreview: (id: string) => void;
  onRetake: () => void;
  reduce: boolean;
}) {
  const pctFor = (score: number) =>
    Math.max(8, Math.min(100, Math.round((score / Math.max(1, maxPossible)) * 100)));
  const [winner, ...runners] = recs;
  if (!winner) return null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE_EXPO }}
      className="mt-8"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        {/* the winner gets the wall */}
        <article className="overflow-hidden rounded-3xl border border-shell-glow/50 bg-shell-panel shadow-[0_30px_90px_-50px_rgba(201,184,255,0.35)]">
          <div className="relative">
            <LiveThemeMini theme={winner.theme} height="h-72 sm:h-80" />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-shell-base/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-shell-glow shadow-lg backdrop-blur">
              <Crown size={13} /> Best match
            </span>
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl font-semibold text-shell-ink sm:text-3xl">
                {winner.theme.name}
              </h2>
              <span className="text-xs capitalize text-shell-mute">{winner.theme.tagline}</span>
            </div>
            {winner.theme.story && (
              <p className="mt-2 text-sm leading-relaxed text-shell-mute">{winner.theme.story}</p>
            )}
            <div className="mt-4">
              <MatchMeter pct={pctFor(winner.score)} reduce={reduce} />
            </div>
            {winner.reasons.length > 0 && (
              <p className="mt-3 text-xs leading-relaxed text-shell-mute">
                <Sparkles size={12} className="mr-1 inline text-shell-glow" aria-hidden="true" />
                Picked because it&rsquo;s {winner.reasons.join(' · ')}.
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to={boardLinkFor(winner.theme)} className={buttonClasses('accent', 'md')}>
                <Wand2 size={14} /> Start from this
              </Link>
              <Button tone="neutral" onClick={() => onPreview(winner.theme.id)}>
                Preview full page
              </Button>
            </div>
          </div>
        </article>

        {/* runners-up stack — close seconds, smaller on purpose */}
        <div className="space-y-4">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-shell-mute">
            Close seconds
          </span>
          {runners.map(({ theme, score, reasons }, i) => (
            <motion.article
              key={theme.id}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_EXPO, delay: 0.15 + i * 0.1 }}
              className="overflow-hidden rounded-2xl border border-shell-line bg-shell-panel transition-colors hover:border-shell-glow/40"
            >
              <LiveThemeMini theme={theme} height="h-28" />
              <div className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-base font-semibold text-shell-ink">
                    {theme.name}
                  </h3>
                  <span className="truncate text-[11px] text-shell-mute">{theme.tagline}</span>
                </div>
                <div className="mt-2.5">
                  <MatchMeter pct={pctFor(score)} reduce={reduce} />
                </div>
                {reasons.length > 0 && (
                  <p className="mt-2 text-[11px] leading-relaxed text-shell-mute">
                    Picked because it&rsquo;s {reasons.join(' · ')}.
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link to={boardLinkFor(theme)} className={buttonClasses('accent', 'sm')}>
                    <Wand2 size={12} /> Start from this
                  </Link>
                  <Button tone="neutral" size="sm" onClick={() => onPreview(theme.id)}>
                    Preview
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-2">
        <Button tone="neutral" onClick={onRetake}>
          <RotateCcw size={14} /> Retake the quiz
        </Button>
        <Link to="/gallery" className={buttonClasses('neutral', 'md')}>
          Browse the full library
        </Link>
      </div>
    </motion.div>
  );
}
