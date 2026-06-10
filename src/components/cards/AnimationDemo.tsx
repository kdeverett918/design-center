import { useEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import {
  AnimatePresence,
  animate,
  m as motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type Transition,
} from 'framer-motion';
import type { AnimationPreset } from '../../types';

// Maps a preset's easing string to a framer-motion easing.
function ease(easing: string): Transition['ease'] {
  switch (easing) {
    case 'easeOut':
      return 'easeOut';
    case 'easeInOut':
    case 'ease-in-out':
    case 'ease':
      return 'easeInOut';
    case 'linear':
      return 'linear';
    default:
      return 'easeOut';
  }
}

// Each demo plays the real effect on a loop so clients SEE the motion, using the
// preset's own duration + easing (never one-size-fits-all timing).
export default function AnimationDemo({ preset }: { preset: AnimationPreset }) {
  const reduced = useReducedMotion();
  const d = Math.max(preset.durationMs, 150) / 1000;

  // Honor reduced-motion: show a static representative frame instead of looping.
  if (reduced) {
    return (
      <Stage>
        <span className="rounded-xl bg-shell-glow px-4 py-2 text-xs font-semibold text-shell-base">
          {preset.name}
        </span>
      </Stage>
    );
  }
  const loop = (repeatDelay = 0.7): Transition => ({
    duration: d,
    ease: ease(preset.easing),
    repeat: Infinity,
    repeatDelay,
  });

  const Tile = (
    <span className="grid h-12 w-20 place-items-center rounded-xl bg-gradient-to-br from-shell-glow to-[#7c9eff] text-[10px] font-semibold text-shell-base">
      Aa
    </span>
  );

  switch (preset.id) {
    case 'fade-up':
      return (
        <Stage>
          <motion.span
            className="rounded-xl bg-shell-glow px-4 py-2 text-xs font-semibold text-shell-base"
            animate={{ opacity: [0, 1, 1], y: [16, 0, 0] }}
            transition={loop()}
          >
            Fade Up
          </motion.span>
        </Stage>
      );

    case 'stagger-reveal':
      return (
        <Stage>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="h-8 w-3 rounded-full bg-shell-glow"
                animate={{ opacity: [0, 1, 1], y: [10, 0, 0] }}
                transition={{ ...loop(1), delay: i * 0.12 }}
              />
            ))}
          </div>
        </Stage>
      );

    case 'blur-in':
      return (
        <Stage>
          <motion.span
            className="rounded-xl bg-shell-glow px-4 py-2 text-xs font-semibold text-shell-base"
            animate={{ opacity: [0, 1, 1], filter: ['blur(8px)', 'blur(0px)', 'blur(0px)'] }}
            transition={loop()}
          >
            Blur In
          </motion.span>
        </Stage>
      );

    case 'scroll-reveal':
      return (
        <Stage>
          <div className="relative h-16 w-28 overflow-hidden rounded-lg border border-shell-line">
            <motion.span
              className="absolute inset-x-2 bottom-2 rounded-md bg-shell-glow py-2 text-center text-[10px] font-semibold text-shell-base"
              animate={{ y: [40, 0, 0], opacity: [0, 1, 1] }}
              transition={loop(0.9)}
            >
              In view
            </motion.span>
          </div>
        </Stage>
      );

    case 'count-up':
      return (
        <Stage>
          <CountUp duration={d} />
        </Stage>
      );

    case 'parallax-layer':
      return (
        <Stage>
          <div className="relative h-16 w-28 overflow-hidden rounded-lg border border-shell-line">
            <motion.span
              className="absolute left-3 top-3 h-6 w-6 rounded-full bg-[#7c9eff]"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
            />
            <motion.span
              className="absolute right-3 bottom-3 h-9 w-9 rounded-lg bg-shell-glow"
              animate={{ y: [0, -18, 0] }}
              transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
            />
          </div>
        </Stage>
      );

    case 'hover-lift':
      return (
        <Stage>
          <motion.span
            className="rounded-xl bg-shell-panel px-4 py-2 text-xs font-semibold text-shell-ink ring-1 ring-shell-line"
            animate={{ y: [0, -4, 0], boxShadow: ['0 2px 8px rgba(0,0,0,0.2)', '0 14px 24px rgba(0,0,0,0.45)', '0 2px 8px rgba(0,0,0,0.2)'] }}
            transition={loop(0.4)}
          >
            Hover Lift
          </motion.span>
        </Stage>
      );

    case 'magnetic-button':
      return (
        <Stage>
          <motion.span
            className="rounded-full bg-shell-glow px-4 py-2 text-xs font-semibold text-shell-base"
            animate={{ x: [0, 6, -4, 0], y: [0, -4, 3, 0] }}
            transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
          >
            Magnetic
          </motion.span>
        </Stage>
      );

    case 'underline-grow':
      return (
        <Stage>
          <span className="relative text-sm font-semibold text-shell-ink">
            Read more
            <motion.span
              className="absolute -bottom-1 left-0 h-0.5 w-full origin-left bg-shell-glow"
              animate={{ scaleX: [0, 1, 1] }}
              transition={loop(0.6)}
            />
          </span>
        </Stage>
      );

    case 'image-zoom':
      return (
        <Stage>
          <div className="h-16 w-24 overflow-hidden rounded-lg border border-shell-line">
            <motion.div
              className="h-full w-full bg-gradient-to-br from-shell-glow via-[#7c9eff] to-[#a78bfa]"
              animate={{ scale: [1, 1.12, 1] }}
              transition={loop(0.3)}
            />
          </div>
        </Stage>
      );

    case 'gradient-drift':
      return (
        <Stage>
          <motion.div
            className="h-16 w-28 rounded-lg"
            style={{
              backgroundImage:
                'linear-gradient(120deg, #7c9eff, #a78bfa, #ffd166, #7c9eff)',
              backgroundSize: '300% 300%',
            }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: d, ease: 'easeInOut', repeat: Infinity }}
          />
        </Stage>
      );

    case 'gentle-float':
      return (
        <Stage>
          <motion.span
            className="grid h-12 w-12 place-items-center rounded-2xl bg-shell-glow text-shell-base"
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: d, ease: 'easeInOut', repeat: Infinity }}
          >
            ●
          </motion.span>
        </Stage>
      );

    case 'cta-pulse':
      return (
        <Stage>
          <motion.span
            className="rounded-xl bg-shell-glow px-4 py-2 text-xs font-semibold text-shell-base"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(201,184,255,0.5)',
                '0 0 0 10px rgba(201,184,255,0)',
                '0 0 0 0 rgba(201,184,255,0)',
              ],
            }}
            transition={{ duration: d, ease: 'easeInOut', repeat: Infinity }}
          >
            Get started
          </motion.span>
        </Stage>
      );

    case 'page-fade':
      return (
        <Stage>
          <div className="relative h-16 w-28">
            <motion.div
              className="absolute inset-0 grid place-items-center rounded-lg bg-shell-panel text-[10px] text-shell-mute ring-1 ring-shell-line"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
            >
              Page A
            </motion.div>
            <motion.div
              className="absolute inset-0 grid place-items-center rounded-lg bg-shell-glow text-[10px] font-semibold text-shell-base"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
            >
              Page B
            </motion.div>
          </div>
        </Stage>
      );

    case 'view-transition':
      return (
        <Stage>
          <motion.div
            className="bg-shell-glow"
            animate={{ borderRadius: ['12px', '50%', '12px'], rotate: [0, 90, 0], width: [48, 56, 48], height: [48, 56, 48] }}
            transition={{ duration: 2.6, ease: 'easeInOut', repeat: Infinity }}
          />
        </Stage>
      );

    case 'text-shimmer':
      return (
        <Stage>
          <motion.span
            className="bg-clip-text text-xl font-semibold text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(100deg, #7c9eff 20%, #ffd166 45%, #ffffff 50%, #ffd166 55%, #a78bfa 80%)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['100% 0%', '-100% 0%'] }}
            transition={{ duration: d, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.4 }}
          >
            Shimmer
          </motion.span>
        </Stage>
      );

    case 'tilt-3d':
      return (
        <Stage>
          <div style={{ perspective: 400 }}>
            <motion.div
              className="grid h-16 w-24 place-items-center rounded-xl bg-gradient-to-br from-shell-glow to-[#7c9eff] text-xs font-semibold text-shell-base"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: [-18, 18, -18], rotateX: [10, -10, 10] }}
              transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
            >
              Tilt 3D
            </motion.div>
          </div>
        </Stage>
      );

    case 'reveal-mask':
      return (
        <Stage>
          <motion.div
            className="grid h-14 w-28 place-items-center rounded-lg bg-gradient-to-br from-shell-glow to-[#a78bfa] text-xs font-semibold text-shell-base"
            animate={{ clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)', 'inset(0 0% 0 0)'] }}
            transition={loop(0.7)}
          >
            Revealed
          </motion.div>
        </Stage>
      );

    case 'marquee':
      return (
        <Stage>
          <div className="relative w-28 overflow-hidden rounded-lg border border-shell-line py-2">
            <motion.div
              className="flex w-max gap-3 whitespace-nowrap text-[10px] font-semibold text-shell-mute"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: d, ease: 'linear', repeat: Infinity }}
            >
              {[0, 1].map((rep) => (
                <span key={rep} className="flex gap-3" aria-hidden={rep === 1}>
                  <span className="text-[#7c9eff]">Design</span>
                  <span>•</span>
                  <span className="text-[#a78bfa]">Build</span>
                  <span>•</span>
                  <span className="text-[#ffd166]">Ship</span>
                  <span>•</span>
                </span>
              ))}
            </motion.div>
          </div>
        </Stage>
      );

    case 'ripple':
      return (
        <Stage>
          <div className="relative grid h-14 w-14 place-items-center">
            <span className="h-3 w-3 rounded-full bg-shell-glow" />
            {[0, 1].map((i) => (
              <motion.span
                key={i}
                className="absolute inset-0 rounded-full border-2 border-[#7c9eff]"
                animate={{ scale: [0, 1], opacity: [0.6, 0] }}
                transition={{ duration: d, ease: 'easeOut', repeat: Infinity, delay: i * (d / 2) }}
              />
            ))}
          </div>
        </Stage>
      );

    case 'typewriter':
      return (
        <Stage>
          <Typewriter duration={d} />
        </Stage>
      );

    case 'marquee-ticker':
      return (
        <Stage>
          <div className="relative w-32 overflow-hidden">
            <motion.div
              className="flex w-max gap-3 whitespace-nowrap text-sm font-bold uppercase tracking-tight"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: d, ease: 'linear', repeat: Infinity }}
            >
              {[0, 1].map((rep) => (
                <span key={rep} className="flex gap-3" aria-hidden={rep === 1}>
                  <span className="text-shell-glow">DESIGN</span>
                  <span className="text-shell-mute">★</span>
                  <span className="text-[#7c9eff]">BUILD</span>
                  <span className="text-shell-mute">★</span>
                  <span className="text-[#ffd166]">SHIP</span>
                  <span className="text-shell-mute">★</span>
                </span>
              ))}
            </motion.div>
          </div>
        </Stage>
      );

    case 'kinetic-type':
      return (
        <Stage>
          <div className="flex flex-col items-center gap-0.5">
            {['Move', 'with', 'force'].map((w, i) => (
              <motion.span
                key={w}
                className="text-lg font-bold leading-none text-shell-ink"
                animate={{ y: [18, 0, 0], opacity: [0, 1, 1] }}
                transition={{
                  duration: d,
                  ease: [0.16, 1, 0.3, 1],
                  repeat: Infinity,
                  repeatDelay: 0.9,
                  delay: i * 0.14,
                }}
              >
                {w}
              </motion.span>
            ))}
          </div>
        </Stage>
      );

    case 'text-scramble':
      return (
        <Stage>
          <Scramble duration={d} />
        </Stage>
      );

    case 'glitch-shift':
      return (
        <Stage>
          <div className="relative text-2xl font-bold uppercase tracking-tight text-shell-ink">
            <span>Glitch</span>
            <motion.span
              aria-hidden
              className="absolute inset-0 text-[#ff3b6b] mix-blend-screen"
              animate={{ x: [0, -2.5, 2, 0, 0], opacity: [0, 0.85, 0.85, 0, 0] }}
              transition={{ duration: 2, ease: 'linear', repeat: Infinity, times: [0, 0.05, 0.12, 0.2, 1] }}
            >
              Glitch
            </motion.span>
            <motion.span
              aria-hidden
              className="absolute inset-0 text-[#23d5ff] mix-blend-screen"
              animate={{ x: [0, 2.5, -2, 0, 0], opacity: [0, 0.85, 0.85, 0, 0] }}
              transition={{ duration: 2, ease: 'linear', repeat: Infinity, times: [0, 0.05, 0.12, 0.2, 1] }}
            >
              Glitch
            </motion.span>
          </div>
        </Stage>
      );

    case 'chrome-shine':
      return (
        <Stage>
          <div className="relative h-14 w-28 overflow-hidden rounded-xl bg-gradient-to-br from-[#9aa3b2] via-[#eef2f8] to-[#6b7384]">
            <motion.div
              className="absolute inset-y-0 w-1/3 -skew-x-12 bg-white/70 blur-md"
              animate={{ x: [-50, 130] }}
              transition={{ duration: d, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.6 }}
            />
          </div>
        </Stage>
      );

    case 'sticker-spin':
      return (
        <Stage>
          <motion.span
            className="grid h-16 w-16 place-items-center rounded-full bg-shell-glow text-[10px] font-bold uppercase tracking-wide text-shell-base ring-2 ring-shell-base"
            animate={{ rotate: [0, 360], scale: [1, 1.16, 1] }}
            transition={{ duration: d, ease: [0.34, 1.56, 0.64, 1], repeat: Infinity, repeatDelay: 0.7 }}
          >
            New
          </motion.span>
        </Stage>
      );

    case 'poster-reveal':
      return (
        <Stage>
          <div className="overflow-hidden px-1 py-1">
            <motion.div
              className="text-3xl font-bold uppercase leading-none tracking-tight text-shell-ink"
              animate={{ y: ['100%', '0%', '0%'] }}
              transition={{ duration: d, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatDelay: 0.9 }}
            >
              Poster
            </motion.div>
          </div>
        </Stage>
      );

    case 'gradient-trace':
      return (
        <Stage>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-xs font-semibold text-shell-ink">Headline</span>
            <svg viewBox="0 0 120 14" fill="none" className="h-3.5 w-24">
              <defs>
                <linearGradient id="demo-trace" x1="0" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#f97362" />
                  <stop offset="0.55" stopColor="#a78bfa" />
                  <stop offset="1" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              <motion.path
                d="M3 9 C 24 2, 48 12, 66 7 S 102 4, 117 7"
                stroke="url(#demo-trace)"
                strokeWidth="3.5"
                strokeLinecap="round"
                animate={{ pathLength: [0, 1, 1] }}
                transition={loop(0.9)}
              />
            </svg>
          </div>
        </Stage>
      );

    // Camera demos run compressed (real presets take 14–18s on the page).
    case 'camera-push':
      return (
        <Stage>
          <CameraFrame>
            <motion.span
              className="absolute inset-0 bg-gradient-to-br from-shell-glow via-[#7c9eff] to-[#2dd4bf]"
              animate={{ scale: [1.02, 1.16] }}
              transition={{ duration: 2.6, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
            />
          </CameraFrame>
        </Stage>
      );

    case 'camera-pan':
      return (
        <Stage>
          <CameraFrame>
            <motion.span
              className="absolute inset-y-0 -left-6 w-[150%] bg-gradient-to-r from-shell-glow via-[#7c9eff] to-[#2dd4bf]"
              animate={{ x: [-10, 10] }}
              transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
            />
          </CameraFrame>
        </Stage>
      );

    case 'camera-zoom':
      return (
        <Stage>
          <CameraFrame>
            <motion.span
              className="absolute inset-0 bg-gradient-to-br from-shell-glow via-[#7c9eff] to-[#2dd4bf]"
              animate={{ scale: [1.02, 1.2, 1.12, 1.14, 1.02] }}
              transition={{
                duration: 4,
                times: [0, 0.45, 0.62, 0.78, 1],
                ease: 'easeInOut',
                repeat: Infinity,
              }}
            />
          </CameraFrame>
        </Stage>
      );

    case 'cursor-dot':
      return <CursorDotDemo />;
    case 'cursor-follow':
      return <CursorFollowDemo />;
    case 'cursor-spotlight':
      return <CursorSpotlightDemo />;
    case 'cursor-trail':
      return <CursorTrailDemo />;
    case 'cursor-tilt':
      return <CursorTiltDemo />;
    case 'cursor-ripple':
      return <CursorRippleDemo />;
    case 'cursor-magnet':
      return <CursorMagnetDemo />;

    default:
      return <Stage>{Tile}</Stage>;
  }
}

