import type { Mood, Palette } from '../types';

// =============================================================================
// Copy packs — the preview's voice. Six complete voices; the pack is chosen by
// the palette's moods (with a stable per-palette rotation) or pinned via the
// Voice control, so different boards genuinely SAY different things.
// Strings may contain {brand}; render through fill(). PricingTiers keeps its
// neutral copy (rarely enabled; pricing claims shouldn't shift voice).
// =============================================================================

export interface CopyPack {
  id: string;
  label: string;
  moods: Mood[];
  eyebrow: string;
  headline: string;
  sub: string;
  ctaPrimary: string;
  ctaSecondary: string;
  navLinks: [string, string, string];
  navCta: string;
  features: { title: string; body: string }[];
  statsTitle: string;
  stats: { value: string; label: string }[];
  testimonialsTitle: string;
  testimonials: { quote: string; name: string; detail: string }[];
  footerTagline: string;
  footerCta: string;
  marqueeWords: string[];
  miniBody: string;
  miniFeatures: [string, string];
}

export function fill(template: string, brand: string): string {
  return template.replaceAll('{brand}', brand);
}

export const COPY_PACKS: CopyPack[] = [
  {
    id: 'clinical-calm',
    label: 'Calm & clinical',
    moods: ['calm', 'trustworthy', 'professional', 'minimal'],
    eyebrow: 'Now accepting new clients',
    headline: 'Care that listens, built around you.',
    sub: 'Evidence-based, compassionate support from a team that treats you like a person — not a chart. From the first visit to lasting progress.',
    ctaPrimary: 'Get started',
    ctaSecondary: 'Meet the team',
    navLinks: ['Services', 'About', 'Resources'],
    navCta: 'Book a visit',
    features: [
      { title: 'Personalized care plans', body: 'Every plan is built around the person — goals, pace, and real life.' },
      { title: 'Telehealth that works', body: 'Secure video visits with the same clinicians you know and trust.' },
      { title: 'Privacy you can feel', body: 'Your information is protected at every step, by design.' },
    ],
    statsTitle: '{brand}, by the numbers',
    stats: [
      { value: '12k+', label: 'Sessions delivered' },
      { value: '98%', label: 'Would recommend' },
      { value: '4.9', label: 'Average rating' },
      { value: '24h', label: 'Avg. response time' },
    ],
    testimonialsTitle: 'What clients say about {brand}',
    testimonials: [
      { quote: 'For the first time, I felt like someone actually heard what we needed.', name: 'A. Rivera', detail: 'Parent of a client' },
      { quote: 'Clear plans, honest timelines, real progress. Exactly what we hoped for.', name: 'J. Okafor', detail: 'Client, 2 years' },
      { quote: 'The telehealth visits fit our life instead of fighting it.', name: 'M. Delgado', detail: 'Working parent' },
    ],
    footerTagline: 'Care that listens, built around you.',
    footerCta: 'Ready to get started?',
    marqueeWords: ['Speech therapy', 'Telehealth', 'Evaluations', 'Family coaching', 'Care plans'],
    miniBody: 'Evidence-based, compassionate support — from first visit to lasting progress.',
    miniFeatures: ['Personalized plans', 'Telehealth ready'],
  },
  {
    id: 'warm-community',
    label: 'Warm & human',
    moods: ['warm', 'organic'],
    eyebrow: 'Made by neighbors, for neighbors',
    headline: 'Come as you are. Leave a regular.',
    sub: 'A place that remembers your name, your order, and your kid’s soccer schedule. {brand} keeps it personal — every visit, every season.',
    ctaPrimary: 'Stop by',
    ctaSecondary: 'Our story',
    navLinks: ['Menu', 'Our story', 'Visit'],
    navCta: 'Reserve a table',
    features: [
      { title: 'Made fresh, made here', body: 'Small batches every morning — nothing sits, nothing ships.' },
      { title: 'A room that hugs back', body: 'Warm light, soft corners, and a seat that’s always yours.' },
      { title: 'Neighbors first', body: 'Local growers, local hires, local love. It all stays here.' },
    ],
    statsTitle: 'The {brand} family, so far',
    stats: [
      { value: '14', label: 'Years on this corner' },
      { value: '32', label: 'Local partners' },
      { value: '4.8', label: 'Average rating' },
      { value: '60k', label: 'Cups poured' },
    ],
    testimonialsTitle: 'Word around the neighborhood',
    testimonials: [
      { quote: 'It feels like Sunday at grandma’s — except the coffee is better.', name: 'T. Nguyen', detail: 'Regular since 2019' },
      { quote: 'They catered our wedding. People still talk about the bread.', name: 'S. Bauer', detail: 'Very happy customer' },
      { quote: 'The kind of place you bring people you love.', name: 'R. Holloway', detail: 'Local teacher' },
    ],
    footerTagline: 'Come as you are. Leave a regular.',
    footerCta: 'Save your seat',
    marqueeWords: ['Fresh daily', 'Local growers', 'Family recipes', 'Open late', 'Catering'],
    miniBody: 'A place that remembers your name — every visit, every season.',
    miniFeatures: ['Made fresh daily', 'Local partners'],
  },
  {
    id: 'bold-launch',
    label: 'Bold & punchy',
    moods: ['bold', 'energetic'],
    eyebrow: 'New season starts now',
    headline: 'Show up. Level up. Repeat.',
    sub: 'No fluff, no fine print — just a program that meets you at your edge and moves it. {brand} is where the work gets done.',
    ctaPrimary: 'Start today',
    ctaSecondary: 'See the program',
    navLinks: ['Programs', 'Coaches', 'Results'],
    navCta: 'Claim a spot',
    features: [
      { title: 'Programs with teeth', body: 'Progressive, measurable, and built to be finished — not browsed.' },
      { title: 'Coaches who notice', body: 'Form checks, real feedback, and a push exactly when you need it.' },
      { title: 'Proof over promises', body: 'Track every session. Watch the graph climb. Keep receipts.' },
    ],
    statsTitle: '{brand} in numbers',
    stats: [
      { value: '500+', label: 'Members strong' },
      { value: '92%', label: 'Hit their first goal' },
      { value: '6am', label: 'First class daily' },
      { value: '12', label: 'Programs running' },
    ],
    testimonialsTitle: 'Receipts from the floor',
    testimonials: [
      { quote: 'Six months in, I’m doing things I called impossible in January.', name: 'K. Brooks', detail: 'Member, year one' },
      { quote: 'The coaches remember your numbers better than you do.', name: 'D. Ortiz', detail: 'Competitor' },
      { quote: 'I came for the gym. I stayed for the standard.', name: 'L. Adeyemi', detail: 'Early member' },
    ],
    footerTagline: 'Show up. Level up. Repeat.',
    footerCta: 'Ready to put in the work?',
    marqueeWords: ['Strength', 'Conditioning', 'Mobility', 'Nutrition', 'Community'],
    miniBody: 'A program that meets you at your edge — and moves it.',
    miniFeatures: ['Real coaching', 'Tracked progress'],
  },
  {
    id: 'luxury-atelier',
    label: 'Quiet luxury',
    moods: ['premium', 'elegant'],
    eyebrow: 'By appointment',
    headline: 'Some things are still made slowly.',
    sub: 'Each piece from {brand} passes through eleven hands before it meets yours. We don’t do seasons. We do forever.',
    ctaPrimary: 'Request an appointment',
    ctaSecondary: 'The atelier',
    navLinks: ['Collection', 'Atelier', 'Journal'],
    navCta: 'Enquire',
    features: [
      { title: 'Material first', body: 'Sourced rarely, chosen once, kept for decades.' },
      { title: 'One maker, start to finish', body: 'A single artisan signs every piece that leaves the bench.' },
      { title: 'Quiet aftercare', body: 'Restoration and refitting, for as long as you own it.' },
    ],
    statsTitle: 'The {brand} standard',
    stats: [
      { value: '11', label: 'Hands per piece' },
      { value: '120h', label: 'Average build time' },
      { value: '3', label: 'Generations of makers' },
      { value: '1924', label: 'Founding year' },
    ],
    testimonialsTitle: 'In our clients’ words',
    testimonials: [
      { quote: 'It arrived in a box worth keeping. The piece itself — beyond words.', name: 'C. Marchetti', detail: 'Collector' },
      { quote: 'They refused to rush it. That’s exactly why I trust them.', name: 'H. Lindqvist', detail: 'Client since 2008' },
      { quote: 'You don’t buy it. You’re entrusted with it.', name: 'A. Beaumont', detail: 'Second-generation client' },
    ],
    footerTagline: 'Some things are still made slowly.',
    footerCta: 'Begin a conversation',
    marqueeWords: ['Hand-finished', 'Small batch', 'Bespoke', 'Heirloom grade', 'By appointment'],
    miniBody: 'Eleven hands before it meets yours. We don’t do seasons.',
    miniFeatures: ['Hand-finished', 'Bespoke fittings'],
  },
  {
    id: 'playful-studio',
    label: 'Playful & bright',
    moods: ['playful'],
    eyebrow: 'Warning: actual fun inside',
    headline: 'Learning that feels like recess.',
    sub: 'Big ideas, zero boring worksheets. {brand} turns "do I have to?" into "can we do it again?" — and yes, you can.',
    ctaPrimary: 'Join the fun',
    ctaSecondary: 'Peek inside',
    navLinks: ['Classes', 'Camps', 'Parents'],
    navCta: 'Save a spot',
    features: [
      { title: 'Games with sneaky learning', body: 'They think it’s play. We know it’s phonics. Everyone wins.' },
      { title: 'Small groups, big energy', body: 'Six kids max, one giant bucket of enthusiasm.' },
      { title: 'Progress parents can see', body: 'Weekly wins delivered to your phone, confetti included.' },
    ],
    statsTitle: 'The {brand} scoreboard',
    stats: [
      { value: '2k+', label: 'Happy graduates' },
      { value: '97%', label: 'Kids who ask to come back' },
      { value: '6', label: 'Kids per class, max' },
      { value: '0', label: 'Boring worksheets' },
    ],
    testimonialsTitle: 'Crayon-certified reviews',
    testimonials: [
      { quote: 'My daughter thinks Tuesday is the best day of the week now.', name: 'P. Whitfield', detail: 'Mom of a 6-year-old' },
      { quote: 'He reads to the dog every night. The dog seems thrilled.', name: 'G. Santos', detail: 'Dad of a new reader' },
      { quote: 'Somehow they made the letter R hilarious.', name: 'E. Kim', detail: 'Parent + fan' },
    ],
    footerTagline: 'Learning that feels like recess.',
    footerCta: 'Ready to play?',
    marqueeWords: ['Story time', 'Speech games', 'Art lab', 'Music makers', 'Camp weeks'],
    miniBody: 'Big ideas, zero boring worksheets — can we do it again?',
    miniFeatures: ['Small groups', 'Weekly wins'],
  },
  {
    id: 'editorial-studio',
    label: 'Editorial & sharp',
    moods: ['minimal', 'professional', 'bold'],
    eyebrow: 'Selected work, 2020–2026',
    headline: 'Work that argues for itself.',
    sub: '{brand} is an independent studio for brands with a point of view. Strategy first, decoration never. The portfolio does the talking.',
    ctaPrimary: 'See the work',
    ctaSecondary: 'Read the approach',
    navLinks: ['Work', 'Approach', 'Studio'],
    navCta: 'Start a project',
    features: [
      { title: 'Strategy before pixels', body: 'Every artifact traces back to a decision someone can defend.' },
      { title: 'Senior hands only', body: 'The people in the pitch are the people doing the work.' },
      { title: 'Built to be measured', body: 'We ship with the metrics attached. Pretty is not the KPI.' },
    ],
    statsTitle: '{brand}, on the record',
    stats: [
      { value: '48', label: 'Brands launched' },
      { value: '9', label: 'Industry awards' },
      { value: '83%', label: 'Clients who return' },
      { value: '2', label: 'Time zones, one studio' },
    ],
    testimonialsTitle: 'On working with {brand}',
    testimonials: [
      { quote: 'They told us no twice in the first meeting. Hire them.', name: 'V. Castellanos', detail: 'CMO, retail group' },
      { quote: 'The rebrand paid for itself before the year closed.', name: 'N. Adler', detail: 'Founder, fintech' },
      { quote: 'Rigor without the ego. Rare combination.', name: 'F. Mwangi', detail: 'Head of product' },
    ],
    footerTagline: 'Work that argues for itself.',
    footerCta: 'Have a brief?',
    marqueeWords: ['Identity', 'Editorial', 'Packaging', 'Digital', 'Motion'],
    miniBody: 'Strategy first, decoration never. The portfolio does the talking.',
    miniFeatures: ['Senior hands', 'Measured outcomes'],
  },
];

export const DEFAULT_PACK = COPY_PACKS[0]!;

const byId = new Map(COPY_PACKS.map((p) => [p.id, p]));
export const packById = (id: string): CopyPack | undefined => byId.get(id);

// Deterministic pack pick: best mood overlap wins; ties rotate by a stable
// hash of the palette id so equal-scoring palettes don't all sound alike.
export function packForPalette(palette: Palette): CopyPack {
  let best: CopyPack[] = [];
  let bestScore = -1;
  for (const pack of COPY_PACKS) {
    const score = pack.moods.filter((m) => palette.moods.includes(m)).length;
    if (score > bestScore) {
      bestScore = score;
      best = [pack];
    } else if (score === bestScore) {
      best.push(pack);
    }
  }
  if (bestScore <= 0) return DEFAULT_PACK;
  let hash = 0;
  for (const ch of palette.id) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return best[hash % best.length]!;
}
