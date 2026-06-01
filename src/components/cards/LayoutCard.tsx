import { createElement } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Activity, ArrowRight, Check, Plus } from 'lucide-react';
import type { FontPairing, LayoutPreset, Palette } from '../../types';
import type { CardStyle, HeroVariant } from '../../preview/previewConfig';
import ThemedScope from '../../theme/ThemedScope';
import ScaledFrame from '../preview/ScaledFrame';
import Hero from '../preview/Hero';
import FeatureCards from '../preview/FeatureCards';
import { sectionFor } from '../preview/sections/registry';
import FavoriteStar from './FavoriteStar';

const STATIC: Variants = { hidden: {}, show: {} };

interface LayoutCardProps {
  preset: LayoutPreset;
  palette: Palette;
  fonts: FontPairing;
  /** True when this hero/card layout is the one currently in the live preview. */
  applied?: boolean;
  /** Provided for hero/card layouts — applies the layout to the live preview. */
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

  if (preset.type === 'hero') {
    return <Hero variant={k.slice(5) as HeroVariant} brand={brand} item={STATIC} />;
  }
  if (preset.type === 'card') {
    return <FeatureCards cardStyle={k.slice(5) as CardStyle} item={STATIC} />;
  }
  if (preset.type === 'section') {
    const section = sectionFor(k);
    return section ? createElement(section, { brand }) : <FallbackBlock label={preset.name} />;
  }
  if (preset.type === 'nav') return <NavSnippet variant={k} brand={brand} />;
  return <FooterSnippet variant={k} brand={brand} />;
}

export default function LayoutCard({ preset, palette, fonts, applied, onApply, brand = 'Your Practice' }: LayoutCardProps) {
  const canApply = !!onApply && (preset.type === 'hero' || preset.type === 'card');

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -3 }}
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
      <div className="overflow-hidden border-b border-shell-line">
        <ThemedScope palette={palette} fonts={fonts} className="bg-bg">
          <ScaledFrame height={HEIGHT[preset.type]}>
            <Preview preset={preset} brand={brand} />
          </ScaledFrame>
        </ThemedScope>
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
            className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
              applied
                ? 'bg-shell-glow/15 text-shell-glow'
                : 'border border-shell-line text-shell-ink hover:border-shell-glow/50'
            }`}
          >
            {applied ? <Check size={13} /> : <Plus size={13} />}
            {applied ? 'Applied' : 'Apply'}
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

function NavSnippet({ variant, brand }: { variant: string; brand: string }) {
  const Logo = (
    <div className="flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-xl bg-primary">
        <Activity size={16} className="text-onPrimary" />
      </span>
      <span className="font-heading text-lg font-semibold text-ink">{brand}</span>
    </div>
  );
  const links = ['Services', 'About', 'Resources'];

  if (variant === 'nav-sidebar') {
    return (
      <div className="flex bg-bg" style={{ height: 220 }}>
        <div className="w-44 space-y-2 border-r tk-line bg-surface p-5">
          {Logo}
          <div className="space-y-1 pt-3">
            {['Dashboard', ...links, 'Settings'].map((l, i) => (
              <div
                key={l}
                className={`rounded-lg px-3 py-2 text-sm ${i === 0 ? 'bg-primary text-onPrimary' : 'text-muted'}`}
              >
                {l}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="h-3 w-1/3 rounded bg-ink/10" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-16 rounded-xl bg-surface tk-shadow" />
            <div className="h-16 rounded-xl bg-surface tk-shadow" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'nav-centered-logo') {
    return (
      <div className="grid grid-cols-3 items-center bg-bg px-8 py-5">
        <div className="flex gap-5 text-sm text-muted">
          <span>Services</span>
          <span>About</span>
        </div>
        <div className="flex justify-center">{Logo}</div>
        <div className="flex justify-end gap-5 text-sm text-muted">
          <span>Resources</span>
          <span className="rounded-full bg-primary px-4 py-1.5 font-medium text-onPrimary">Book</span>
        </div>
      </div>
    );
  }

  // nav-sticky-clear (default)
  return (
    <div className="flex items-center justify-between border-b tk-line bg-bg px-8 py-5">
      {Logo}
      <div className="flex items-center gap-6 text-sm text-muted">
        {links.map((l) => (
          <span key={l}>{l}</span>
        ))}
        <span className="rounded-full bg-primary px-4 py-1.5 font-medium text-onPrimary">Book a visit</span>
      </div>
    </div>
  );
}

function FooterSnippet({ variant, brand }: { variant: string; brand: string }) {
  if (variant === 'footer-cta-band') {
    return (
      <div className="bg-bg">
        <div className="mx-6 my-6 rounded-3xl bg-primary px-8 py-8 text-center">
          <p className="font-heading text-2xl font-semibold text-onPrimary">Ready to get started?</p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-bg px-5 py-2.5 text-sm font-semibold text-primary">
            Book a visit <ArrowRight size={15} />
          </span>
        </div>
        <div className="flex justify-center gap-5 px-8 pb-6 text-xs text-muted">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </div>
      </div>
    );
  }

  if (variant === 'footer-minimal') {
    return (
      <div className="flex flex-col items-center gap-3 border-t tk-line bg-surface px-8 py-8">
        <span className="font-heading text-base font-semibold text-ink">{brand}</span>
        <div className="flex gap-5 text-xs text-muted">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
          <span className="text-primary">Book a visit</span>
        </div>
      </div>
    );
  }

  // footer-mega (default)
  return (
    <div className="grid grid-cols-4 gap-6 border-t tk-line bg-surface px-8 py-8">
      <div>
        <span className="font-heading text-base font-semibold text-ink">{brand}</span>
        <p className="mt-2 text-xs text-muted">Care that listens, built around you.</p>
      </div>
      {['Services', 'Company', 'Resources'].map((col) => (
        <div key={col} className="space-y-2 text-xs text-muted">
          <div className="font-semibold text-ink">{col}</div>
          <div>Link one</div>
          <div>Link two</div>
          <div>Link three</div>
        </div>
      ))}
    </div>
  );
}
