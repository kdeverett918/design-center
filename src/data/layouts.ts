import type { LayoutPreset } from '../types';

// Pre-made "design ideas" clients pick from. previewKey maps to a sample
// component rendered in the preview (wired interactively in a later phase).

export const layoutPresets: LayoutPreset[] = [
  // Heroes
  { id: 'hero-split', name: 'Split Hero', type: 'hero', description: 'Text left, visual right', previewKey: 'hero-split' },
  { id: 'hero-centered', name: 'Centered Hero', type: 'hero', description: 'Centered headline + CTA', previewKey: 'hero-centered' },
  { id: 'hero-fullbleed', name: 'Full-bleed Hero', type: 'hero', description: 'Image with overlay', previewKey: 'hero-fullbleed' },
  { id: 'hero-gradient-mesh', name: 'Gradient Mesh Hero', type: 'hero', description: 'Soft animated gradient', previewKey: 'hero-gradient-mesh' },
  { id: 'hero-typeonly', name: 'Type-only Hero', type: 'hero', description: 'Large type, no image', previewKey: 'hero-typeonly' },

  // Nav
  { id: 'nav-sticky-clear', name: 'Sticky Clear Nav', type: 'nav', description: 'Transparent → solid on scroll', previewKey: 'nav-sticky-clear' },
  { id: 'nav-centered-logo', name: 'Centered Logo Nav', type: 'nav', description: 'Logo centered, links flanking', previewKey: 'nav-centered-logo' },
  { id: 'nav-sidebar', name: 'Sidebar Nav', type: 'nav', description: 'For portals & dashboards', previewKey: 'nav-sidebar' },

  // Cards
  { id: 'card-elevated', name: 'Elevated Card', type: 'card', description: 'Soft shadow', previewKey: 'card-elevated' },
  { id: 'card-bordered', name: 'Bordered Card', type: 'card', description: 'Hairline border', previewKey: 'card-bordered' },
  { id: 'card-glass', name: 'Glass Card', type: 'card', description: 'Frosted glass', previewKey: 'card-glass' },
  { id: 'card-accentbar', name: 'Accent-bar Card', type: 'card', description: 'Colored top edge', previewKey: 'card-accentbar' },

  // Sections
  { id: 'sec-zigzag', name: 'Zigzag', type: 'section', description: 'Alternating image/text', previewKey: 'sec-zigzag' },
  { id: 'sec-bento', name: 'Bento Grid', type: 'section', description: 'Mixed-size grid', previewKey: 'sec-bento' },
  { id: 'sec-feature-cols', name: 'Feature Columns', type: 'section', description: '3-up icon columns', previewKey: 'sec-feature-cols' },
  { id: 'sec-stats-band', name: 'Stats Band', type: 'section', description: 'Big numbers row', previewKey: 'sec-stats-band' },
  { id: 'sec-logo-cloud', name: 'Logo Cloud', type: 'section', description: 'Trusted-by logos', previewKey: 'sec-logo-cloud' },
  { id: 'sec-testimonial-slider', name: 'Testimonial Slider', type: 'section', description: 'Rotating quotes', previewKey: 'sec-testimonial-slider' },
  { id: 'sec-faq-accordion', name: 'FAQ Accordion', type: 'section', description: 'Expandable Q&A', previewKey: 'sec-faq-accordion' },
  { id: 'sec-pricing-tiers', name: 'Pricing Tiers', type: 'section', description: 'Side-by-side plans', previewKey: 'sec-pricing-tiers' },

  // Footers
  { id: 'footer-mega', name: 'Mega Footer', type: 'footer', description: 'Multi-column', previewKey: 'footer-mega' },
  { id: 'footer-minimal', name: 'Minimal Footer', type: 'footer', description: 'Centered, single row', previewKey: 'footer-minimal' },
  { id: 'footer-cta-band', name: 'CTA-band Footer', type: 'footer', description: 'Big CTA above links', previewKey: 'footer-cta-band' },
];

export const layoutById = (id: string): LayoutPreset | undefined =>
  layoutPresets.find((l) => l.id === id);
