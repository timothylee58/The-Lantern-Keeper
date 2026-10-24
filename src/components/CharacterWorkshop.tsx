'use client';
import { useState } from 'react';
import { NEIGHBORS, SPIRITS } from '../data';
import CharacterView from './CharacterView';
import type { CharacterClip } from '../lib/character-renderer';
const CHARACTERS = [
  { id: 'ari', name: 'Ari', role: 'The lantern keeper' },
  ...NEIGHBORS.map((n) => ({ id: n.id, name: n.name, role: n.community })),
  ...SPIRITS.map((s) => ({ id: s.id, name: s.name, role: s.subtitle })),
];
export default function CharacterWorkshop({ motionEnabled }: { motionEnabled: boolean }) {
  const [id, setId] = useState('ari'),
    [clip, setClip] = useState<CharacterClip>('Idle'),
    [paused, setPaused] = useState(false);
  const selected = CHARACTERS.find((c) => c.id === id)!;
  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE CHARACTER WORKSHOP · 15 LITTLE PERSONALITIES</span>
          <h1>
            A little paper.
            <br />
            <em>A life of its own.</em>
          </h1>
          <p>
            Meet the animated 3D puppets behind the adventure.
            <br />
            Drag to turn a model, choose a movement, or take a copy with you.
          </p>
        </div>
        <a className="gold-button" href="/hantu-codex/models/characters.zip" download>
          All 15 characters ↓
        </a>
      </div>
      <div className="workshop">
        <div className="character-list" role="group" aria-label="Choose character">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              aria-pressed={id === c.id}
              className={id === c.id ? 'active' : ''}
              onClick={() => setId(c.id)}
            >
              {c.name}
              <span>
                {NEIGHBORS.some((n) => n.id === c.id)
                  ? 'NEIGHBOR'
                  : c.id === 'ari'
                    ? 'KEEPER'
                    : 'SPIRIT'}
              </span>
            </button>
          ))}
        </div>
        <div className="model-stage">
          <div className="model-ground" />
          <CharacterView
            key={id}
            id={id}
            clip={clip}
            motionEnabled={motionEnabled && !paused}
            interactive
          />
          <span className="model-stage-note">DRAG TO TURN · ORIGINAL 3D PUPPET</span>
        </div>
        <div className="model-details">
          <span className="eyebrow">{selected.role}</span>
          <h2>{selected.name}</h2>
          <p>A friendly articulated model, with layered shapes and four seamless movement loops.</p>
          <div className="clip-controls" role="group" aria-label="Movement loop">
            {(['Idle', 'Walk', 'Wave', 'Celebrate'] as CharacterClip[]).map((c) => (
              <button
                key={c}
                aria-pressed={clip === c}
                className={clip === c ? 'active' : ''}
                onClick={() => setClip(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <button className="text-button" onClick={() => setPaused((v) => !v)}>
            {paused ? 'Play movement' : 'Pause movement'} {paused ? '▷' : 'Ⅱ'}
          </button>
          <div className="model-downloads">
            <a href={`/hantu-codex/models/${id}.glb`} download>
              Animated GLB ↓<small>Geometry + materials + four loops</small>
            </a>
            <a href={`/hantu-codex/models/${id}.dxf`} download>
              CAD-compatible DXF ↓<small>Static 3D mesh · millimeters</small>
            </a>
          </div>
          <p className="model-file-note">
            DXF uses editable 3DFACE mesh geometry. It is not a native DWG or a parametric solid.
            Animation lives in the GLB file.
          </p>
        </div>
      </div>
    </section>
  );
}
