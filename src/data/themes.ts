import type { Theme } from '../types';

// 8 themes — each ties a palette + font pairing + motion level into one click.
// industries/moods are derived from the underlying palette + fonts for filtering later.

export const themes: Theme[] = [
  {
    id: 'stillwater',
    name: 'Stillwater',
    tagline: 'Trustworthy, easy on the eyes',
    moods: ['trustworthy', 'calm'],
    industries: ['healthcare', 'professional'],
    paletteId: 'meridian',
    fontPairingId: 'clearwater',
    animationIntensity: 'subtle',
  },
  {
    id: 'vital',
    name: 'Vital',
    tagline: 'Contemporary clinical credibility',
    moods: ['trustworthy', 'bold'],
    industries: ['healthcare', 'saas'],
    paletteId: 'reef',
    fontPairingId: 'telemetry',
    animationIntensity: 'standard',
  },
  {
    id: 'haven',
    name: 'Haven',
    tagline: 'Soft, human, low-anxiety',
    moods: ['warm', 'organic', 'calm'],
    industries: ['wellness', 'nonprofit'],
    paletteId: 'verdant',
    fontPairingId: 'hearth',
    animationIntensity: 'subtle',
  },
  {
    id: 'quietude',
    name: 'Quietude',
    tagline: 'Gentle and fully accessible',
    moods: ['calm', 'warm'],
    industries: ['healthcare', 'education'],
    paletteId: 'halcyon',
    fontPairingId: 'daylight',
    animationIntensity: 'subtle',
  },
  {
    id: 'dispatch',
    name: 'Dispatch',
    tagline: 'Polished, content-forward',
    moods: ['elegant', 'warm', 'premium'],
    industries: ['creative', 'professional'],
    paletteId: 'mauveine',
    fontPairingId: 'folio',
    animationIntensity: 'standard',
  },
  {
    id: 'launchpad',
    name: 'Launchpad',
    tagline: 'Crisp product energy',
    moods: ['bold', 'premium'],
    industries: ['saas', 'professional'],
    paletteId: 'vesper',
    fontPairingId: 'vector',
    animationIntensity: 'standard',
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    tagline: 'High-end and sophisticated',
    moods: ['premium', 'bold'],
    industries: ['saas', 'creative'],
    paletteId: 'nocturne',
    fontPairingId: 'blueprint',
    animationIntensity: 'expressive',
  },
  {
    id: 'joyride',
    name: 'Joyride',
    tagline: 'Playful and energetic',
    moods: ['energetic', 'playful'],
    industries: ['creative', 'ecommerce'],
    paletteId: 'solstice',
    fontPairingId: 'megaphone',
    animationIntensity: 'expressive',
  },
];

export const themeById = (id: string): Theme | undefined =>
  themes.find((t) => t.id === id);
