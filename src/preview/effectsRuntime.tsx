/* eslint-disable react-refresh/only-export-components -- the provider and its
   resolver/helpers are one cohesive runtime module; HMR precision here is
   irrelevant (preview re-mounts on every config change anyway). */
import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Variants } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { animationById } from '../data/animations';

// =============================================================================
// Effects runtime — turns the client's selected animation preset ids into
// precomputed "slot decisions" the preview page consumes. Components read the
// resolved runtime via useFx(); the default context is EMPTY_FX, so layout
// thumbnails and minis render byte-identical inert markup with zero changes.
// =============================================================================

export type HeadlineFx =
  | 'typewriter'
  | 'text-scramble'
  | 'kinetic-type'
  | 'reveal-mask'
  | 'poster-reveal'
  | null;
export type BlockFx = 'fade-up' | 'blur-in' | 'bounce-in' | null;

export interface FxRuntime {
  /** true when at least one selected effect resolved (and motion is allowed) */
  any: boolean;
  headlineFx: HeadlineFx;
  blockFx: BlockFx;
  staggerBoost: boolean;
  scrollReveal: boolean;
  countUp: boolean;
  parallax: boolean;
  confetti: boolean;
  marqueeBand: 'quiet' | 'ticker' | null;
  card: {
    tilt: boolean;
    wobble: boolean;
    lift: boolean;
    ripple: boolean;
    stickerSpin: boolean;
    float: boolean;
  };
  cta: { magnetic: boolean; popScale: boolean; pulse: boolean; shine: boolean };
  link: { underline: boolean };
  image: { zoom: boolean; float: boolean; drift: boolean };
  headline: { glitch: boolean; shimmer: boolean };
  cursor: { dot: boolean; follow: boolean; spotlight: boolean; trail: boolean; ripple: boolean };
  pageFade: boolean;
  morphIn: boolean;
}

export const EMPTY_FX: FxRuntime = {
  any: false,
  headlineFx: null,
  blockFx: null,
  staggerBoost: false,
  scrollReveal: false,
  countUp: false,
  parallax: false,
  confetti: false,
  marqueeBand: null,
  card: { tilt: false, wobble: false, lift: false, ripple: false, stickerSpin: false, float: false },
  cta: { magnetic: false, popScale: false, pulse: false, shine: false },
  link: { underline: false },
  image: { zoom: false, float: false, drift: false },
  headline: { glitch: false, shimmer: false },
  cursor: { dot: false, follow: false, spotlight: false, trail: false, ripple: false },
  pageFade: false,
  morphIn: false,
};

// When several headline/block entrances are picked, the most characterful wins.
const HEADLINE_PRIORITY: Exclude<HeadlineFx, null>[] = [
  'typewriter',
  'text-scramble',
  'kinetic-type',
  'poster-reveal',
  'reveal-mask',
];
const BLOCK_PRIORITY: Exclude<BlockFx, null>[] = ['bounce-in', 'blur-in', 'fade-up'];

export function resolveEffects(ids: string[] | undefined, reduced: boolean): FxRuntime {
  if (reduced || !ids?.length) return EMPTY_FX;
  const valid = new Set(ids.filter((id) => animationById(id)));
  if (valid.size === 0) return EMPTY_FX;
  const has = (id: string) => valid.has(id);

  const fx: FxRuntime = {
    any: true,
    headlineFx: HEADLINE_PRIORITY.find(has) ?? null,
    blockFx: BLOCK_PRIORITY.find(has) ?? null,
    staggerBoost: has('stagger-reveal'),
    scrollReveal: has('scroll-reveal'),
    countUp: has('count-up'),
    parallax: has('parallax-layer'),
    confetti: has('confetti-burst'),
    marqueeBand: has('marquee-ticker') ? 'ticker' : has('marquee') ? 'quiet' : null,
    card: {
      // single transform owner per card: tilt > wobble > lift
      tilt: has('tilt-3d') || has('cursor-tilt'),
      wobble: has('wobble') && !has('tilt-3d') && !has('cursor-tilt'),
      lift: has('hover-lift') && !has('tilt-3d') && !has('cursor-tilt') && !has('wobble'),
      ripple: has('ripple'),
      stickerSpin: has('sticker-spin'),
      float: has('gentle-float'),
    },
    cta: {
      magnetic: has('magnetic-button') || has('cursor-magnet'),
      popScale: has('pop-scale'),
      pulse: has('cta-pulse'),
      shine: has('chrome-shine'),
    },
    link: { underline: has('underline-grow') },
    image: { zoom: has('image-zoom'), float: has('gentle-float'), drift: has('gradient-drift') },
    headline: { glitch: has('glitch-shift'), shimmer: has('text-shimmer') },
    cursor: {
      dot: has('cursor-dot'),
      follow: has('cursor-follow'),
      spotlight: has('cursor-spotlight'),
      trail: has('cursor-trail'),
      ripple: has('cursor-ripple'),
    },
    pageFade: has('page-fade'),
    morphIn: has('view-transition'),
  };
  return fx;
}

export function anyCursor(fx: FxRuntime): boolean {
  const c = fx.cursor;
  return c.dot || c.follow || c.spotlight || c.trail || c.ripple;
}

const FxContext = createContext<FxRuntime>(EMPTY_FX);

export function EffectsProvider({ value, children }: { value: FxRuntime; children: ReactNode }) {
  return <FxContext.Provider value={value}>{children}</FxContext.Provider>;
}

export function useFx(): FxRuntime {
  return useContext(FxContext);
}

/** Resolve ids with reduced-motion respected — convenience hook for the frame. */
export function useResolvedEffects(ids: string[] | undefined): FxRuntime {
  const reduced = useReducedMotion() ?? false;
  const key = (ids ?? []).join(',');
  // eslint-disable-next-line react-hooks/exhaustive-deps -- key encodes ids
  return useMemo(() => resolveEffects(ids, reduced), [key, reduced]);
}

// Block-entrance override: a selected entrance preset replaces the intensity
// spec's item variants for every page block.
export function fxItemVariants(fx: FxRuntime, specItem: Variants): Variants {
  let base = specItem;
  if (fx.blockFx === 'fade-up') {
    base = {
      hidden: { opacity: 0, y: 16 },
      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    };
  } else if (fx.blockFx === 'blur-in') {
    base = {
      hidden: { opacity: 0, filter: 'blur(8px)' },
      show: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: 'easeOut' } },
    };
  } else if (fx.blockFx === 'bounce-in') {
    base = {
      hidden: { opacity: 0, y: -40 },
      show: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 400, damping: 12 },
      },
    };
  }
  if (fx.morphIn) {
    const hidden = (base.hidden ?? {}) as Record<string, unknown>;
    const show = (base.show ?? {}) as Record<string, unknown>;
    base = {
      hidden: { ...hidden, scale: 0.96, borderRadius: '24px' },
      show: { ...show, scale: 1, borderRadius: '0px' },
    };
  }
  return base;
}