// A little "viewfinder" for the camera demos: clipped frame + corner marks so
// the motion reads as a rig move on footage, not a sliding box.
function CameraFrame({ children }: { children: ReactNode }) {
  return (
    <span className="relative block h-16 w-28 overflow-hidden rounded-lg border border-shell-line">
      {children}
      <span className="absolute left-1.5 top-1.5 h-2 w-2 border-l-2 border-t-2 border-white/70" />
      <span className="absolute right-1.5 top-1.5 h-2 w-2 border-r-2 border-t-2 border-white/70" />
      <span className="absolute bottom-1.5 left-1.5 h-2 w-2 border-b-2 border-l-2 border-white/70" />
      <span className="absolute bottom-1.5 right-1.5 h-2 w-2 border-b-2 border-r-2 border-white/70" />
    </span>
  );
}

// ===========================================================================
// Cursor demos — interactive: they follow the real pointer inside the card and
// idle-orbit when not hovered (so they look alive in the grid). All gated by the
// reduced-motion early-return above.
// ===========================================================================

function useCursorField(spring?: { stiffness: number; damping: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, spring ?? { stiffness: 320, damping: 22 });
  const sy = useSpring(y, spring ?? { stiffness: 320, damping: 22 });
  const [active, setActive] = useState(false);

  // Idle orbit when the pointer isn't inside the card.
  useEffect(() => {
    if (active) return;
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.018;
      x.set(Math.cos(t) * 42);
      y.set(Math.sin(t * 1.4) * 22);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, x, y]);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  };

  return { ref, x, y, sx, sy, active, setActive, onMove };
}

