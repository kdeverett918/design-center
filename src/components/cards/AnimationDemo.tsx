import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
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

    default:
      return <Stage>{Tile}</Stage>;
  }
}

function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-28 place-items-center rounded-2xl border border-shell-line bg-shell-base">
      {children}
    </div>
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
