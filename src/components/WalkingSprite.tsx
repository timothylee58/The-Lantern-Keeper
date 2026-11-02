'use client';
import { useEffect, useRef, useState } from 'react';
import manifest from '../../public/sprites/manifest.json';
export default function WalkingSprite({ id, moving }: { id: string; moving: boolean }) {
  const [direction, setDirection] = useState(0);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(true);
  const host = useRef<HTMLDivElement>(null);
  const character = manifest.characters.find((c) => c.id === id)!;
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (host.current) observer.observe(host.current);
    const update = () => setForeground(!document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return (
    <div className="walking-preview" ref={host}>
      <div
        className="walking-sprite"
        role="img"
        aria-label={`${character.name} walking cycle, ${manifest.rows[direction]} view`}
        style={{
          backgroundImage: `url(/hantu-codex/sprites/${character.image})`,
          backgroundPositionY: `${-direction * 256}px`,
          animationDuration: `${character.duration}s`,
          animationPlayState: moving && visible && foreground ? 'running' : 'paused',
        }}
      />
      <div className="clip-controls" role="group" aria-label="Walking direction">
        {manifest.rows.map((label, row) => (
          <button
            key={label}
            aria-pressed={direction === row}
            className={direction === row ? 'active' : ''}
            onClick={() => setDirection(row)}
          >
            {label}
          </button>
        ))}
      </div>
      <p>12 frames · four directions · seamless loop</p>
    </div>
  );
}
