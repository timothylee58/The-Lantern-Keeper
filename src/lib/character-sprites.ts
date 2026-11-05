import manifest from '../../public/pixel/manifest.json';
export type CharacterClip = 'Idle' | 'Walk' | 'Wave' | 'Celebrate';
export const CHARACTER_CLIPS: CharacterClip[] = ['Idle', 'Walk', 'Wave', 'Celebrate'];
export const DIRECTIONS = manifest.directions;
export function spriteFrame(clip: CharacterClip, direction: number, elapsed: number) {
  return {
    x: (Math.floor((Math.max(0, elapsed) / manifest.clips[clip]) * 12) % 12) * 48,
    y: (CHARACTER_CLIPS.indexOf(clip) * 4 + (((direction % 4) + 4) % 4)) * 64,
  };
}
