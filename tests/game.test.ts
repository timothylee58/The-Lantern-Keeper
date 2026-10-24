import { describe, it, expect } from 'vitest';
import { NEIGHBORS, filterSpirits } from '../src/data';
import { newRun, tick, obstacles, type Run } from '../src/game/engine/simulation';
import { distance, type Point } from '../src/game/mechanics/chase';
import { lightClues } from '../src/game/mechanics/lanternLight';
import { GAME } from '../src/game/config';
import { finishNeighbor, initialJournal, sanitizeJournal } from '../src/store/game';
function nextWaypoint(s: Run, target: Point): Point {
  const size = 30,
    cols = 31,
    rows = 18,
    key = (x: number, y: number) => y * cols + x,
    toCell = (p: Point) => ({
      x: Math.max(0, Math.min(cols - 1, Math.round((p.x - 30) / size))),
      y: Math.max(0, Math.min(rows - 1, Math.round((p.y - 45) / size))),
    }),
    point = (x: number, y: number) => ({ x: 30 + x * size, y: 45 + y * size });
  const start = toCell(s.player),
    end = toCell(target),
    queue = [start],
    visited = new Set([key(start.x, start.y)]),
    parents = new Map<number, number>();
  let found = false;
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    if (p.x === end.x && p.y === end.y) {
      found = true;
      break;
    }
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const x = p.x + dx,
        y = p.y + dy,
        k = key(x, y);
      if (
        x < 0 ||
        x >= cols ||
        y < 0 ||
        y >= rows ||
        visited.has(k) ||
        obstacles(s.seed).some((o) => distance(o, point(x, y)) < 70)
      )
        continue;
      visited.add(k);
      parents.set(k, key(p.x, p.y));
      queue.push({ x, y });
    }
  }
  if (!found) return target;
  let at = key(end.x, end.y),
    parent = parents.get(at);
  if (at === key(start.x, start.y)) return target;
  while (parent !== undefined && parent !== key(start.x, start.y)) {
    at = parent;
    parent = parents.get(at);
  }
  return point(at % cols, Math.floor(at / cols));
}
function completeRun(mechanic: Run['mechanic'], seed: number) {
  let s = newRun(mechanic, seed);
  let target: Point = { ...s.player };
  for (let f = 0; f < 7200 && s.status === 'playing'; f++) {
    if (mechanic === 'pattern') {
      s = tick(
        s,
        {
          x: 0,
          y: 0,
          soft: false,
          tap: s.patternPhase === 'input' ? s.pattern[s.sequenceIndex] : undefined,
        },
        0.05,
      );
      continue;
    }
    const destination =
      s.clues.length === 3
        ? GAME.CAMP
        : mechanic === 'chase'
          ? s.spirit
          : lightClues(seed).find((_, i) => !s.clues.includes(i))!;
    if (f % 4 === 0 || distance(s.player, target) < 12) target = nextWaypoint(s, destination);
    const near = distance(s.player, destination) < 35,
      soft = mechanic === 'lantern-light' && near;
    s = tick(
      s,
      {
        x: near && soft ? 0 : target.x - s.player.x,
        y: near && soft ? 0 : target.y - s.player.y,
        soft,
      },
      0.05,
    );
  }
  return s;
}
describe('eight complete expeditions', () => {
  for (const n of NEIGHBORS)
    it(`${n.name}: ${n.mechanic} can be completed with movement and game inputs`, () => {
      const run = completeRun(n.mechanic, n.seed);
      expect(
        run.status,
        JSON.stringify({
          player: run.player,
          spirit: run.spirit,
          clues: run.clues,
          time: run.remaining,
        }),
      ).toBe('won');
      expect(run.elapsed).toBeLessThan(180);
    });
});
describe('game rules', () => {
  it('requires soft light to collect a shy clue', () => {
    let s = { ...newRun('lantern-light', 2), player: lightClues(2)[0] };
    for (let i = 0; i < 25; i++) s = tick(s, { x: 0, y: 0, soft: false }, 0.05);
    expect(s.clues).toHaveLength(0);
    for (let i = 0; i < 15; i++) s = tick(s, { x: 0, y: 0, soft: true }, 0.05);
    expect(s.clues).toEqual([0]);
  });
  it('keeps diagonal movement at the same speed', () => {
    const a = tick(newRun('chase', 1), { x: 1, y: 0, soft: false }, 0.05),
      b = tick(newRun('chase', 1), { x: 1, y: -1, soft: false }, 0.05);
    expect(distance(a.player, GAME.CAMP)).toBeCloseTo(distance(b.player, GAME.CAMP));
  });
  it('replays a pattern after a mistake without losing a previous round', () => {
    let s = newRun('pattern', 3);
    s = { ...s, round: 1, patternPhase: 'input', sequenceIndex: 1 };
    s = tick(s, { x: 0, y: 0, soft: false, tap: (s.pattern[1] + 1) % 4 }, 0.05);
    expect(s.round).toBe(1);
    expect(s.patternPhase).toBe('show');
    expect(s.mistakes).toBe(1);
  });
  it('ends the timer but leaves completed state unchanged', () => {
    const s = tick({ ...newRun('chase', 1), remaining: 0.01 }, { x: 0, y: 0, soft: false }, 0.05);
    expect(s.status).toBe('timeout');
    expect(tick(s, { x: 1, y: 0, soft: false }, 0.05)).toBe(s);
  });
  it('does not let the keeper walk through shelter obstacles', () => {
    const p = obstacles(1)[0];
    let s = { ...newRun('chase', 1), player: { x: p.x - 70, y: p.y } };
    for (let i = 0; i < 30; i++) s = tick(s, { x: 1, y: 0, soft: false }, 0.05);
    expect(s.player.x).toBeLessThan(p.x - 47);
  });
});
describe('journal and lore', () => {
  it('rewards each neighbor once and preserves independent encounters', () => {
    let s = finishNeighbor(initialJournal, 'mei-lin');
    s = finishNeighbor(s, 'mei-lin');
    expect(s.neighborsHelped).toEqual(['mei-lin']);
    expect(s.codexUnlocked).toEqual(['toyol']);
    expect(s.lanternsLit).toEqual(['mei-lin']);
    expect(s.runs).toBe(2);
    expect(s.neighborsHelped).not.toContain('dina');
  });
  it('all neighbors lead to eight lanterns and six spirit types', () => {
    const s = NEIGHBORS.reduce((state, n) => finishNeighbor(state, n.id), initialJournal);
    expect(s.lanternsLit).toHaveLength(8);
    expect(s.codexUnlocked).toHaveLength(6);
  });
  it('validates imports and derives lanterns from real completed neighbors', () => {
    const s = sanitizeJournal({
      name: 'Ari',
      neighborsHelped: ['suri', 'suri', 'fake'],
      lanternsLit: ['all'],
      codexUnlocked: ['fake'],
      runs: -10,
      eggFound: true,
    });
    expect(s.lanternsLit).toEqual(['suri']);
    expect(s.codexUnlocked).toEqual(['pocong']);
    expect(s.runs).toBe(0);
    expect(s.eggFound).toBe(true);
  });
  it('migrates v1 collected records without inventing neighbor completion', () => {
    const s = sanitizeJournal({ name: 'Keeper', collected: ['toyol'], notes: 'Hello' });
    expect(s.codexUnlocked).toEqual(['toyol']);
    expect(s.neighborsHelped).toEqual([]);
    expect(s.notes).toBe('Hello');
  });
  it('finds Langsuan as an explicitly unverified alias', () => {
    const result = filterSpirits('Langsuan');
    expect(result[0].id).toBe('langsuir');
    expect(result[0].lore).toContain('not presented here as a verified');
  });
});
