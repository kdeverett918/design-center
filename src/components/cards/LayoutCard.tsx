import { createElement } from 'react';
import { m as motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import type { FontPairing, LayoutPreset, Palette } from '../../types';
import type { CardStyle, HeroVariant } from '../../preview/previewConfig';
import ThemedScope from '../../theme/ThemedScope';
import ScaledFrame from '../preview/ScaledFrame';
import LazyMount from '../preview/LazyMount';
import Hero from '../preview/Hero';
import FeatureCards from '../preview/FeatureCards';
import Nav from '../preview/Nav';
import Footer from '../preview/Footer';
import { sectionFor } from '../preview/sections/registry';
import FavoriteStar from './FavoriteStar';

const STATIC: Variants = { hidden: {}, show: {} };

interface LayoutCardProps {
  preset: LayoutPreset;
  palette: Palette;
  fonts: FontPairing;
  /** True when this layout is currently in the live preview. */
  applied?: boolean;
  /** Provided in the gallery — applies/toggles the layout in the live preview. */
  onApply?: (previewKey: string) => void;
  brand?: string;
}

const HEIGHT: Record<LayoutPreset['type'], number> = {
  hero: 188,
  section: 210,
  card: 150,
  nav: 96,
  footer: 132,
};

// Renders the ACTUAL themed element (scaled to a thumbnail) so each layout reads
// clearly — no abstract wireframes.
function Preview({ preset, brand }: { preset: LayoutPreset; brand: string }) {
  const k = preset.previewKey;
  if (preset.type === 'hero') return <Hero variant={k.slice(5) as HeroVariant} brand={brand} item={STATIC} />;
  if (preset.type === 'card') return <FeatureCards cardStyle={k.slice(5) as CardStyle} item={STATIC} />;
  if (preset.type === 'section') {
    const section = sectionFor(k);
    return section ? createElement(section, { brand }) : <FallbackBlock label={preset.name} />;
  }
  if (preset.type === 'nav') return <Nav variant={k} brand={brand} />;
  return <Footer variant={k} brand={brand} />;
}

export default function LayoutCard({
  preset,
  palette,
  fonts,
  applied,
  onApply,
  brand = 'Your Practice',
}: LayoutCardProps) {
  const reduced = useReducedMotion();
  const isSection = preset.type === 'section';
  // The dashboard sidebar isn't a marketing-page nav, so it stays browse-only.
  const navApplicable = preset.type === 'nav' && preset.previewKey !== 'nav-sidebar';
  const canApply =
    !!onApply &&
    (preset.type === 'hero' || preset.type === 'card' || preset.type === 'footer' || isSection || navApplicable);
  const applyLabel = applied ? (isSection ? 'Added' : 'Applied') : isSection ? 'Add' : 'Apply';

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      whileHover={reduced ? undefined : { y: -3 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className={`group relative overflow-hidden rounded-3xl border bg-shell-panel transition-colors ${
        applied ? 'border-shell-glow ring-1 ring-shell-glow/50' : 'border-shell-line'
      }`}
    >
      <div className="absolute right-3 top-3 z-10">
        <FavoriteStar kind="layout" id={preset.id} label={preset.name} tone="shell" />
      </div>

      {/* live, themed thumbnail — paint the theme's page background so transparent
          heroes/sections render their ink on the correct surface (never dark-on-dark). */}
      <div className="overflow-hidden border-b border-shell-line bg-shell-base">
        <LazyMount height={HEIGHT[preset.type]}>
          <ThemedScope palette={palette} fonts={fonts} className="bg-bg">
            <ScaledFrame height={HEIGHT[preset.type]}>
              <Preview preset={preset} brand={brand} />
            </ScaledFrame>
          </ThemedScope>
        </LazyMount>
      </div>

      <div className="flex items-start justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-sm font-semibold text-shell-ink">{preset.name}</h3>
            <span className="rounded-full border border-shell-line px-1.5 py-0.5 text-[10px] capitalize text-shell-mute">
              {preset.type}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-shell-mute">{preset.description}</p>
        </div>
        {canApply && (
          <button
            type="button"
            onClick={() => onApply!(preset.previewKey)}
            aria-pressed={applied}
            className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
              applied
                ? 'bg-shell-glow/15 text-shell-glow'
                : 'border border-shell-line text-shell-ink hover:border-shell-glow/50'
            }`}
          >
            {applied ? <Check size={13} /> : <Plus size={13} />}
            {applyLabel}
          </button>
        )}
      </div>
    </motion.article>
  );
}

function FallbackBlock({ label }: { label: string }) {
  return (
    <div className="grid h-40 place-items-center bg-surface text-sm font-medium text-muted">{label}</div>
  );
}
