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
      <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-bg">
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
            <span className="font-heading text-2xl font-semibold text-bg/90">{brand}</span>
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
          <span className="inline-block rounded-full bg-bg/20 px-3 py-1 text-xs font-medium text-bg backdrop-blur">
            Now accepting new clients
          </span>
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-bg sm:text-5xl">
            {HEADLINE}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-bg/85">{SUB}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-xl bg-bg px-5 py-3 text-sm font-semibold text-primary">
              Get started <ArrowRight size={16} />
            </span>
            <span className="rounded-xl border border-bg/40 px-5 py-3 text-sm font-medium text-bg">
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

  // typeonly
  return (
    <motion.section variants={item} className="px-8 py-20">
      <Eyebrow />
      <h1 className="mt-6 font-heading text-5xl font-semibold leading-[0.98] tracking-tight text-ink sm:text-7xl">
        {HEADLINE}
      </h1>
      <div className="mt-8 flex max-w-3xl items-end justify-between gap-8 border-t tk-line pt-6">
        <p className="max-w-md text-base leading-relaxed text-muted">{SUB}</p>
        <span className="hidden shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-bg sm:inline-flex">
          Get started <ArrowRight size={16} />
        </span>
      </div>
    </motion.section>
  );
}
