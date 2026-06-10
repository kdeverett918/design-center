import type { AnimationCategory } from '../types';

// =============================================================================
// Color language for the six animation categories. The same hue follows a
// category everywhere — picker tabs, chips, and the "in motion" strip under
// the preview — so clients learn the code once. Every class string is literal
// (Tailwind can't see computed names).
//
// `verb` answers the question the old chip cloud never did: HOW do I see this
// effect in the live preview? (`action` is the 2–3 word badge version.)
// =============================================================================

export interface CategoryMeta {
  label: string;
  /** small colored dot */
  dot: string;
  /** active tab treatment */
  tabOn: string;
  /** active chip treatment */
  chipOn: string;
  /** colored text accent */
  text: string;
  /** one-line "how to feel it" coaching for the category */
  verb: string;
  /** ultra-short action badge ("hover it", "loops") */
  action: string;
}

export const CATEGORY_META: Record<AnimationCategory, CategoryMeta> = {
  entrance: {
    label: 'Entrance',
    dot: 'bg-sky-400',
    tabOn: 'border-sky-400/70 bg-sky-400/15 text-shell-ink',
    chipOn: 'border-sky-400/70 bg-sky-400/15 text-shell-ink',
    text: 'text-sky-400',
    verb: 'Plays once as the page arrives — tap Replay to watch it again.',
    action: 'replay it',
  },
  scroll: {
    label: 'Scroll',
    dot: 'bg-teal-400',
    tabOn: 'border-teal-400/70 bg-teal-400/15 text-shell-ink',
    chipOn: 'border-teal-400/70 bg-teal-400/15 text-shell-ink',
    text: 'text-teal-400',
    verb: 'Wakes up as the page moves — scroll inside the preview window.',
    action: 'scroll the page',
  },
  hover: {
    label: 'Hover',
    dot: 'bg-amber-400',
    tabOn: 'border-amber-400/70 bg-amber-400/15 text-shell-ink',
    chipOn: 'border-amber-400/70 bg-amber-400/15 text-shell-ink',
    text: 'text-amber-400',
    verb: 'Reacts to touch — hover the buttons, cards and links in the preview.',
    action: 'hover it',
  },
  cursor: {
    label: 'Cursor',
    dot: 'bg-violet-400',
    tabOn: 'border-violet-400/70 bg-violet-400/15 text-shell-ink',
    chipOn: 'border-violet-400/70 bg-violet-400/15 text-shell-ink',
    text: 'text-violet-400',
    verb: 'Follows your pointer — glide it across the live page.',
    action: 'move your cursor',
  },
  continuous: {
    label: 'Loops',
    dot: 'bg-rose-400',
    tabOn: 'border-rose-400/70 bg-rose-400/15 text-shell-ink',
    chipOn: 'border-rose-400/70 bg-rose-400/15 text-shell-ink',
    text: 'text-rose-400',
    verb: 'Always in motion. Camera moves are slow and cinematic on purpose.',
    action: 'loops on its own',
  },
  transition: {
    label: 'Transition',
    dot: 'bg-indigo-400',
    tabOn: 'border-indigo-400/70 bg-indigo-400/15 text-shell-ink',
    chipOn: 'border-indigo-400/70 bg-indigo-400/15 text-shell-ink',
    text: 'text-indigo-400',
    verb: 'Shows whenever the page changes — switch a layout or hit Replay.',
    action: 'on page change',
  },
};
