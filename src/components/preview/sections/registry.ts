import type { ComponentType } from 'react';
import PricingTiers from './PricingTiers';
import FaqAccordion from './FaqAccordion';
import LogoCloud from './LogoCloud';
import TestimonialSlider from './TestimonialSlider';
import FeatureColumns from './FeatureColumns';
import StatsBand from './StatsBand';
import BentoGrid from './BentoGrid';
import Zigzag from './Zigzag';

// Maps a layout preset's previewKey (see src/data/layouts.ts) to the token-only
// section component that renders it inside the themed preview frame.
export const sectionComponents: Record<string, ComponentType<{ brand?: string }>> = {
  'sec-pricing-tiers': PricingTiers,
  'sec-faq-accordion': FaqAccordion,
  'sec-logo-cloud': LogoCloud,
  'sec-testimonial-slider': TestimonialSlider,
  'sec-feature-cols': FeatureColumns,
  'sec-stats-band': StatsBand,
  'sec-bento': BentoGrid,
  'sec-zigzag': Zigzag,
};

export function sectionFor(previewKey: string): ComponentType<{ brand?: string }> | undefined {
  return sectionComponents[previewKey];
}
