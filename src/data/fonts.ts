import type { FontPairing } from '../types';

// 12 font pairings — all Google Fonts. Load only the weights listed.
// A single-family pairing (Daylight, Murmur) is a safe, fast clinical default.

export const fontPairings: FontPairing[] = [
  {
    id: 'masthead',
    name: 'Masthead',
    personality: 'Editorial, confident, has gravitas',
    goodFor: ['healthcare', 'professional'],
    heading: { family: 'Fraunces', source: 'google', weights: [400, 600] },
    body: { family: 'Inter', source: 'google', weights: [400, 500] },
  },
  {
    id: 'clearwater',
    name: 'Clearwater',
    personality: 'Friendly, geometric, highly legible',
    goodFor: ['healthcare', 'education'],
    heading: { family: 'Poppins', source: 'google', weights: [500, 600] },
    body: { family: 'Inter', source: 'google', weights: [400, 500] },
  },
  {
    id: 'telemetry',
    name: 'Telemetry',
    personality: 'Tech-forward, precise',
    goodFor: ['saas', 'healthcare'],
    heading: { family: 'Space Grotesk', source: 'google', weights: [500, 700] },
    body: { family: 'IBM Plex Sans', source: 'google', weights: [400, 500] },
  },
  {
    id: 'hearth',
    name: 'Hearth',
    personality: 'Soft contrast, approachable',
    goodFor: ['wellness', 'nonprofit'],
    heading: { family: 'DM Serif Display', source: 'google', weights: [400] },
    body: { family: 'DM Sans', source: 'google', weights: [400, 500] },
  },
  {
    id: 'vector',
    name: 'Vector',
    personality: 'Crisp, contemporary, product-y',
    goodFor: ['saas', 'professional'],
    heading: { family: 'Sora', source: 'google', weights: [600, 700] },
    body: { family: 'Inter', source: 'google', weights: [400, 500] },
  },
  {
    id: 'folio',
    name: 'Folio',
    personality: 'High-contrast, sophisticated',
    goodFor: ['creative', 'professional'],
    heading: { family: 'Playfair Display', source: 'google', weights: [500, 700] },
    body: { family: 'Source Sans 3', source: 'google', weights: [400, 600] },
  },
  {
    id: 'lullaby',
    name: 'Lullaby',
    personality: 'Gentle, friendly, low-anxiety',
    goodFor: ['wellness', 'education'],
    heading: { family: 'Quicksand', source: 'google', weights: [500, 700] },
    body: { family: 'Nunito Sans', source: 'google', weights: [400, 600] },
  },
  {
    id: 'daylight',
    name: 'Daylight',
    personality: 'Accessibility-optimized, calm',
    goodFor: ['healthcare', 'education'],
    heading: { family: 'Lexend', source: 'google', weights: [500, 700] },
    body: { family: 'Lexend', source: 'google', weights: [400] },
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    personality: 'Structured, bold weights, modern',
    goodFor: ['saas', 'creative'],
    heading: { family: 'Archivo', source: 'google', weights: [700, 900] },
    body: { family: 'Archivo', source: 'google', weights: [400] },
  },
  {
    id: 'murmur',
    name: 'Murmur',
    personality: 'Understated single-family classic',
    goodFor: ['professional', 'healthcare'],
    heading: { family: 'Libre Franklin', source: 'google', weights: [600, 700] },
    body: { family: 'Libre Franklin', source: 'google', weights: [400] },
  },
  {
    id: 'megaphone',
    name: 'Megaphone',
    personality: 'Distinctive, expressive headers',
    goodFor: ['creative', 'saas'],
    heading: { family: 'Bricolage Grotesque', source: 'google', weights: [700] },
    body: { family: 'Inter', source: 'google', weights: [400, 500] },
  },
  {
    id: 'heirloom',
    name: 'Heirloom',
    personality: 'Refined, literary, elegant',
    goodFor: ['creative', 'ecommerce'],
    heading: { family: 'Cormorant Garamond', source: 'google', weights: [500, 600] },
    body: { family: 'Mulish', source: 'google', weights: [400, 500] },
  },
];

export const fontPairingById = (id: string): FontPairing | undefined =>
  fontPairings.find((f) => f.id === id);
