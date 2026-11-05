'use client';
import { useEffect, useRef, useState } from 'react';
import { spriteFrame, DIRECTIONS, type CharacterClip } from '../lib/character-sprites';
export default function CharacterView({
  id,
  clip = 'Idle',
  motionEnabled = true,
  interactive = false,
  direction = 0,
}: {
  id: string;
  clip?: CharacterClip;
  motionEnabled?: boolean;
  interactive?: boolean;
  direction?: number;
}) {
  const host = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef({ clip, motionEnabled, direction });
  state.current = { clip, motionEnabled, direction };
  const [turn, setTurn] = useState(0),
    [error, setError] = useState(false),
    [loaded, setLoaded] = useState(false);
  const turnRef = useRef(0),
    drag = useRef<number | null>(null);
  turnRef.current = turn;
  useEffect(() => {
    let dead = false,
      visible = false,
      frame = 0,
      elapsed = 0,
      previous = 0,
      lastClip = '',
      lastDraw = '';
    const img = new Image();
    setLoaded(false);
    setError(false);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    if (host.current) observer.observe(host.current);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    img.onload = () => {
      if (dead) return;
      setLoaded(true);
      const tick = (now: number) => {
        if (dead) return;
        const s = state.current,
          dir = (((s.direction + turnRef.current) % 4) + 4) % 4;
        if (s.clip !== lastClip) {
          elapsed = 0;
          lastClip = s.clip;
        }
        if (visible && !document.hidden) {
          if (s.motionEnabled && !reduced.matches && previous)
            elapsed += Math.min((now - previous) / 1000, 0.1);
          const pose = spriteFrame(s.clip, dir, elapsed),
            draw = `${pose.x}:${pose.y}`;
          if (draw !== lastDraw) {
            const ctx = canvas.current?.getContext('2d');
            if (ctx) {
              ctx.imageSmoothingEnabled = false;
              ctx.clearRect(0, 0, 192, 256);
              ctx.drawImage(img, pose.x, pose.y, 48, 64, 0, 0, 192, 256);
              lastDraw = draw;
            }
          }
        }
        previous = now;
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    img.onerror = () => {
      if (!dead) setError(true);
    };
    img.src = `/hantu-codex/pixel/${id}.png`;
    return () => {
      dead = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      img.onload = null;
      img.onerror = null;
    };
  }, [id]);
  return (
    <div
      ref={host}
      className={`character-view pixel-character ${interactive ? 'interactive' : ''}`}
      role="img"
      aria-label={`8-bit character ${id.replaceAll('-', ' ')}, ${clip.toLowerCase()} loop, ${DIRECTIONS[(((direction + turn) % 4) + 4) % 4]} view`}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(e) => {
        if (interactive && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          setTurn((v) => v + (e.key === 'ArrowRight' ? 1 : -1));
        }
      }}
      onPointerDown={(e) => {
        if (interactive) {
          drag.current = e.clientX;
          e.currentTarget.setPointerCapture(e.pointerId);
        }
      }}
      onPointerUp={(e) => {
        if (drag.current !== null && Math.abs(e.clientX - drag.current) > 20)
          setTurn((v) => v + (e.clientX > drag.current! ? 1 : -1));
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      <canvas ref={canvas} width={192} height={256} aria-hidden="true" data-loaded={loaded} />
      {!loaded && !error && (
        <span className="character-loading" role="status">
          Drawing a little adventurer…
        </span>
      )}
      {error && (
        <span className="character-loading" role="alert">
          Character sprite unavailable. Please reload.
        </span>
      )}
    </div>
  );
}
