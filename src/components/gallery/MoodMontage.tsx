import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, m as motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { themeById } from '../../data/themes';

// Twelve visually distinct directions — same cast as the flywheel had.
const MONTAGE_THEME_IDS = [
  'quietsignal',
  'terracotta',
  'joyride',
  'maison',
  'chromewave',
  'broadsheet',
  'sunnyside',
  'velvet',
  'obsidian',
  'aurora',
  'limelight',
  'bluehour',
];

// =============================================================================
// The mood montage — the gallery's centerpiece. A featured designer image
// carries the active direction's mood (name, tagline, mood tags) while a
// contact sheet of the other directions waits below. The feature auto-advances,
// pauses while you hover, and clicking any frame pins that direction. Reduced
// motion freezes the auto-advance but keeps everything clickable.
// =============================================================================
export default function MoodMontage() {
  const reduce = useReducedMotion() ?? false;
  const themes = useMemo(
    () => MONTAGE_THEME_IDS.map(themeById).filter((t): t is NonNullable<typeof t> => Boolean(t)),
    [],
  );
  const [activeId, setActiveId] = useState(themes[0]?.id ?? '');
  // Once a visitor picks a frame the montage stops changing its mind for them.
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (reduce || pinned || hovered || themes.length < 2) return;
    const timer = setInterval(() => {
      setActiveId((cur) => {
        const i = themes.findIndex((t) => t.id === cur);
        return themes[(i + 1) % themes.length]!.id;
      });
    }, 3400);
    return () => clearInterval(timer);
  }, [reduce, pinned, hovered, themes]);

  const active = themes.find((t) => t.id === activeId) ?? themes[0];
  if (!active) return null;

  return (
    <div
      className="mx-auto w-full max-w-[520px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* featured frame: the active direction's designer image, mood-first */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-shell-line shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={active.id}
            src={active.heroImage}
            alt={`${active.name} — ${active.tagline}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>

        {/* legibility wash + the mood story */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {active.moods.map((mood) => (
              <span
                key={mood}
                className="rounded-full border border-white/25 bg-black/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm"
              >
                {mood}
              </span>
            ))}
          </div>
          <p className="font-display text-2xl font-semibold italic leading-tight text-white">
            {active.name}
          </p>
          <p className="mt-1 text-sm text-white/75">{active.tagline}</p>
        </div>
      </div>

      {/* contact sheet: every direction as a small mood frame */}
      <div className="mt-3 grid grid-cols-6 gap-2" role="group" aria-label="Design directions">
        {themes.map((t) => {
          const isActive = t.id === activeId;
          return (
            <button
              key={t.id}
              type="button"
              aria-label={`Feature the ${t.name} mood`}
              aria-pressed={isActive}
              title={t.name}
              onClick={() => {
                setActiveId(t.id);
                setPinned(true);
              }}
              className={`group/frame relative aspect-square overflow-hidden rounded-lg ring-offset-2 ring-offset-shell-base transition-all duration-300 ${
                isActive
                  ? 'ring-2 ring-shell-glow shadow-[0_0_20px_-6px_var(--shell-glow)]'
                  : 'opacity-75 ring-1 ring-shell-line hover:opacity-100 hover:ring-shell-glow/60'
              }`}
            >
              <img
                src={t.heroImage}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover/frame:scale-110"
              />
            </button>
          );
        })}
      </div>

      {/* caption: what's featured right now + a way in */}
      <div className="mt-4 flex items-center justify-center gap-3" aria-live="polite">
        <span className="font-display text-sm font-semibold italic text-shell-ink">{active.name}</span>
        <span aria-hidden="true" className="h-3 w-px bg-shell-line" />
        <Link
          to={`/gallery?theme=${active.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-shell-glow transition-colors hover:text-shell-ink"
        >
          Open this look <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}