function CursorStage({
  fieldRef,
  onMove,
  onEnter,
  onLeave,
  children,
}: {
  fieldRef: React.RefObject<HTMLDivElement | null>;
  onMove?: (e: MouseEvent) => void;
  onEnter?: () => void;
  onLeave?: () => void;
  children: ReactNode;
}) {
  return (
    <div
      ref={fieldRef}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="relative grid h-28 cursor-none place-items-center overflow-hidden rounded-2xl border border-shell-line bg-shell-base"
    >
      {children}
      <span className="pointer-events-none absolute bottom-1.5 right-2 text-[8px] uppercase tracking-wide text-shell-mute/70">
        move me
      </span>
    </div>
  );
}

function CursorDotDemo() {
  const f = useCursorField({ stiffness: 500, damping: 30 });
  return (
    <CursorStage fieldRef={f.ref} onMove={f.onMove} onEnter={() => f.setActive(true)} onLeave={() => f.setActive(false)}>
      <span className="text-[10px] font-medium text-shell-mute">hover the card</span>
      <motion.span
        className="pointer-events-none absolute left-1/2 top-1/2 -ml-5 -mt-5 h-10 w-10 rounded-full border border-shell-glow"
        style={{ x: f.sx, y: f.sy }}
      />
      <motion.span
        className="pointer-events-none absolute left-1/2 top-1/2 -ml-1 -mt-1 h-2 w-2 rounded-full bg-shell-glow"
        style={{ x: f.x, y: f.y }}
      />
    </CursorStage>
  );
}

