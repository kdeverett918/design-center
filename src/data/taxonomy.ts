import type { Industry, Mood } from '../types';

// The vocabulary used for filtering. Order is intentional (calm/clinical first).
export const MOODS: Mood[] = [
  'trustworthy',
  'calm',
  'warm',
  'organic',
  'elegant',
  'premium',
  'minimal',
  'professional',
  'bold',
  'playful',
  'energetic',
];

export const INDUSTRIES: Industry[] = [
  'healthcare',
  'wellness',
  'education',
  'professional',
  'saas',
  'creative',
  'ecommerce',
  'nonprofit',
];

const overlaps = <T>(a: readonly T[], b: readonly T[]) => a.some((x) => b.includes(x));

// Predicates: an empty selection means "no constraint".
export function matchMoods(itemMoods: readonly Mood[], selected: readonly Mood[]): boolean {
  return selected.length === 0 || overlaps(itemMoods, selected);
}

export function matchIndustries(
  itemIndustries: readonly Industry[],
  selected: readonly Industry[],
): boolean {
  return selected.length === 0 || overlaps(itemIndustries, selected);
}
