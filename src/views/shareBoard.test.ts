import { describe, expect, it } from 'vitest';
import { decodeBoard, encodeBoard } from './shareBoard';
import type { ShareBoard } from './shareBoard';
import { configForTheme } from '../preview/previewConfig';
import { themes } from '../data/themes';

const board: ShareBoard = {
  paletteId: 'nocturne',
  fontId: 'telemetry',
  config: configForTheme(themes[0]!),
  brand: 'Acme Care',
  notes: 'warm but clinical',
};

describe('shareBoard', () => {
  it('round-trips a board through a URL-safe token', () => {
    const token = encodeBoard(board);
    expect(token).toBeTruthy();
    expect(token).not.toMatch(/[+/=]/); // url-safe (no +, /, =)
    expect(decodeBoard(token)).toEqual(board);
  });

  it('returns null for missing, corrupt, or stale tokens', () => {
    expect(decodeBoard(null)).toBeNull();
    expect(decodeBoard('')).toBeNull();
    expect(decodeBoard('@@not-valid@@')).toBeNull();
    // valid encoding but referencing a palette that no longer exists
    const stale = encodeBoard({ ...board, paletteId: 'does-not-exist' });
    expect(decodeBoard(stale)).toBeNull();
  });
});
