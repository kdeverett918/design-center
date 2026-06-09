import { describe, expect, it } from 'vitest';
import { matchesQuery } from './searchFilter';

describe('matchesQuery', () => {
  it('matches everything on an empty or whitespace query', () => {
    expect(matchesQuery(['Meridian', 'calm'], '')).toBe(true);
    expect(matchesQuery(['Meridian', 'calm'], '   ')).toBe(true);
  });

  it('is case-insensitive and matches substrings', () => {
    expect(matchesQuery(['Meridian', 'trustworthy calm'], 'MERI')).toBe(true);
    expect(matchesQuery(['Meridian'], 'idian')).toBe(true);
  });

  it('requires every token to match (AND semantics)', () => {
    expect(matchesQuery(['Meridian', 'trustworthy calm'], 'calm meri')).toBe(true);
    expect(matchesQuery(['Meridian', 'trustworthy calm'], 'calm neon')).toBe(false);
  });

  it('ignores undefined parts', () => {
    expect(matchesQuery([undefined, 'Lagoon'], 'lagoon')).toBe(true);
    expect(matchesQuery([undefined], 'lagoon')).toBe(false);
  });
});
