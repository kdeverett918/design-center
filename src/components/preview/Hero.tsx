import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { HeroVariant } from '../../preview/previewConfig';

interface HeroProps {
  brand: string;
  variant: HeroVariant;
  item: Variants;
  expressive?: boolean;
}

const HEADLINE = 'Care that listens, built around you.';
const SUB =
  'Evidence-based, compassionate support from a team that treats you like a person — not a chart. From the first visit to lasting progress.';

function CtaRow() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-onPrimary">
        Get started <ArrowRight size={16} />
      </span>
      <span className="inline-flex items-center gap-2 rounded-xl border tk-line-strong px-5 py-3 text-sm font-medium text-ink">
        <Play size={13} /> Meet the team
      </span>
    </div>
  );
}

function Eyebrow() {
  return (
    <span className="inline-block rounded-full tk-tint-secondary px-3 py-1 text-xs font-medium text-ink">
      Now accepting new clients
    </span>
  );
}

// Token-only hero, five compositions. Each is one motion item so it reveals as a
// unit; SamplePage owns the stagger across sections.
export default function Hero({ brand, variant, item, expressive }: HeroProps) {
  if (variant === 'split') {
    return (
      <motion.section variants={item} className="grid items-center gap-8 px-8 py-16 sm:grid-cols-2">
        <div>
          <Eyebrow />
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            {HEADLINE}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">{SUB}</p>
          <div className="mt-7">
            <CtaRow />
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl tk-mesh tk-shadow">
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-heading text-2xl font-semibold text-onPrimary/90">{brand}</span>
          </div>
        </div>
      </motion.section>
    );
  }

  if (variant === 'centered') {
    return (
      <motion.section variants={item} className="px-8 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <Eyebrow />
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-[3.25rem]">
            {HEADLINE}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted">{SUB}</p>
          <div className="mt-7 flex justify-center">
            <CtaRow />
          </div>
        </div>
      </motion.section>
    );
  }

  if (variant === 'fullbleed') {
    return (
      <motion.section variants={item} className="relative overflow-hidden px-8 py-24">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 opacity-90 tk-mesh" />
        <div className="relative max-w-xl">
          <span className="inline-block rounded-full bg-bg/20 px-3 py-1 text-xs font-medium text-onPrimary backdrop-blur">
            Now accepting new clients
          </span>
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-onPrimary sm:text-5xl">
            {HEADLINE}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-onPrimary/85">{SUB}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-xl bg-bg px-5 py-3 text-sm font-semibold text-primary">
              Get started <ArrowRight size={16} />
            </span>
            <span className="rounded-xl border border-bg/40 px-5 py-3 text-sm font-medium text-onPrimary">
              Meet the team
            </span>
          </div>
        </div>
      </motion.section>
    );
  }

  if (variant === 'gradient-mesh') {
    return (
      <motion.section variants={item} className="relative overflow-hidden px-8 py-20">
        <div
          className={`absolute inset-0 tk-mesh ${expressive ? 'animate-gradient-drift' : ''}`}
          style={{ opacity: 0.22 }}
        />
        <div className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full tk-tint-primary blur-3xl" />
        <div className="relative max-w-2xl">
          <Eyebrow />
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-[3.25rem]">
            {HEADLINE}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">{SUB}</p>
          <div className="mt-7">
            <CtaRow />
          </div>
        </div>
      </motion.section>
    );
  }

  if (variant === 'editorial') {
    return (
      <motion.section variants={item} className="px-8 py-16">
        <div className="flex items-center justify-between border-b tk-line-strong pb-3 text-[11px] uppercase tracking-[0.2em] text-muted">
          <span>Care &amp; Practice</span>
          <span>Est. 2024</span>
        </div>
        <h1 className="mt-8 font-heading text-5xl font-semibold leading-[0.95] tracking-tight text-ink sm:text-[4.5rem]">
          {HEADLINE}
        </h1>
        <div className="mt-8 grid gap-6 border-t tk-line pt-6 sm:grid-cols-[1.4fr_1fr]">
          <p className="text-lg leading-relaxed text-muted">{SUB}</p>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <CtaRow />
            <span className="text-xs text-muted">Trusted by 12,000+ clients</span>
          </div>
        </div>
      </motion.section>
    );
  }

  if (variant === 'showcase') {
    return (
      <motion.section variants={item} className="px-8 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <Eyebrow />
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-[3rem]">
            {HEADLINE}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted">{SUB}</p>
          <div className="mt-7 flex justify-center">
            <CtaRow />
          </div>
        </div>
        {/* product/app mockup */}
        <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border tk-line-strong bg-surface tk-shadow">
          <div className="flex items-center gap-1.5 border-b tk-line px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="h-2.5 w-2.5 rounded-full tk-tint-secondary" />
            <span className="h-2.5 w-2.5 rounded-full tk-tint-primary" />
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl tk-tint-primary p-4 text-left">
                <div className="h-2 w-10 rounded-full bg-primary" />
                <div className="mt-3 h-2 w-full rounded-full tk-line-strong border-t" />
                <div className="mt-2 h-2 w-2/3 rounded-full tk-line-strong border-t" />
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    );
  }

  if (variant === 'overlap') {
    return (
      <motion.section variants={item} className="relative px-8 py-16">
        <div className="relative grid items-center gap-6 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="relative z-10">
            <Eyebrow />
            <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl">
              {HEADLINE}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">{SUB}</p>
            <div className="mt-7">
              <CtaRow />
            </div>
          </div>
          {/* offset panel that tucks behind the headline */}
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-primary tk-shadow sm:-ml-16">
            <div className="absolute inset-0 opacity-80 tk-mesh" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-surface/85 p-4 backdrop-blur tk-shadow">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-3xl font-semibold text-ink">98%</span>
                <span className="text-xs text-muted">client satisfaction</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Measured across every visit, every year.
              </p>
            </div>
            <span className="absolute right-5 top-5 font-heading text-lg font-semibold text-onPrimary/90">
              {brand}
            </span>
          </div>
        </div>
      </motion.section>
    );
  }

  if (variant === 'siderail') {
    return (
      <motion.section variants={item} className="grid gap-0 px-0 py-0 sm:grid-cols-[auto_1fr]">
        {/* vertical brand rail */}
        <div className="hidden flex-col justify-between bg-primary px-5 py-16 sm:flex">
          <span className="font-heading text-sm font-semibold tracking-tight text-onPrimary [writing-mode:vertical-rl] [text-orientation:mixed]">
            {brand}
          </span>
          <span className="text-[11px] uppercase tracking-[0.2em] text-onPrimary/70 [writing-mode:vertical-rl]">
            Est. 2024
          </span>
        </div>
        <div className="px-8 py-16">
          <Eyebrow />
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-[3.25rem]">
            {HEADLINE}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">{SUB}</p>
          <div className="mt-7 flex items-center gap-6">
            <CtaRow />
          </div>
          <div className="mt-9 flex flex-wrap gap-x-10 gap-y-3 border-t tk-line pt-6">
            {[
              ['12k+', 'clients served'],
              ['4.9', 'average rating'],
              ['24/7', 'support'],
            ].map(([stat, label]) => (
              <div key={label}>
                <div className="font-heading text-xl font-semibold text-ink">{stat}</div>
                <div className="text-xs text-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    );
  }

  // typeonly (default)
  return (
    <motion.section variants={item} className="px-8 py-20">
      <Eyebrow />
      <h1 className="mt-6 font-heading text-5xl font-semibold leading-[0.98] tracking-tight text-ink sm:text-7xl">
        {HEADLINE}
      </h1>
      <div className="mt-8 flex max-w-3xl items-end justify-between gap-8 border-t tk-line pt-6">
        <p className="max-w-md text-base leading-relaxed text-muted">{SUB}</p>
        <span className="hidden shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-onPrimary sm:inline-flex">
          Get started <ArrowRight size={16} />
        </span>
      </div>
    </motion.section>
  );
}
