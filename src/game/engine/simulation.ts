import { GAME } from '../config';
import { chaseRoute, distance, moveTowards, type Point } from '../mechanics/chase';
import { canCollectLight, lightClues } from '../mechanics/lanternLight';
import { patternFor, judgeTap } from '../mechanics/pattern';
import type { Mechanic } from '../../data';
export interface Input {
  x: number;
  y: number;
  soft: boolean;
  tap?: number;
}
export interface Run {
  mechanic: Mechanic;
  seed: number;
  player: Point;
  spirit: Point;
  elapsed: number;
  remaining: number;
  phase: number;
  clues: number[];
  status: 'playing' | 'won' | 'timeout';
  routeIndex: number;
  cooldown: number;
  soft: boolean;
  notice: number;
  hold: number;
  round: number;
  pattern: number[];
  patternPhase: 'show' | 'input';
  patternClock: number;
  sequenceIndex: number;
  feedback: string;
  perfect: number;
  mistakes: number;
}
export function newRun(mechanic: Mechanic, seed: number, gentle = true): Run {
  return {
    mechanic,
    seed,
    player: { ...GAME.CAMP },
    spirit: chaseRoute(seed)[0],
    elapsed: 0,
    remaining: gentle ? 180 : GAME.EXPEDITION_TIME,
    phase: 0,
    clues: [],
    status: 'playing',
    routeIndex: 1,
    cooldown: 1.2,
    soft: false,
    notice: 0,
    hold: 0,
    round: 0,
    pattern: patternFor(seed, 0),
    patternPhase: 'show',
    patternClock: 0,
    sequenceIndex: 0,
    feedback:
      mechanic === 'chase'
        ? 'Catch up with the little borrower.'
        : mechanic === 'lantern-light'
          ? 'Find the three glows. Soften your lantern nearby.'
          : 'Watch the lights, then repeat their order.',
    perfect: 0,
    mistakes: 0,
  };
}
export function obstacles(seed: number): Point[] {
  return [
    { x: 335, y: 300 + (seed % 2) * 35 },
    { x: 620, y: 260 },
    { x: 525, y: 390 },
  ];
}
export function tick(s: Run, input: Input, delta: number): Run {
  if (s.status !== 'playing') return s;
  const dt = Math.max(0, Math.min(delta, 0.05)),
    n = {
      ...s,
      player: { ...s.player },
      spirit: { ...s.spirit },
      clues: [...s.clues],
      elapsed: s.elapsed + dt,
      remaining: Math.max(0, s.remaining - dt),
      cooldown: Math.max(0, s.cooldown - dt),
      soft: input.soft,
    };
  if (n.mechanic === 'pattern') {
    n.patternClock += dt;
    if (n.patternPhase === 'show' && n.patternClock > n.pattern.length * 0.65 + 0.5) {
      n.patternPhase = 'input';
      n.patternClock = 0;
      n.feedback = 'Your turn. Tap the same order. There is no rush.';
    }
    if (n.patternPhase === 'input' && input.tap !== undefined) {
      const result = judgeTap(n.pattern[n.sequenceIndex], input.tap, n.patternClock);
      if (result.correct) {
        n.sequenceIndex++;
        if (result.onBeat) n.perfect++;
        n.feedback = 'That’s it. Keep the little lights moving.';
        if (n.sequenceIndex === n.pattern.length) {
          n.round++;
          if (n.round === 3) {
            n.status = 'won';
            n.feedback = 'A familiar recording, found at last.';
          } else {
            n.pattern = patternFor(n.seed, n.round);
            n.sequenceIndex = 0;
            n.patternPhase = 'show';
            n.patternClock = -0.6;
            n.feedback = 'Lovely. Watch the next little sequence.';
          }
        }
      } else {
        n.mistakes++;
        n.sequenceIndex = 0;
        n.patternPhase = 'show';
        n.patternClock = -0.5;
        n.feedback = 'A happy wrong turn. Watch it once more.';
      }
    }
  } else {
    const len = Math.hypot(input.x, input.y),
      speed = GAME.PLAYER_SPEED * (input.soft ? 0.65 : 1);
    if (len) {
      const x = Math.max(35, Math.min(925, n.player.x + (input.x / len) * speed * dt)),
        y = Math.max(55, Math.min(550, n.player.y + (input.y / len) * speed * dt));
      const blocks = obstacles(n.seed);
      if (!blocks.some((o) => distance(o, { x, y: n.player.y }) < 48)) n.player.x = x;
      if (!blocks.some((o) => distance(o, { x: n.player.x, y }) < 48)) n.player.y = y;
    }
    if (n.mechanic === 'chase' && n.phase < 3) {
      const route = chaseRoute(n.seed);
      if (n.cooldown === 0) {
        const turnDistance = distance(n.spirit, route[n.routeIndex]);
        n.spirit = moveTowards(
          n.spirit,
          route[n.routeIndex],
          GAME.SPIRIT_SPEED * (turnDistance < 70 ? 0.55 : 1) * (1 + n.phase * 0.02),
          dt,
        );
        if (turnDistance < 12) n.routeIndex = (n.routeIndex + 1) % route.length;
      }
      if (distance(n.player, n.spirit) < 48) {
        n.phase++;
        n.clues.push(n.phase);
        n.cooldown = 1.2;
        n.spirit = { ...route[(n.phase + 1) % route.length] };
        n.routeIndex = (n.phase + 2) % route.length;
        n.feedback =
          n.phase === 3
            ? 'All three pieces recovered. Bring them to the green camp.'
            : `Piece ${n.phase}/3! “I was just keeping it dry!”`;
      }
    }
    if (n.mechanic === 'lantern-light') {
      const clues = lightClues(n.seed),
        near = clues.findIndex(
          (p, i) => !n.clues.includes(i) && canCollectLight(n.player, p, input.soft),
        );
      const direct = clues.some(
        (p, i) => !n.clues.includes(i) && distance(n.player, p) < GAME.LIGHT_RADIUS && !input.soft,
      );
      n.notice = Math.max(0, Math.min(1, n.notice + (direct ? dt * 1.8 : -dt * 2)));
      n.hold = near >= 0 ? n.hold + dt : 0;
      if (direct) n.feedback = 'A little too bright! Hold Shift / Soften light near the glow.';
      else if (input.soft)
        n.feedback = 'A soft glow feels welcoming. Stay beside the clue for a moment.';
      if (n.hold >= 0.65 && near >= 0) {
        n.clues.push(near);
        n.hold = 0;
        n.feedback =
          n.clues.length === 3
            ? 'Three clues found. Follow the green glow home.'
            : `${n.clues.length}/3 clues. The shy visitor gives you a little wave.`;
      }
    }
    if (n.clues.length === 3 && distance(n.player, GAME.CAMP) < 58) n.status = 'won';
  }
  if (n.status === 'playing' && n.remaining === 0) n.status = 'timeout';
  return n;
}
