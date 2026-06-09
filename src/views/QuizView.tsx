import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, m as motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Compass, RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import type { AnimationIntensity, Industry, Mood } from '../types';
import { INDUSTRIES, MOODS } from '../data/taxonomy';
import type { DensityPreference, QuizAnswers, SchemePreference } from '../lib/quiz';
import { recommendThemes } from '../lib/quiz';
import { configForTheme } from '../preview/previewConfig';
import { encodeBoard } from './shareBoard';
import ThemeCard from '../components/cards/ThemeCard';
import Button, { buttonClasses } from '../components/ui/Button';

// Friendly client-facing labels over the raw taxonomy slugs.
const INDUSTRY_LABELS: Record<Industry, string> = {
  healthcare: 'Healthcare & therapy',
  wellness: 'Wellness',
  education: 'Education & kids',
  professional: 'Professional services',
  saas: 'Tech & SaaS',
  creative: 'Creative & portfolio',
  ecommerce: 'Shop & e-commerce',
  nonprofit: 'Nonprofit',
  hospitality: 'Food & hospitality',
  fitness: 'Fitness & movement',
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

const TOTAL_STEPS = 5;

const DEFAULT_ANSWERS: QuizAnswers = {
  industry: null,
  vibes: [],
  scheme: 'either',
  energy: 'standard',
  density: 'between',
};

export default function QuizView() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(DEFAULT_ANSWERS);
  const done = step >= TOTAL_STEPS;

  const recs = useMemo(() => (done ? recommendThemes(answers) : []), [done, answers]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const retake = () => {
    setAnswers(DEFAULT_ANSWERS);
    setStep(0);
  };

  // Single-select questions advance on tap — fewer clicks, feels conversational.
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
  const boardLinkFor = (themeId: string): string => {
    const rec = recs.find((r) => r.theme.id === themeId);
    if (!rec) return '/';
    const theme = rec.theme;
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

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-8">
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
          : 'Answer like you would over coffee — we map it to the library and hand you two or three directions that fit.'}
      </p>

      {!done && (
        <div className="mt-6 flex items-center gap-2" aria-label={`Question ${step + 1} of ${TOTAL_STEPS}`}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-8 bg-shell-glow' : i < step ? 'w-4 bg-shell-glow/50' : 'w-4 bg-shell-line'
              }`}
            />
          ))}
          <span className="ml-2 text-xs text-shell-mute">
            {step + 1} / {TOTAL_STEPS}
          </span>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={done ? 'results' : step}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-8"
        >
          {step === 0 && (
            <Question title="What kind of practice or business is this for?">
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((i) => (
                  <ChoiceChip
                    key={i}
                    label={INDUSTRY_LABELS[i]}
                    active={answers.industry === i}
                    onClick={() => pickIndustry(i)}
                  />
                ))}
                <ChoiceChip
                  label="Something else"
                  active={answers.industry === null && step > 0}
                  onClick={() => pickIndustry(null)}
                />
              </div>
            </Question>
          )}

          {step === 1 && (
            <Question
              title="Pick up to three words for the vibe."
              hint="These map straight onto how the library is tagged."
            >
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <ChoiceChip
                    key={m}
                    label={m}
                    active={answers.vibes.includes(m)}
                    onClick={() => toggleVibe(m)}
                    capitalize
                  />
                ))}
              </div>
              <div className="mt-6">
                <Button tone="primary" onClick={next} disabled={answers.vibes.length === 0}>
                  Next <ArrowRight size={15} />
                </Button>
              </div>
            </Question>
          )}

          {step === 2 && (
            <Question title="Light or dark?">
              <OptionCards options={SCHEME_OPTIONS} value={answers.scheme} onPick={pickScheme} />
            </Question>
          )}

          {step === 3 && (
            <Question title="How much should it move?">
              <OptionCards options={ENERGY_OPTIONS} value={answers.energy} onPick={pickEnergy} />
            </Question>
          )}

          {step === 4 && (
            <Question title="Minimal or decorative?">
              <OptionCards options={DENSITY_OPTIONS} value={answers.density} onPick={pickDensity} />
            </Question>
          )}

          {done && (
            <div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {recs.map(({ theme, reasons }) => (
                  <div key={theme.id} className="flex flex-col gap-3">
                    <motion.div
                      variants={{ hidden: {}, show: {} }}
                      initial="hidden"
                      animate="show"
                    >
                      <ThemeCard
                        theme={theme}
                        active={false}
                        onSelect={(id) => navigate(`/gallery?theme=${id}`)}
                      />
                    </motion.div>
                    {reasons.length > 0 && (
                      <p className="px-1 text-xs leading-relaxed text-shell-mute">
                        <Sparkles size={12} className="mr-1 inline text-shell-glow" aria-hidden="true" />
                        Picked because it&rsquo;s {reasons.join(' · ')}.
                      </p>
                    )}
                    <Link
                      to={boardLinkFor(theme.id)}
                      className={`${buttonClasses('accent', 'sm')} justify-center`}
                    >
                      <Wand2 size={13} /> Start from this
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <Button tone="neutral" onClick={retake}>
                  <RotateCcw size={14} /> Retake the quiz
                </Button>
                <Link to="/gallery" className={buttonClasses('neutral', 'md')}>
                  Browse the full library
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {!done && step > 0 && (
        <button
          type="button"
          onClick={back}
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-shell-mute transition-colors hover:text-shell-ink"
        >
          <ArrowLeft size={14} /> Back
        </button>
      )}
    </div>
  );
}

function Question({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="font-display text-xl font-semibold text-shell-ink sm:text-2xl">
        {title}
      </legend>
      {hint && <p className="mt-1.5 text-xs text-shell-mute">{hint}</p>}
      <div className="mt-5">{children}</div>
    </fieldset>
  );
}

function ChoiceChip({
  label,
  active,
  onClick,
  capitalize = false,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  capitalize?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
        capitalize ? 'capitalize' : ''
      } ${
        active
          ? 'border-transparent bg-shell-glow text-shell-base shadow-sm shadow-shell-glow/30'
          : 'border-shell-line bg-shell-panel text-shell-mute hover:border-shell-glow/50 hover:text-shell-ink'
      }`}
    >
      {label}
    </button>
  );
}

function OptionCards<T extends string>({
  options,
  value,
  onPick,
}: {
  options: { id: T; label: string; hint: string }[];
  value: T;
  onPick: (id: T) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onPick(o.id)}
          aria-pressed={value === o.id}
          className={`rounded-2xl border p-4 text-left transition-all motion-safe:hover:-translate-y-0.5 ${
            value === o.id
              ? 'border-shell-glow bg-shell-glow/10'
              : 'border-shell-line bg-shell-panel hover:border-shell-glow/45'
          }`}
        >
          <div className="text-sm font-semibold text-shell-ink">{o.label}</div>
          <div className="mt-1 text-xs leading-relaxed text-shell-mute">{o.hint}</div>
        </button>
      ))}
    </div>
  );
}
