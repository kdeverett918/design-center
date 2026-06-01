import { createElement } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { PreviewConfig } from '../../preview/previewConfig';
import { motionSpec } from '../../preview/motion';
import Hero from './Hero';
import FeatureCards from './FeatureCards';
import Nav from './Nav';
import Footer from './Footer';
import { sectionFor } from './sections/registry';

interface SamplePageProps {
  brand: string;
  config: PreviewConfig;
}

// Token-only, fully composable live page: nav + hero + feature cards + the
// chosen sections + footer all come from config. The reveal stagger comes from
// config.motion (respecting prefers-reduced-motion). Keyed re-mounts replay it.
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
      <motion.div variants={spec.item}>
        <Nav variant={config.nav} brand={brand} />
      </motion.div>

      <Hero
        brand={brand}
        variant={config.hero}
        item={spec.item}
        expressive={config.motion === 'expressive'}
      />

      <FeatureCards cardStyle={config.cardStyle} item={spec.item} />

      {config.sections.map((key) => {
        const Section = sectionFor(key);
        if (!Section) return null;
        return (
          <motion.div key={key} variants={spec.item}>
            {createElement(Section, { brand })}
          </motion.div>
        );
      })}

      <motion.div variants={spec.item}>
        <Footer variant={config.footer} brand={brand} />
      </motion.div>
    </motion.div>
  );
}
