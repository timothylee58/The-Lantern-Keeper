import { useId } from 'react';
import { STORY_ORDER, NEIGHBORS, type Spirit } from '../data';
function AtlasCell({
  src,
  x,
  y,
  width,
  height,
  imageWidth,
  imageHeight,
}: {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageWidth: number;
  imageHeight: number;
}) {
  const clip = useId();
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <rect width={width} height={height} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <image href={src} x={-x} y={-y} width={imageWidth} height={imageHeight} />
      </g>
    </svg>
  );
}
export function SceneArt({ id, className = '' }: { id: string; className?: string }) {
  const i = Math.max(0, STORY_ORDER.indexOf(id));
  return (
    <div
      role="img"
      aria-label={`${NEIGHBORS.find((n) => n.id === id)?.name ?? 'Neighbor'} preparing for the gathering`}
      className={`scene-art ${className}`}
    >
      <AtlasCell
        src="/hantu-codex/art/neighbors.webp"
        x={(i % 4) * 256}
        y={Math.floor(i / 4) * 256}
        width={256}
        height={256}
        imageWidth={1024}
        imageHeight={512}
      />
    </div>
  );
}
export function SpiritArt({ spirit, locked = false }: { spirit: Spirit; locked?: boolean }) {
  const width = 1024 / 3;
  return (
    <div
      role="img"
      aria-label={
        locked
          ? 'Undiscovered spirit silhouette'
          : `${spirit.name}, a friendly paper-cut interpretation`
      }
      className={`spirit-art ${locked ? 'locked-art' : ''}`}
    >
      <AtlasCell
        src="/hantu-codex/art/spirits.webp"
        x={(spirit.art % 3) * width}
        y={Math.floor(spirit.art / 3) * 512}
        width={width}
        height={512}
        imageWidth={1024}
        imageHeight={1024}
      />
    </div>
  );
}