function CursorFollowDemo() {
  const f = useCursorField({ stiffness: 120, damping: 16 });
  return (
    <CursorStage fieldRef={f.ref} onMove={f.onMove} onEnter={() => f.setActive(true)} onLeave={() => f.setActive(false)}>
      <span className="text-[10px] font-medium text-shell-mute">lead the way</span>
      <motion.span
        className="pointer-events-none absolute left-1/2 top-1/2 -ml-7 -mt-3.5 rounded-full bg-shell-glow px-3 py-1.5 text-[10px] font-semibold text-shell-base"
        style={{ x: f.sx, y: f.sy }}
      >
        follow
      </motion.span>
    </CursorStage>
  );
}

function CursorSpotlightDemo() {
  const f = useCursorField({ stiffness: 350, damping: 26 });
  return (
    <CursorStage fieldRef={f.ref} onMove={f.onMove} onEnter={() => f.setActive(true)} onLeave={() => f.setActive(false)}>
      <span className="pointer-events-none z-10 text-sm font-semibold text-shell-ink/40">SPOTLIGHT</span>
      <motion.span
        className="pointer-events-none absolute left-1/2 top-1/2 -ml-16 -mt-16 h-32 w-32 rounded-full"
        style={{
          x: f.sx,
          y: f.sy,
          background: 'radial-gradient(circle, rgba(201,184,255,0.55), rgba(201,184,255,0) 65%)',
        }}
      />
    </CursorStage>
  );
}

