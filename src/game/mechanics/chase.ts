export interface Point {
  x: number;
  y: number;
}
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export function moveTowards(p: Point, target: Point, speed: number, dt: number): Point {
  const d = distance(p, target);
  const amount = Math.min(d, speed * dt);
  return d
    ? { x: p.x + ((target.x - p.x) / d) * amount, y: p.y + ((target.y - p.y) / d) * amount }
    : { ...p };
}
export function chaseRoute(seed: number): Point[] {
  const shift = (seed % 3) * 35;
  return [
    { x: 720 - shift, y: 145 },
    { x: 795, y: 405 - shift },
    { x: 500 + shift, y: 445 },
    { x: 420, y: 190 + shift },
  ];
}
