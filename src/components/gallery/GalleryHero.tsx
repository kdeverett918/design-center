import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, Shuffle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { themeById } from '../../data/themes';
import { paletteById } from '../../data/palettes';
import { fontPairingById } from '../../data/fonts';
import ThemedScope from '../../theme/ThemedScope';
import MiniSamplePage from '../preview/MiniSamplePage';

// Standout themes for the rotating live cluster — each carries its own colors.
const HERO_THEME_IDS = ['broadsheet', 'chromewave', 'joyride', 'maison'];

const HEADLINE = ["Design that doesn't", 'look like everyone else.'];

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
    <section className="relative overflow-hidden border-b border-shell-line pb-12 pt-4 sm:pb-16">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* copy */}
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-xl">
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-shell-ink sm:text-5xl xl:text-6xl">
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
            Browse a library of themes, palettes, and font pairings shown live and in motion — each
            in its own real colors. Find a look, then make it yours.
          </motion.p>
          <motion.div variants={lineIn} className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBrowse}
              className="inline-flex items-center gap-2 rounded-full border border-shell-glow/60 bg-shell-glow/10 px-5 py-2.5 text-sm font-semibold text-shell-ink transition-colors hover:bg-shell-glow/20"
            >
              Browse the library
              <ArrowDown size={15} className="text-shell-glow" />
            </button>
            <Link
              to="/moodboard"
              className="inline-flex items-center gap-2 rounded-full border border-shell-line bg-shell-panel px-5 py-2.5 text-sm font-semibold text-shell-mute transition-colors hover:text-shell-ink"
            >
              <Shuffle size={15} />
              Mix your own
            </Link>
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
