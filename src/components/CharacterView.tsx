'use client';
import { useEffect, useRef, useState } from 'react';
import type { CharacterClip, CharacterRenderer } from '../lib/character-renderer';
export default function CharacterView({
  id,
  clip = 'Idle',
  motionEnabled = true,
  interactive = false,
}: {
  id: string;
  clip?: CharacterClip;
  motionEnabled?: boolean;
  interactive?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null),
    clipRef = useRef(clip),
    motionRef = useRef(motionEnabled),
    turn = useRef(0),
    drag = useRef<number | null>(null);
  clipRef.current = clip;
  motionRef.current = motionEnabled;
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(false);
  useEffect(() => {
    let dead = false,
      frame = 0,
      visible = false,
      started = false,
      renderer: CharacterRenderer | undefined;
    setLoading(true);
    setError(false);
    turn.current = 0;
    const mount = host.current;
    const start = () => {
      if (started || dead) return;
      started = true;
      import('../lib/character-renderer')
        .then(async ({ CharacterRenderer }) => {
          if (dead || !mount) return;
          renderer = new CharacterRenderer(480, 520);
          mount.appendChild(renderer.renderer.domElement);
          await renderer.load(id);
          if (dead) return;
          setLoading(false);
          let last = performance.now(),
            lastTurn = NaN,
            lastClip = '',
            wasMoving = false;
          const tick = (now: number) => {
            if (dead || !renderer) return;
            const moving = motionRef.current && visible && !document.hidden;
            if (
              visible &&
              !document.hidden &&
              (moving || lastTurn !== turn.current || lastClip !== clipRef.current)
            ) {
              renderer.render(
                id,
                clipRef.current,
                moving && wasMoving ? (now - last) / 1000 : 0,
                turn.current,
              );
              lastTurn = turn.current;
              lastClip = clipRef.current;
            }
            last = now;
            wasMoving = moving;
            frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
        })
        .catch(() => {
          if (!dead) {
            renderer?.dispose();
            setError(true);
            setLoading(false);
          }
        });
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
      },
      { rootMargin: '160px' },
    );
    if (mount) observer.observe(mount);
    return () => {
      dead = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      renderer?.dispose();
    };
  }, [id]);
  return (
    <div
      className={`character-view ${interactive ? 'interactive' : ''}`}
      ref={host}
      role="img"
      tabIndex={interactive ? 0 : undefined}
      aria-label={`Animated three-dimensional model of ${id.replaceAll('-', ' ')}, ${clip.toLowerCase()} loop${interactive ? '. Drag or use left and right arrow keys to turn.' : ''}`}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          e.preventDefault();
          turn.current += e.key === 'ArrowLeft' ? -0.2 : 0.2;
        }
      }}
      onPointerDown={(e) => {
        if (interactive) {
          drag.current = e.clientX;
          e.currentTarget.setPointerCapture(e.pointerId);
        }
      }}
      onPointerMove={(e) => {
        if (interactive && drag.current !== null) {
          turn.current += (e.clientX - drag.current) * 0.01;
          drag.current = e.clientX;
        }
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      {loading && (
        <span className="character-loading" role="status">
          Folding a little friend…
        </span>
      )}
      {error && (
        <span className="character-loading" role="alert">
          3D preview unavailable in this browser. Model downloads are still available.
        </span>
      )}
    </div>
  );
}
