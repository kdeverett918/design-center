import type { AnimationIntensity, Industry, Mood, Theme } from '../types';
import { paletteById } from '../data/palettes';
import { themes } from '../data/themes';

// =============================================================================
// Guided mode — pure client-side scoring of quiz answers against the library's
// mood/industry tags. No AI call: the taxonomy is the recommendation engine.
// =============================================================================

export type SchemePreference = 'light' | 'dark' | 'either';
export type DensityPreference = 'minimal' | 'expressive' | 'between';

export interface QuizAnswers {
  /** null = "something else / skip" */
  industry: Industry | null;
  /** up to 3 vibe words */
  vibes: Mood[];
  scheme: SchemePreference;
  energy: AnimationIntensity;
  density: DensityPreference;
}

export interface Recommendation {
  theme: Theme;
  score: number;
  /** short human phrases explaining the match, in answer order */
  reasons: string[];
}

// Moods that read as "decorative & expressive" for the density question.
const EXPRESSIVE_MOODS: Mood[] = ['bold', 'playful', 'energetic'];

const ENERGY_LABEL: Record<AnimationIntensity, string> = {
  subtle: 'motion stays calm and quiet',
  standard: 'motion feels balanced',
  expressive: 'motion brings real energy',
};

function scoreTheme(theme: Theme, answers: QuizAnswers): Recommendation {
  let score = 0;
  const reasons: string[] = [];
  const palette = paletteById(theme.paletteId);

  if (answers.industry && theme.industries.includes(answers.industry)) {
    score += 3;
    reasons.push(`built with ${answers.industry} in mind`);
  }

  // Vibe words are the user's most deliberate signal — weight them so a single
  // chosen vibe always beats an incidental motion/scheme coincidence.
  const vibeHits = answers.vibes.filter((v) => theme.moods.includes(v));
  if (vibeHits.length > 0) {
    score += vibeHits.length * 3;
    reasons.push(`feels ${vibeHits.join(' + ')}`);
  }

  if (palette && answers.scheme !== 'either') {
    if (answers.scheme === 'dark' && palette.isDark) {
      score += 2;
      reasons.push('dark and dramatic, like you asked');
    } else if (answers.scheme === 'light' && !palette.isDark) {
      score += 2;
      reasons.push('bright and airy, like you asked');
    }
  }

  if (theme.animationIntensity === answers.energy) {
    score += 2;
    reasons.push(ENERGY_LABEL[answers.energy]);
  } else if (theme.animationIntensity !== 'expressive' && answers.energy !== 'expressive') {
    // subtle ↔ standard are close neighbours; near-miss still counts a little.
    score += 1;
  }

  if (answers.density === 'minimal' && theme.moods.includes('minimal')) {
    score += 1;
    reasons.push('clean and uncluttered');
  } else if (
    answers.density === 'expressive' &&
    EXPRESSIVE_MOODS.some((m) => theme.moods.includes(m))
  ) {
    score += 1;
    reasons.push('decorative where it counts');
  }

  return { theme, score, reasons };
}

/**
 * Score every theme and return the top picks (default 3), highest first.
 * Ties break toward themes with more reasons (richer matches read better).
 */
export function recommendThemes(
  answers: QuizAnswers,
  pool: readonly Theme[] = themes,
  limit = 3,
): Recommendation[] {
  return pool
    .map((t) => scoreTheme(t, answers))
    .sort((a, b) => b.score - a.score || b.reasons.length - a.reasons.length)
    .slice(0, limit);
}
