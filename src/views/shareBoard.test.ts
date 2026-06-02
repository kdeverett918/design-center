import { describe, expect, it } from 'vitest';
import { decodeBoard, encodeBoard } from './shareBoard';
import type { ShareBoard } from './shareBoard';
import { configForTheme, DEFAULT_PREVIEW_CONFIG } from '../preview/previewConfig';
import { themes } from '../data/themes';

const board: ShareBoard = {
  paletteId: 'nocturne',
  fontId: 'telemetry',
  config: configForTheme(themes[0]!),
  brand: 'Acme Care',
  notes: 'warm but clinical',
  animationIds: ['fade-up', 'hover-lift'],
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

  it('round-trips the chosen animationIds', () => {
    const token = encodeBoard(board);
    expect(decodeBoard(token)?.animationIds).toEqual(['fade-up', 'hover-lift']);
  });

  it('defaults animationIds to [] for older tokens missing the field', () => {
    // Encode a board, then strip animationIds to simulate a pre-animations token.
    const { animationIds: _omit, ...legacy } = board;
    void _omit;
    const token = encodeBoard(legacy as ShareBoard);
    expect(decodeBoard(token)?.animationIds).toEqual([]);
  });

  it('sanitizes a partial/tampered config back to safe defaults', () => {
    // A legacy or tampered link with an incomplete + invalid config must not
    // seed bad state into the live preview.
    const token = encodeBoard({
      ...board,
      config: { hero: 'not-a-hero', motion: 'wild' } as unknown as ShareBoard['config'],
    });
    expect(decodeBoard(token)?.config).toEqual(DEFAULT_PREVIEW_CONFIG);
  });

  it('drops animationIds that no longer resolve', () => {
    const token = encodeBoard({
      ...board,
      animationIds: ['fade-up', 'totally-fake', 'hover-lift'],
    });
    expect(decodeBoard(token)?.animationIds).toEqual(['fade-up', 'hover-lift']);
  });
});
