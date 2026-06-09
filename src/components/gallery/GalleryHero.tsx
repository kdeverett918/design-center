import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, Shuffle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { themeById } from '../../data/themes';
import { paletteById } from '../../data/palettes';
import { fontPairingById } from '../../data/fonts';
import ThemedScope from '../../theme/ThemedScope';
import MiniSamplePage from '../preview/MiniSamplePage';
import { buttonClasses } from '../ui/Button';

// Standout themes for the rotating live cluster — each carries its own colors.
const HERO_THEME_IDS = ['broadsheet', 'chromewave', 'joyride', 'maison'];

const HEADLINE = ['Customize your', 'unique design.'];

// Shared "premium" easing for magnetic CTA micro-interactions.
const PREMIUM_EASE = [0.25, 0.46, 0.45, 0.94] as const;

interface GalleryHeroProps {
  /** Scrolls to the gallery section (the "Browse the library" CTA). */
  onBrowse?: () => void;
}

export default function GalleryHero({ onBrowse }: GalleryHeroProps) {
  const reduce = useReducedMotion();
  const heroThemes = HERO_THEME_IDS.map((id) => themeById(id)).filter(
    (t): t is NonNullable<typeof t> => Boolean(t),
  );
  const [active, setActive] = useState(0);

  // Rotate the highlighted preview on an interval — gated on reduced motion.
  useEffect(() => {
    if (reduce || heroThemes.length < 2) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % heroThemes.length);
    }, 2600);
    return () => clearInterval(timer);
  }, [reduce, heroThemes.length]);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
  };
  const lineIn = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16, filter: 'blur(8px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section className="relative overflow-hidden border-b border-shell-line pb-14 pt-6 sm:pb-20 sm:pt-8">
      {/* Cinematic, low-key backdrop wash — pure atmosphere, never busy. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-[-10%] h-[460px] w-[460px] rounded-full bg-shell-glow/10 blur-[120px]"
      />

      <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* copy */}
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-xl">
          <motion.span
            variants={lineIn}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-shell-line bg-shell-panel/60 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-shell-mute"
          >
            <Sparkles size={12} className="text-shell-glow" aria-hidden="true" />
            Tech SLP Studio
          </motion.span>
          <h1 className="font-display text-4xl font-semibold leading-[1.04] tracking-tight text-shell-ink sm:text-5xl xl:text-[3.75rem]">
            {HEADLINE.map((line, i) => (
              <motion.span key={i} variants={lineIn} className="block">
                {line}
              </motion.span>
            ))}
          </h1>
          <motion.p
            variants={lineIn}
            className="mt-5 max-w-md text-base leading-relaxed text-shell-mute sm:text-lg"
          >
            Browse real themes, color palettes, and font pairings, each one playing live in its own
            colors. Pick the pieces you love, then customize them into a look that feels like yours.
          </motion.p>
          <motion.div variants={lineIn} className="mt-8 flex flex-wrap items-center gap-3">
            <motion.button
              type="button"
              onClick={onBrowse}
              whileHover={reduce ? undefined : { y: -1 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.25, ease: PREMIUM_EASE }}
              className={buttonClasses('primary', 'md')}
            >
              Browse the library
              <ArrowDown size={15} />
            </motion.button>
            <motion.div
              whileHover={reduce ? undefined : { y: -1 }}
              transition={{ duration: 0.25, ease: PREMIUM_EASE }}
            >
              <Link to="/" className={buttonClasses('accent', 'md')}>
                <Shuffle size={15} />
                Mix your own
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* live themed mini-preview cluster */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative grid grid-cols-2 gap-4 sm:gap-5"
          aria-hidden="true"
        >
          {heroThemes.map((theme, i) => {
            const palette = paletteById(theme.paletteId);
            const fonts = fontPairingById(theme.fontPairingId);
            if (!palette || !fonts) return null;
            const isActive = i === active;
            return (
              <motion.div
                key={theme.id}
                animate={
                  reduce
                    ? undefined
                    : { scale: isActive ? 1.04 : 0.97, opacity: isActive ? 1 : 0.78 }
                }
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className={`overflow-hidden rounded-2xl border transition-shadow ${
                  isActive
                    ? 'border-shell-glow/60 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.6)]'
                    : 'border-shell-line'
                }`}
              >
                <ThemedScope palette={palette} fonts={fonts} className="h-44 overflow-hidden sm:h-52">
                  <MiniSamplePage brand={theme.name} />
                </ThemedScope>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
