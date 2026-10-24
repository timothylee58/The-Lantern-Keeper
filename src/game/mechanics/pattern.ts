export function patternFor(seed: number, round: number): number[] {
  return Array.from({ length: 3 + round }, (_, i) => (seed + i * 3 + Math.floor(i / 2)) % 4);
}
export function judgeTap(expected: number, actual: number, elapsed: number, windowMs = 220) {
  return {
    correct: expected === actual,
    onBeat: Math.abs((elapsed % 0.65) - 0.325) * 1000 <= windowMs,
  };
}
