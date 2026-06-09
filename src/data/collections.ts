// Curated collections — the browse mechanism for the Themes tab. Each groups a
// handful of themes by a shared sensibility. Curation, not filtering: every
// theme lives in at least one collection (some in two) and all stay reachable
// via the "All" chip.

export interface Collection {
  id: string;
  name: string;
  description: string;
  themeIds: string[];
}

export const collections: Collection[] = [
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Magazine-grade type and asymmetry.',
    themeIds: ['quietsignal', 'broadsheet', 'riso', 'maison', 'atelier', 'dispatch', 'claret', 'bisque'],
  },
  {
    id: 'bold-modern',
    name: 'Bold & Modern',
    description: 'Confident, high-contrast, unmistakable.',
    themeIds: ['limelight', 'brutalist', 'acidhouse', 'obsidian', 'keystone', 'vital', 'launchpad'],
  },
  {
    id: 'retro-future',
    name: 'Retro-Future',
    description: 'Neon, chrome, high energy.',
    themeIds: ['chromewave', 'vaporwave', 'voltage', 'inferno', 'onyx', 'joyride', 'sunbeam'],
  },
  {
    id: 'luxe',
    name: 'Luxe',
    description: 'Refined, dramatic, premium.',
    themeIds: ['maison', 'atelier', 'velvet', 'claret', 'bisque'],
  },
  {
    id: 'calm-clinical',
    name: 'Calm & Clinical',
    description: 'Calm, accessible, trustworthy.',
    themeIds: ['quietsignal', 'bluehour', 'stillwater', 'quietude', 'haven', 'meadow', 'frost', 'tundra'],
  },
  {
    id: 'warm-organic',
    name: 'Warm & Organic',
    description: 'Earthy, human, warm.',
    themeIds: ['terracotta', 'teahouse', 'caravan', 'sunbeam', 'haven'],
  },
  {
    id: 'kid-friendly',
    name: 'Kid-Friendly',
    description: 'Bright, playful, full of fun.',
    themeIds: ['sherbetstudio', 'sunnyside', 'bubblegum', 'crayon', 'joyride', 'sunbeam'],
  },
  {
    id: 'showstopper',
    name: 'Showstopper',
    description: 'Dramatic gradients and big display type.',
    themeIds: ['limelight', 'aurora', 'nebula', 'prism', 'chromewave', 'vaporwave', 'voltage'],
  },
  {
    id: 'seasonal',
    name: 'Seasonal',
    description: 'Warm holidays through the year.',
    themeIds: ['harvest', 'evergreen', 'bloom', 'terracotta', 'frost'],
  },
  {
    id: 'nature-spa',
    name: 'Nature & Spa',
    description: 'Botanical, serene, calming.',
    themeIds: ['sage', 'driftwood', 'lagoon', 'meadow', 'teahouse', 'quietude'],
  },
];

export const collectionById = (id: string): Collection | undefined =>
  collections.find((c) => c.id === id);
