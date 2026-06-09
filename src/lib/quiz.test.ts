import { describe, expect, it } from 'vitest';
import type { QuizAnswers } from './quiz';
import { recommendThemes } from './quiz';
import { paletteById } from '../data/palettes';

// Six personas from the improvement plan — every one must produce confident,
// on-taxonomy recommendations, not arbitrary picks.
const PERSONAS: { label: string; answers: QuizAnswers }[] = [
  {
    label: 'calm clinical practice',
    answers: {
      industry: 'healthcare',
      vibes: ['calm', 'trustworthy'],
      scheme: 'light',
      energy: 'subtle',
      density: 'minimal',
    },
  },
  {
    label: 'playful kids education',
    answers: {
      industry: 'education',
      vibes: ['playful', 'warm'],
      scheme: 'light',
      energy: 'expressive',
      density: 'expressive',
    },
  },
  {
    label: 'quiet luxury brand',
    answers: {
      industry: 'creative',
      vibes: ['premium', 'elegant'],
      scheme: 'dark',
      energy: 'subtle',
      density: 'minimal',
    },
  },
  {
    label: 'confident saas startup',
    answers: {
      industry: 'saas',
      vibes: ['professional', 'bold'],
      scheme: 'either',
      energy: 'standard',
      density: 'between',
    },
  },
  {
    label: 'bold creative studio',
    answers: {
      industry: 'creative',
      vibes: ['bold', 'energetic'],
      scheme: 'dark',
      energy: 'expressive',
      density: 'expressive',
    },
  },
  {
    label: 'warm organic wellness',
    answers: {
      industry: 'wellness',
      vibes: ['warm', 'organic'],
      scheme: 'light',
      energy: 'subtle',
      density: 'between',
    },
  },
];

describe('recommendThemes', () => {
  it.each(PERSONAS)('returns 3 scored, explained picks for the $label persona', ({ answers }) => {
    const recs = recommendThemes(answers);
    expect(recs).toHaveLength(3);
    // Sorted high-to-low, every pick actually matched something.
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i - 1]!.score).toBeGreaterThanOrEqual(recs[i]!.score);
    }
    expect(recs[0]!.score).toBeGreaterThan(0);
    expect(recs[0]!.reasons.length).toBeGreaterThan(0);
  });

  it('puts the requested industry or vibe in the top pick', () => {
    for (const { answers } of PERSONAS) {
      const top = recommendThemes(answers)[0]!;
      const industryHit = answers.industry && top.theme.industries.includes(answers.industry);
      const vibeHit = answers.vibes.some((v) => top.theme.moods.includes(v));
      expect(industryHit || vibeHit).toBe(true);
    }
  });

  it('respects a hard dark-scheme preference in the top pick', () => {
    const recs = recommendThemes({
      industry: null,
      vibes: ['premium'],
      scheme: 'dark',
      energy: 'subtle',
      density: 'between',
    });
    const topPalette = paletteById(recs[0]!.theme.paletteId)!;
    expect(topPalette.isDark).toBe(true);
  });

  it('vibe-only answers still produce useful results', () => {
    const recs = recommendThemes({
      industry: null,
      vibes: ['playful'],
      scheme: 'either',
      energy: 'standard',
      density: 'between',
    });
    expect(recs[0]!.theme.moods).toContain('playful');
  });
});
