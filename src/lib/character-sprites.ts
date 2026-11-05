import manifest from '../../public/painted/manifest.json';
export type CharacterClip = 'Idle' | 'Walk' | 'Wave' | 'Celebrate';
export const CHARACTER_CLIPS: CharacterClip[] = ['Idle', 'Walk', 'Wave', 'Celebrate'];
export const DIRECTIONS = manifest.directions;
export function spriteFrame(clip: CharacterClip, direction: number, elapsed: number) {
 const row = clip === 'Wave' ? 4 : clip === 'Celebrate' ? 5 : ((direction % 4) + 4) % 4;
 const frame = clip === 'Idle' ? 0 : Math.floor(Math.max(0, elapsed) / manifest.clips[clip] * 8) % 8;
 return { x: frame * 192, y: row * 256 };
}
