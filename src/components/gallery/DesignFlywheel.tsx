import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, m as motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { themeById } from '../../data/themes';
import { paletteById } from '../../data/palettes';
import { fontPairingById } from '../../data/fonts';
import ThemedScope from '../../theme/ThemedScope';
import MiniSamplePage from '../preview/MiniSamplePage';

// Twelve visually distinct directions spread around the wheel.
const WHEEL_THEME_IDS = [
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
// The design flywheel — the gallery's centerpiece. Twelve theme swatches orbit
// a live, fully-themed hub preview; the ring drifts continuously (one shared
// 80s duration with a reverse counter-spin keeps every swatch upright), pauses
// while you hover, and any swatch pins its theme into the hub. Reduced motion
// freezes the orbit and the auto-advance but keeps everything clickable.
// =============================================================================
export default function DesignFlywheel() {
  const reduce = useReducedMotion() ?? false;
  const themes = useMemo(
    () => WHEEL_THEME_IDS.map(themeById).filter((t): t is NonNullable<typeof t> => Boolean(t)),
    [],
  );
  const [activeId, setActiveId] = useState(themes[0]?.id ?? '');
  // Once a visitor picks a swatch the wheel stops changing its mind for them.
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (reduce || pinned || themes.length < 2) return;
    const timer = setInterval(() => {
      setActiveId((cur) => {
        const i = themes.findIndex((t) => t.id === cur);
        return themes[(i + 1) % themes.length]!.id;
      });
    }, 3400);
    return () => clearInterval(timer);
  }, [reduce, pinned, themes]);

  const active = themes.find((t) => t.id === activeId) ?? themes[0];
  if (!active) return null;
  const activePalette = paletteById(active.paletteId);
  const activeFonts = fontPairingById(active.fontPairingId);
  if (!activePalette || !activeFonts) return null;

  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div className="group relative aspect-square w-full">
        {/* orbit hairlines */}
        <div aria-hidden="true" className="absolute inset-[6%] rounded-full border border-shell-line/70" />
        <div aria-hidden="true" className="absolute inset-[23%] rounded-full border border-shell-line/40" />

        {/* the ring of swatches — spins; hover anywhere on the wheel to pause */}
        <div className="absolute inset-[6%] motion-safe:animate-wheel group-hover:[animation-play-state:paused]">
          {themes.map((t, i) => {
            const angle = ((360 / themes.length) * i - 90) * (Math.PI / 180);
            const left = 50 + 50 * Math.cos(angle);
            const top = 50 + 50 * Math.sin(angle);
            const p = paletteById(t.paletteId);
            if (!p) return null;
            const { primary, secondary, accent, background } = p.colors;
            const isActive = t.id === activeId;
            return (
              <span
                key={t.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                {/* counter-spin so the swatch (and its focus ring) stays upright */}
                <span className="block motion-safe:animate-wheel-reverse group-hover:[animation-play-state:paused]">
                  <button
                    type="button"
                    aria-label={`Spin the wheel to ${t.name}`}
                    aria-pressed={isActive}
                    title={t.name}
                    onClick={() => {
                      setActiveId(t.id);
                      setPinned(true);
                    }}
                    className={`block h-10 w-10 rounded-full ring-offset-2 ring-offset-shell-base transition-all duration-300 sm:h-12 sm:w-12 ${
                      isActive
                        ? 'scale-110 ring-2 ring-shell-glow shadow-[0_0_24px_-4px_var(--shell-glow)]'
                        : 'ring-1 ring-shell-line hover:scale-110 hover:ring-shell-glow/60'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${background} 0 25%, ${primary} 25% 55%, ${secondary} 55% 78%, ${accent} 78% 100%)`,
                    }}
                  />
                </span>
              </span>
            );
          })}
        </div>

        {/* hub: the active theme rendered live, clipped into a porthole */}
        <div className="absolute inset-[26%] overflow-hidden rounded-full border border-shell-line shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full"
              aria-hidden="true"
            >
              <ThemedScope palette={activePalette} fonts={activeFonts} className="h-full overflow-hidden">
                <div className="origin-top scale-[0.55] sm:scale-[0.62] [width:182%] sm:[width:162%] [margin-left:-41%] sm:[margin-left:-31%]">
                  <MiniSamplePage brand={active.name} />
                </div>
              </ThemedScope>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* caption: what's in the hub right now + a way in */}
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
