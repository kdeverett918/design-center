import { useRef } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { m as motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { HeroVariant } from '../../preview/previewConfig';
import { useFx } from '../../preview/effectsRuntime';
import { useCopy } from '../../preview/copyContext';
import { fill } from '../../preview/copyPacks';
import FxHeadline from './effects/FxHeadline';
import FxCta from './effects/FxCta';
import { useParallax } from './effects/useParallax';

interface HeroProps {
  brand: string;
  variant: HeroVariant;
  item: Variants;
  expressive?: boolean;
  /**
   * Optional AI-generated hero background (themed previews only). When present,
   * the split / fullbleed / overlap variants render it as a cover layer beneath
   * a token-colored scrim that guarantees text contrast. When absent, the
   * existing CSS gradient (tk-mesh) renders unchanged — so the à-la-carte mixer,
   * which passes nothing, keeps full live re-theming.
   */
  heroImage?: string;
}

function CtaRow() {
  const copy = useCopy();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FxCta>
        <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-onPrimary">
          {copy.ctaPrimary} <ArrowRight size={16} />
        </span>
      </FxCta>
      <span className="inline-flex items-center gap-2 rounded-xl border tk-line-strong px-5 py-3 text-sm font-medium text-ink">
        <Play size={13} /> {copy.ctaSecondary}
      </span>
    </div>
  );
}

function Eyebrow() {
  const fx = useFx();
  const copy = useCopy();
  return (
    <motion.span
      className={`inline-block rounded-full tk-tint-secondary px-3 py-1 text-xs font-medium text-ink ${
        fx.image.float ? 'motion-safe:animate-float' : ''
      }`}
      whileHover={fx.card.stickerSpin ? { rotate: 360, scale: 1.1 } : undefined}
      transition={{ type: 'spring', stiffness: 200, damping: 14 }}
    >
      {copy.eyebrow}
    </motion.span>
  );
}