function CursorTrailDemo() {
  const f = useCursorField({ stiffness: 700, damping: 34 });
  // Each dot lags a little more than the last → a comet trail.
  const lag1 = useSpring(f.x, { stiffness: 300, damping: 26 });
  const lag1y = useSpring(f.y, { stiffness: 300, damping: 26 });
  const lag2 = useSpring(lag1, { stiffness: 220, damping: 26 });
  const lag2y = useSpring(lag1y, { stiffness: 220, damping: 26 });
  const lag3 = useSpring(lag2, { stiffness: 160, damping: 26 });
  const lag3y = useSpring(lag2y, { stiffness: 160, damping: 26 });
  const dots = [
    { x: f.x, y: f.y, s: 'h-3 w-3 bg-shell-glow', o: 1 },
    { x: lag1, y: lag1y, s: 'h-2.5 w-2.5 bg-[#a78bfa]', o: 0.8 },
    { x: lag2, y: lag2y, s: 'h-2 w-2 bg-[#7c9eff]', o: 0.6 },
    { x: lag3, y: lag3y, s: 'h-1.5 w-1.5 bg-[#7c9eff]', o: 0.4 },
  ];
  return (
    <CursorStage fieldRef={f.ref} onMove={f.onMove} onEnter={() => f.setActive(true)} onLeave={() => f.setActive(false)}>
      {dots.map((dt, i) => (
        <motion.span
          key={i}
          className={`pointer-events-none absolute left-1/2 top-1/2 rounded-full ${dt.s}`}
          style={{ x: dt.x, y: dt.y, opacity: dt.o, marginLeft: -6, marginTop: -6 }}
        />
      ))}
    </CursorStage>
  );
}

