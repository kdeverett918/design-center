import type { ButtonHTMLAttributes, ReactNode } from 'react';

// =============================================================================
// Color-coded button system for the studio chrome.
//
// Every action in the app reads at a glance by COLOR, not just position:
//   primary  → brand glow      (the main "do it" action: Get started, Apply)
//   info     → sky             (share / copy-link / navigational)
//   success  → emerald         (send / confirm / save)
//   danger   → rose            (reset / clear / remove)
//   accent   → violet          (delight: Surprise me, randomize)
//   neutral  → shell outline   (low-emphasis utility: device toggles, dismiss)
//
// All emphasized tones are SOLID saturated fills with near-white text so they
// stay AA-readable in BOTH the light and dark shell (the shell flips via
// html[data-mode], which Tailwind `dark:` can't see — so we avoid mode-aware
// text colors and lean on solid -600 fills, which clear 4.5:1 against white).
//
// Use <Button> for real buttons; use buttonClasses(tone,size) to paint the same
// styling onto <Link>, <a>, or a framer-motion element.
// =============================================================================

export type ButtonTone =
  | 'primary'
  | 'info'
  | 'success'
  | 'danger'
  | 'accent'
  | 'neutral';

export type ButtonSize = 'sm' | 'md';

const BASE =
  'inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold ' +
  'outline-none transition-[transform,background-color,border-color,box-shadow] ' +
  'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-shell-base ' +
  'disabled:cursor-not-allowed disabled:opacity-50 ' +
  'motion-safe:active:scale-[0.97] motion-safe:hover:scale-[1.02] will-change-transform';

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
};

// Each tone: solid fill + hover + focus ring. Near-white text on saturated -600s.
const TONES: Record<ButtonTone, string> = {
  primary:
    'bg-shell-glow text-shell-base shadow-sm shadow-shell-glow/30 hover:brightness-110 focus-visible:ring-shell-glow',
  info: 'bg-sky-600 text-white hover:bg-sky-500 focus-visible:ring-sky-500',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-500',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500',
  accent: 'bg-violet-600 text-white hover:bg-violet-500 focus-visible:ring-violet-500',
  neutral:
    'border border-shell-line bg-shell-panel text-shell-ink hover:border-shell-glow/50 hover:text-shell-ink focus-visible:ring-shell-glow/60',
};

// Helper so <Link>, <a>, and framer-motion elements share the exact styling.
// (Non-component export alongside Button — fast-refresh DX rule only, safe here.)
// eslint-disable-next-line react-refresh/only-export-components
export function buttonClasses(tone: ButtonTone = 'neutral', size: ButtonSize = 'md'): string {
  return `${BASE} ${SIZES[size]} ${TONES[tone]}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ButtonTone;
  size?: ButtonSize;
  children: ReactNode;
}

export default function Button({
  tone = 'neutral',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={`${buttonClasses(tone, size)} ${className}`} {...rest}>
      {children}
    </button>
  );
}
