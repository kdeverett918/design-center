import { describe, expect, it } from 'vitest';
import { decodeShortlist, encodeShortlist } from './shareShortlist';

describe('shortlist share codec', () => {
  it('round-trips keys and notes', () => {
    const entries = [
      { key: 'theme:obsidian', note: '' },
      { key: 'palette:reef', note: 'warmer please' },
    ];
    const decoded = decodeShortlist(encodeShortlist(entries));
    expect(decoded).not.toBeNull();
    expect(decoded!.keys).toEqual(['theme:obsidian', 'palette:reef']);
    expect(decoded!.notes).toEqual({ 'palette:reef': 'warmer please' });
  });

  it('drops keys that no longer resolve and rejects empty results', () => {
    const token = encodeShortlist([
      { key: 'theme:does-not-exist', note: '' },
      { key: 'palette:reef', note: '' },
    ]);
    expect(decodeShortlist(token)!.keys).toEqual(['palette:reef']);

    const allBad = encodeShortlist([{ key: 'nope:nothing', note: '' }]);
    expect(decodeShortlist(allBad)).toBeNull();
  });

  it('rejects garbage tokens', () => {
    expect(decodeShortlist(null)).toBeNull();
    expect(decodeShortlist('not-a-token')).toBeNull();
  });
});
