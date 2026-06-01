import { Activity, Star } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { PreviewConfig } from '../../preview/previewConfig';
import { motionSpec } from '../../preview/motion';
import Hero from './Hero';
import FeatureCards from './FeatureCards';

interface SamplePageProps {
  brand: string;
  config: PreviewConfig;
}

const stats = [
  { value: '12k+', label: 'Sessions delivered' },
  { value: '98%', label: 'Would recommend' },
  { value: '4.9', label: 'Average rating' },
  { value: '24h', label: 'Avg. response' },
];

// Token-only, composable live page. The hero + card style come from config; the
// reveal stagger comes from config.motion (and respects prefers-reduced-motion).
// Keyed re-mounts replay the entrance, so changing theme/layout shows the motion.
export default function SamplePage({ brand, config }: SamplePageProps) {
  const reduced = useReducedMotion() ?? false;
  const spec = motionSpec(config.motion, reduced);

  return (
    <motion.div
      variants={spec.container}
      initial="hidden"
      animate="show"
      className="bg-bg text-ink font-body"
    >
      {/* nav */}
      <motion.header
        variants={spec.item}
        className="flex items-center justify-between border-b tk-line px-8 py-4"
      >
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-primary">
            <Activity size={16} className="text-onPrimary" />
          </span>
          <span className="font-heading text-lg font-semibold text-ink">{brand}</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-muted sm:flex">
          <span>Services</span>
          <span>About</span>
          <span>Resources</span>
          <span className="rounded-full bg-primary px-4 py-1.5 font-medium text-onPrimary">Book a visit</span>
        </nav>
      </motion.header>

      <Hero
        brand={brand}
        variant={config.hero}
        item={spec.item}
        expressive={config.motion === 'expressive'}
      />

      <FeatureCards cardStyle={config.cardStyle} item={spec.item} />

      {/* stats band */}
      <motion.section variants={spec.item} className="bg-primary px-8 py-10">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-heading text-3xl font-semibold text-onPrimary">{s.value}</div>
              <div className="mt-1 text-xs text-onPrimary/80">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* testimonial */}
      <motion.section variants={spec.item} className="px-8 py-14">
        <div className="mx-auto max-w-2xl rounded-3xl border tk-line bg-surface p-8 text-center tk-shadow">
          <div className="mb-3 flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className="fill-accent text-accent" />
            ))}
          </div>
          <p className="font-heading text-xl font-medium leading-relaxed text-ink">
            “I finally felt heard. The plan fit my life, and the progress was real.”
          </p>
          <p className="mt-4 text-sm text-muted">— A. Rivera, client since 2024</p>
        </div>
      </motion.section>

      {/* footer */}
      <motion.footer variants={spec.item} className="border-t tk-line bg-surface px-8 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary">
              <Activity size={13} className="text-onPrimary" />
            </span>
            <span className="font-heading text-sm font-semibold text-ink">{brand}</span>
          </div>
          <div className="flex gap-5 text-xs text-muted">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
            <span className="text-primary">Book a visit</span>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
}