function CursorTiltDemo() {
  const f = useCursorField({ stiffness: 250, damping: 20 });
  const rotateY = useTransform(f.sx, [-70, 70], [-16, 16]);
  const rotateX = useTransform(f.sy, [-50, 50], [12, -12]);
  return (
    <CursorStage fieldRef={f.ref} onMove={f.onMove} onEnter={() => f.setActive(true)} onLeave={() => f.setActive(false)}>
      <div style={{ perspective: 500 }}>
        <motion.div
          className="grid h-16 w-24 place-items-center rounded-xl bg-gradient-to-br from-shell-glow to-[#7c9eff] text-xs font-semibold text-shell-base"
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        >
          tilt
        </motion.div>
      </div>
    </CursorStage>
  );
}

function CursorRippleDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const nextId = useRef(0);

  const addRipple = (x: number, y: number) => {
    const id = nextId.current++;
    setRipples((rs) => [...rs, { id, x, y }]);
    window.setTimeout(() => setRipples((rs) => rs.filter((r) => r.id !== id)), 700);
  };

  // Idle auto-ripple from the centre.
  useEffect(() => {
    const el = ref.current;
    const iv = window.setInterval(() => {
      const w = el?.clientWidth ?? 200;
      const h = el?.clientHeight ?? 112;
      addRipple(w / 2, h / 2);
    }, 1100);
    return () => window.clearInterval(iv);
  }, []);

  return (
    <div
      ref={ref}
      onClick={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (r) addRipple(e.clientX - r.left, e.clientY - r.top);
      }}
      className="relative grid h-28 cursor-pointer place-items-center overflow-hidden rounded-2xl border border-shell-line bg-shell-base"
    >
      <span className="pointer-events-none text-[10px] font-medium text-shell-mute">click anywhere</span>
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="pointer-events-none absolute rounded-full border-2 border-shell-glow"
            style={{ left: r.x, top: r.y, marginLeft: -8, marginTop: -8, width: 16, height: 16 }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Nearby chips lean toward the pointer (idle-orbit when not hovered).
function CursorMagnetDemo() {
  const f = useCursorField({ stiffness: 200, damping: 18 });
  return (
    <CursorStage fieldRef={f.ref} onMove={f.onMove} onEnter={() => f.setActive(true)} onLeave={() => f.setActive(false)}>
      <div className="flex gap-3">
        {[0.32, 0.2, 0.32].map((factor, i) => (
          <MagnetDot key={i} x={f.sx} y={f.sy} factor={factor} />
        ))}
      </div>
      <span className="pointer-events-none absolute bottom-1.5 right-2 text-[8px] uppercase tracking-wide text-shell-mute/70">
        come closer
      </span>
    </CursorStage>
  );
}

function MagnetDot({
  x,
  y,
  factor,
}: {
  x: import('framer-motion').MotionValue<number>;
  y: import('framer-motion').MotionValue<number>;
  factor: number;
}) {
  const tx = useTransform(x, (v) => v * factor);
  const ty = useTransform(y, (v) => v * factor);
  return (
    <motion.span
      className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-shell-glow to-[#7c9eff] text-[9px] font-semibold text-shell-base"
      style={{ x: tx, y: ty }}
    >
      Aa
    </motion.span>
  );
}

function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-28 place-items-center rounded-2xl border border-shell-line bg-shell-base">
      {children}
    </div>
  );
}