// Token-only hero, five compositions. Each is one motion item so it reveals as a
// unit; SamplePage owns the stagger across sections.
export default function Hero({ brand, variant, item, expressive, heroImage }: HeroProps) {
  const fx = useFx();
  const copy = useCopy();
  const HEADLINE = copy.headline;
  const SUB = fill(copy.sub, brand);
  // Parallax anchor: attached to image-led sections; inert elsewhere.
  const sectionRef = useRef<HTMLElement>(null);
  const parY = useParallax(sectionRef, fx.parallax);
  const mediaCls = fx.image.zoom ? ' fx-img-zoom' : '';
  const floatCls = fx.image.float ? ' motion-safe:animate-float' : '';
  const drift = expressive || fx.image.drift;

  if (variant === 'split') {
    return (
      <motion.section variants={item} className="grid items-center gap-8 px-8 py-16 sm:grid-cols-2">
        <div>
          <Eyebrow />
          <FxHeadline className="mt-5 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">{HEADLINE}</FxHeadline>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">{SUB}</p>
          <div className="mt-7">
            <CtaRow />
          </div>
        </div>
        <motion.div
          className={`relative aspect-[4/3] overflow-hidden rounded-3xl tk-shadow${floatCls} ${heroImage ? '' : 'tk-mesh'}`}
          style={{ y: parY }}
        >
          {heroImage && (
            <>
              <div
                className={`absolute inset-0 bg-cover bg-center${mediaCls}`}
                style={{ backgroundImage: `url(${heroImage})` }}
              />
              {/* light scrim so the centered brand label stays legible */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent" />
            </>
          )}
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-heading text-2xl font-semibold text-onPrimary/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
              {brand}
            </span>
          </div>
        </motion.div>
      </motion.section>
    );
  }

  if (variant === 'centered') {
    return (
      <motion.section variants={item} className="px-8 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <Eyebrow />
          <FxHeadline className="mt-5 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-[3.25rem]">{HEADLINE}</FxHeadline>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted">{SUB}</p>
          <div className="mt-7 flex justify-center">
            <CtaRow />
          </div>
        </div>
        {/* framed feature block below the centered copy — a real photo when present */}
        {heroImage && (
          <div className="relative mx-auto mt-12 aspect-[16/9] max-w-3xl overflow-hidden rounded-3xl border tk-line-strong tk-shadow">
            <div
              className={`absolute inset-0 bg-cover bg-center${mediaCls}`}
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            {/* light scrim so the brand label keeps AA */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/15 to-transparent" />
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 font-heading text-xl font-semibold text-onPrimary drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
              {brand}
            </span>
          </div>
        )}
      </motion.section>
    );
  }

  if (variant === 'fullbleed') {
    return (
      <motion.section ref={sectionRef} variants={item} className="relative overflow-hidden px-8 py-24">
        <div className="absolute inset-0 bg-primary" />
        {heroImage ? (
          <>
            <motion.div
              className={`absolute -inset-y-10 inset-x-0 bg-cover bg-center${mediaCls}`}
              style={{ backgroundImage: `url(${heroImage})`, y: parY }}
            />
            {/* strong token scrim — keeps onPrimary text at AA over any image */}
            <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
            {/* extra darkening from the left, where the headline sits */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/45 to-transparent" />
            <div className="absolute inset-0 opacity-40 tk-mesh" />
          </>
        ) : (
          <motion.div className="absolute -inset-y-10 inset-x-0 opacity-90 tk-mesh" style={{ y: parY }} />
        )}
        <div className="relative max-w-xl">
          <span className="inline-block rounded-full bg-bg/20 px-3 py-1 text-xs font-medium text-onPrimary backdrop-blur">
            {copy.eyebrow}
          </span>
          <FxHeadline className="mt-5 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-onPrimary sm:text-5xl">{HEADLINE}</FxHeadline>
          <p className="mt-5 max-w-md text-base leading-relaxed text-onPrimary/85">{SUB}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <FxCta>
              <span className="inline-flex items-center gap-2 rounded-xl bg-bg px-5 py-3 text-sm font-semibold text-primary">
                {copy.ctaPrimary} <ArrowRight size={16} />
              </span>
            </FxCta>
            <span className="rounded-xl border border-bg/40 px-5 py-3 text-sm font-medium text-onPrimary">
              {copy.ctaSecondary}
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
          className={`absolute inset-0 tk-mesh ${drift ? 'animate-gradient-drift' : ''}`}
          style={{ opacity: 0.22 }}
        />
        <div className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full tk-tint-primary blur-3xl" />
        {/* dark ink body text — keep the photo to a SIDE panel, never behind the copy */}
        <div className="relative grid items-center gap-8 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-2xl">
            <Eyebrow />
            <FxHeadline className="mt-5 font-heading text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-[3.25rem]">{HEADLINE}</FxHeadline>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">{SUB}</p>
            <div className="mt-7">
              <CtaRow />
            </div>
          </div>
          {heroImage && (
            <div className={`relative hidden aspect-[4/5] overflow-hidden rounded-3xl tk-shadow sm:block${floatCls}`}>
              <div
                className={`absolute inset-0 bg-cover bg-center${mediaCls}`}
                style={{ backgroundImage: `url(${heroImage})` }}
              />
              {/* faint primary scrim ties the panel to the palette */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/55 via-transparent to-transparent" />
            </div>
          )}
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
        <FxHeadline className="mt-8 font-heading text-5xl font-semibold leading-[0.95] tracking-tight text-ink sm:text-[4.5rem]">{HEADLINE}</FxHeadline>
        {/* wide editorial photo band beneath the headline */}
        {heroImage && (
          <div className="relative mt-8 aspect-[21/9] w-full overflow-hidden rounded-2xl tk-shadow">
            <div
              className={`absolute inset-0 bg-cover bg-center${mediaCls}`}
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-5 text-[11px] uppercase tracking-[0.2em] text-bg drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
              {brand} &mdash; Feature
            </span>
          </div>
        )}
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
          <FxHeadline className="mt-5 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-[3rem]">{HEADLINE}</FxHeadline>
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
          {heroImage ? (
            // real screenshot inside the browser chrome
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <div
                className={`absolute inset-0 bg-cover bg-center${mediaCls}`}
                style={{ backgroundImage: `url(${heroImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="grid gap-3 p-5 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-xl tk-tint-primary p-4 text-left">
                  <div className="h-2 w-10 rounded-full bg-primary" />
                  <div className="mt-3 h-2 w-full rounded-full tk-line-strong border-t" />
                  <div className="mt-2 h-2 w-2/3 rounded-full tk-line-strong border-t" />
                </div>
              ))}
            </div>
          )}
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
            <FxHeadline className="mt-5 font-heading text-4xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl">{HEADLINE}</FxHeadline>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">{SUB}</p>
            <div className="mt-7">
              <CtaRow />
            </div>
          </div>
          {/* offset panel that tucks behind the headline */}
          <div className={`relative aspect-square overflow-hidden rounded-3xl bg-primary tk-shadow sm:-ml-16${floatCls}`}>
            {heroImage ? (
              <>
                <div
                  className={`absolute inset-0 bg-cover bg-center${mediaCls}`}
                  style={{ backgroundImage: `url(${heroImage})` }}
                />
                {/* primary scrim keeps the corner brand label legible */}
                <div className="absolute inset-0 bg-primary/70 mix-blend-multiply" />
                <div className="absolute inset-0 opacity-40 tk-mesh" />
              </>
            ) : (
              <div className="absolute inset-0 opacity-80 tk-mesh" />
            )}
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
          <FxHeadline className="mt-5 font-heading text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-[3.25rem]">{HEADLINE}</FxHeadline>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">{SUB}</p>
          <div className="mt-7 flex items-center gap-6">
            <CtaRow />
          </div>
          {/* image panel beside the brand rail, sitting under the content */}
          {heroImage && (
            <div className="relative mt-9 aspect-[16/7] w-full overflow-hidden rounded-2xl tk-shadow">
              <div
                className={`absolute inset-0 bg-cover bg-center${mediaCls}`}
                style={{ backgroundImage: `url(${heroImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/55 via-primary/15 to-transparent" />
              <span className="absolute bottom-4 left-5 font-heading text-lg font-semibold text-onPrimary drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
                {brand}
              </span>
            </div>
          )}
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

  if (variant === 'poster') {
    return (
      <motion.section variants={item} className="px-8 py-16">
        <span className="block text-[11px] font-medium uppercase tracking-[0.32em] text-muted">
          The Quarterly &mdash; Issue No. 04
        </span>
        <FxHeadline className="mt-6 max-w-4xl font-heading text-6xl font-semibold leading-[0.9] tracking-tight text-ink sm:text-[5.5rem]">{HEADLINE}</FxHeadline>
        <div className="mt-8 h-px w-full tk-line-strong border-t" />
        {/* full-width poster image band */}
        {heroImage && (
          <div className="relative mt-7 aspect-[21/8] w-full overflow-hidden tk-shadow">
            <div
              className={`absolute inset-0 bg-cover bg-center${mediaCls}`}
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
          </div>
        )}
        <div className="mt-7 grid gap-8 sm:grid-cols-[1fr_2fr]">
          <p className="max-w-xs text-sm leading-relaxed text-muted">{SUB}</p>
          <div className="flex items-start">
            <FxCta>
              <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-onPrimary">
                {copy.ctaPrimary} <ArrowRight size={16} />
              </span>
            </FxCta>
          </div>
        </div>
      </motion.section>
    );
  }

  if (variant === 'brutal') {
    return (
      <motion.section variants={item} className="px-8 py-16">
        <span className="inline-block rounded-none bg-ink px-2 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-bg">
          No nonsense
        </span>
        <FxHeadline className="mt-6 font-heading text-6xl font-bold uppercase leading-[0.82] tracking-tight text-ink sm:text-8xl">{HEADLINE}</FxHeadline>
        <div className="mt-8 border-y-2 border-ink py-5">
          <p className="max-w-xl text-base font-medium leading-snug text-ink">{SUB}</p>
        </div>
        {/* hard-edged image slab — no rounding, thick ink border */}
        {heroImage && (
          <div className="relative mt-8 aspect-[21/9] w-full overflow-hidden border-2 border-ink">
            <div
              className={`absolute inset-0 bg-cover bg-center grayscale${mediaCls}`}
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            {/* hard primary scrim keeps the brand stamp at AA */}
            <div className="absolute inset-0 bg-primary/70 mix-blend-multiply" />
            <span className="absolute bottom-3 left-3 bg-ink px-2 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-bg">
              {brand}
            </span>
          </div>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <FxCta>
            <span className="inline-flex items-center gap-2 rounded-none bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-onPrimary shadow-[6px_6px_0_0_var(--color-ink)]">
              {copy.ctaPrimary} <ArrowRight size={16} />
            </span>
          </FxCta>
          <span className="inline-flex items-center gap-2 rounded-none border-2 border-ink px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink">
            <Play size={13} /> {copy.ctaSecondary}
          </span>
        </div>
      </motion.section>
    );
  }

  if (variant === 'chrome') {
    return (
      <motion.section variants={item} className="relative overflow-hidden px-8 py-24 text-center">
        {heroImage && (
          <>
            <div
              className={`absolute inset-0 bg-cover bg-center${mediaCls}`}
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            {/* dark-leaning scrim keeps the light onPrimary text at AA */}
            <div className="absolute inset-0 bg-ink/55" />
            <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
          </>
        )}
        <div
          className={`absolute inset-0 tk-mesh ${drift ? 'animate-gradient-drift' : ''} ${heroImage ? 'opacity-50' : ''}`}
        />
        <div className="pointer-events-none absolute -left-16 top-8 h-64 w-64 rounded-full tk-tint-accent blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-4 h-64 w-64 rounded-full tk-tint-secondary blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <span className="inline-block rounded-full bg-bg/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-onPrimary backdrop-blur">
            Now loading the future
          </span>
          <FxHeadline className="mt-6 font-heading text-5xl font-bold leading-[0.95] tracking-tight text-onPrimary drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)] sm:text-7xl">{HEADLINE}</FxHeadline>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-onPrimary/90">{SUB}</p>
          <div className="mt-8 flex justify-center">
            <FxCta>
              <span className="inline-flex items-center gap-2 rounded-full bg-bg px-7 py-3.5 text-sm font-semibold text-primary tk-shadow">
                {copy.ctaPrimary} <ArrowRight size={16} />
              </span>
            </FxCta>
          </div>
        </div>
      </motion.section>
    );
  }

  // typeonly (default)
  return (
    <motion.section variants={item} className="px-8 py-20">
      <Eyebrow />
      <FxHeadline className="mt-6 font-heading text-5xl font-semibold leading-[0.98] tracking-tight text-ink sm:text-7xl">{HEADLINE}</FxHeadline>
      <div className="mt-8 flex max-w-3xl items-end justify-between gap-8 border-t tk-line pt-6">
        <p className="max-w-md text-base leading-relaxed text-muted">{SUB}</p>
        <FxCta>
          <span className="hidden shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-onPrimary sm:inline-flex">
            {copy.ctaPrimary} <ArrowRight size={16} />
          </span>
        </FxCta>
      </div>
      {/* thin full-width image band — accent only, type stays dominant */}
      {heroImage && (
        <div className="relative mt-10 aspect-[32/9] w-full overflow-hidden rounded-2xl tk-shadow">
          <div
            className={`absolute inset-0 bg-cover bg-center${mediaCls}`}
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/45 via-transparent to-transparent" />
        </div>
      )}
    </motion.section>
  );
}
