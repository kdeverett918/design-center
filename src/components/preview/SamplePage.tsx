import { createElement } from 'react';
import { m as motion, useReducedMotion } from 'framer-motion';
import type { PreviewConfig } from '../../preview/previewConfig';
import { motionSpec } from '../../preview/motion';
import { fxItemVariants, useFx } from '../../preview/effectsRuntime';
import FxMarqueeBand from './effects/FxMarqueeBand';
import Hero from './Hero';
import FeatureCards from './FeatureCards';
import Nav from './Nav';
import Footer from './Footer';
import { sectionFor } from './sections/registry';

interface SamplePageProps {
  brand: string;
  config: PreviewConfig;
  /** Optional AI-generated hero background (themed previews only). */
  heroImage?: string;
}

// Token-only, fully composable live page: nav + hero + feature cards + the
// chosen sections + footer all come from config. The reveal stagger comes from
// config.motion (respecting prefers-reduced-motion); selected effects override
// entrances and add scroll/marquee behavior. Keyed re-mounts replay it.
export default function SamplePage({ brand, config, heroImage }: SamplePageProps) {
  const reduced = useReducedMotion() ?? false;
  const fx = useFx();
  const spec = motionSpec(config.motion, reduced);
  const item = fxItemVariants(fx, spec.item);
  const container = fx.staggerBoost
    ? { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } } }
    : spec.container;
  // scroll-reveal: below-fold blocks animate when scrolled into view instead of
  // all at once on mount (the IO respects the DeviceFrame's clipped scroll pane).
  const reveal = fx.scrollReveal
    ? { initial: 'hidden' as const, whileInView: 'show' as const, viewport: { once: true, amount: 0.2 } }
    : {};

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="bg-bg text-ink font-body"
    >
      <motion.div variants={item}>
        <Nav variant={config.nav} brand={brand} />
      </motion.div>

      <Hero
        brand={brand}
        variant={config.hero}
        item={item}
        expressive={config.motion === 'expressive'}
        heroImage={heroImage}
      />

      {fx.marqueeBand && <FxMarqueeBand mode={fx.marqueeBand} />}

      {/* passthrough wrapper: only overrides the trigger when scroll-reveal is on
          (FeatureCards' own section carries the item variants) */}
      <motion.div {...reveal}>
        <FeatureCards cardStyle={config.cardStyle} item={item} />
      </motion.div>

      {config.sections.map((key) => {
        const Section = sectionFor(key);
        if (!Section) return null;
        return (
          <motion.div key={key} variants={item} {...reveal}>
            {createElement(Section, { brand })}
          </motion.div>
        );
      })}

      <motion.div variants={item} {...reveal}>
        <Footer variant={config.footer} brand={brand} />
      </motion.div>
    </motion.div>
  );
}