// Letters decode from random glyphs into the target word on a loop.
function Scramble({ duration }: { duration: number }) {
  const target = 'DECODE';
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@$';
  const mv = useMotionValue(0);
  const [text, setText] = useState(target);
  useMotionValueEvent(mv, 'change', (v) => {
    const revealed = Math.floor(v);
    let out = '';
    for (let i = 0; i < target.length; i++) {
      out +=
        i < revealed
          ? target.charAt(i)
          : glyphs.charAt((Math.floor(v * 9) + i * 5) % glyphs.length);
    }
    setText(out);
  });
  useEffect(() => {
    const controls = animate(mv, target.length, {
      duration,
      ease: 'linear',
      repeat: Infinity,
      repeatDelay: 1.1,
      repeatType: 'loop',
    });
    return () => controls.stop();
  }, [mv, duration]);
  return (
    <span className="font-display text-lg font-semibold tracking-[0.18em] text-shell-glow">
      {text}
    </span>
  );
}

// Numbers ticking up to a value on a loop, driven by a framer motion value.
function CountUp({ duration }: { duration: number }) {
  const mv = useMotionValue(0);
  const [n, setN] = useState(0);
  useMotionValueEvent(mv, 'change', (v) => setN(Math.round(v)));

  useEffect(() => {
    const controls = animate(mv, 1240, {
      duration,
      ease: 'easeOut',
      repeat: Infinity,
      repeatDelay: 0.8,
      repeatType: 'loop',
    });
    return () => controls.stop();
  }, [mv, duration]);

  return (
    <div className="text-center">
      <div className="font-display text-3xl font-semibold text-shell-glow tabular-nums">
        {n.toLocaleString()}
      </div>
      <div className="text-[10px] text-shell-mute">sessions delivered</div>
    </div>
  );
}

// Types a fixed string in character by character on a loop, holds, then resets,
// driven by a stepped framer motion value over the preset's duration.
function Typewriter({ duration }: { duration: number }) {
  const phrase = 'Hello, world.';
  const mv = useMotionValue(0);
  const [count, setCount] = useState(0);
  useMotionValueEvent(mv, 'change', (v) => setCount(Math.round(v)));

  useEffect(() => {
    const controls = animate(mv, phrase.length, {
      duration,
      ease: 'linear',
      repeat: Infinity,
      repeatDelay: 1,
      repeatType: 'loop',
    });
    return () => controls.stop();
  }, [mv, duration]);

  return (
    <span className="font-display text-sm font-semibold text-shell-ink">
      {phrase.slice(0, count)}
      <motion.span
        className="ml-0.5 inline-block h-4 w-0.5 -mb-0.5 bg-shell-glow"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, ease: 'linear', repeat: Infinity }}
      />
    </span>
  );
}
