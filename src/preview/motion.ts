import type { Variants } from 'framer-motion';
import type { AnimationIntensity } from '../types';

// Motion language per intensity. Subtle = small/quiet; expressive = larger, with
// blur + spring energy. All respect prefers-reduced-motion (returns no-op).

interface MotionSpec {
  container: Variants;
  item: Variants;
  /** viewport amount for whileInView reveals */
  amount: number;
}

const REDUCED: MotionSpec = {
  container: { hidden: {}, show: {} },
  item: { hidden: { opacity: 1 }, show: { opacity: 1 } },
  amount: 0.1,
};

const SPECS: Record<AnimationIntensity, MotionSpec> = {
  subtle: {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
    item: {
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
    },
    amount: 0.3,
  },
  standard: {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } },
    item: {
      hidden: { opacity: 0, y: 22 },
      show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
    },
    amount: 0.3,
  },
  expressive: {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.13, delayChildren: 0.08 } } },
    item: {
      hidden: { opacity: 0, y: 34, filter: 'blur(8px)' },
      show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { type: 'spring', stiffness: 120, damping: 18, mass: 0.9 },
      },
    },
    amount: 0.25,
  },
};

export function motionSpec(intensity: AnimationIntensity, reduced: boolean): MotionSpec {
  return reduced ? REDUCED : SPECS[intensity];
}

// Hover lift strength scales with intensity (used by cards/buttons).
export function hoverLift(intensity: AnimationIntensity, reduced: boolean): number {
  if (reduced) return 0;
  return intensity === 'subtle' ? -2 : intensity === 'standard' ? -4 : -7;
}
