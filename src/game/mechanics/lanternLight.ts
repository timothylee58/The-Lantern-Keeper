import { distance, type Point } from './chase';
import { GAME } from '../config';
export function visibleClue(player: Point, clue: Point, soft: boolean) {
  return distance(player, clue) < GAME.LIGHT_RADIUS * (soft ? 0.8 : 1);
}
export function canCollectLight(player: Point, clue: Point, soft: boolean) {
  return soft && distance(player, clue) < 45;
}
export function lightClues(seed: number): Point[] {
  const d = (seed % 3) * 20;
  return [
    { x: 230 + d, y: 175 },
    { x: 510, y: 115 + d },
    { x: 765 - d, y: 360 },
  ];
}
