import { describe, it, expect } from 'vitest';
import { spriteFrame, CHARACTER_CLIPS } from '../src/lib/character-sprites';
import manifest from '../public/pixel/manifest.json';
describe('pixel atlas boundaries', () => {
  it('keeps every loop and direction inside its own atlas row, including wraparound', () => {
    for (const [ci, clip] of CHARACTER_CLIPS.entries())
      for (let dir = 0; dir < 4; dir++) {
        for (const t of [0, 0.01, 0.3, 1, 2, 100]) {
          const p = spriteFrame(clip, dir, t);
          expect(p.y).toBe((ci * 4 + dir) * 64);
          expect(p.x).toBeGreaterThanOrEqual(0);
          expect(p.x).toBeLessThan(576);
        }
        expect(spriteFrame(clip, dir, manifest.clips[clip])).toEqual(spriteFrame(clip, dir, 0));
      }
    expect(spriteFrame('Walk', -1, 0).y).toBe(7 * 64);
  });
});
