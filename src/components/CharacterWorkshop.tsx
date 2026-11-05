'use client';
import { useState } from 'react';
import { NEIGHBORS, SPIRITS } from '../data';
import CharacterView from './CharacterView';
import { DIRECTIONS, type CharacterClip } from '../lib/character-sprites';
const CHARACTERS = [
  { id: 'ari', name: 'Ari', role: 'The lantern keeper' },
  ...NEIGHBORS.map((n) => ({ id: n.id, name: n.name, role: n.community })),
  ...SPIRITS.map((s) => ({ id: s.id, name: s.name, role: s.subtitle })),
];
export default function CharacterWorkshop({ motionEnabled }: { motionEnabled: boolean }) {
  const [id, setId] = useState('ari'),
    [clip, setClip] = useState<CharacterClip>('Idle'),
    [paused, setPaused] = useState(false),
    [direction, setDirection] = useState(0);
  const selected = CHARACTERS.find((c) => c.id === id)!;
  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE CHARACTER WORKSHOP · 15 STORIES TO DISCOVER</span>
          <h1>
            Faces of the valley.
            <br />
            <em>Stories in motion.</em>
          </h1>
          <p>
            Meet the painted characters behind the adventure.
            <br />
            Choose a direction and a movement, then take your favorite sprites with you.
          </p>
        </div>
        <a className="gold-button" href="/hantu-codex/painted/characters-painted.zip" download>
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
        <div className="model-stage pixel-stage">
          <CharacterView
            key={`${id}-${direction}`}
            id={id}
            clip={clip}
            direction={direction}
            motionEnabled={motionEnabled && !paused}
            interactive
          />
          <span className="model-stage-note">HAND-PAINTED CHARACTERS · FOUR WALKING VIEWS</span>
        </div>
        <div className="model-details">
          <span className="eyebrow">{selected.role}</span>
          <h2>{selected.name}</h2>
          <p>Four walking views, a resting pose, and front-facing waves and celebrations.</p>
          <div className="clip-controls" role="group" aria-label="Character direction">
            {DIRECTIONS.map((d, i) => (
              <button
                key={d}
                aria-pressed={direction === i}
                className={direction === i ? 'active' : ''}
                disabled={clip === 'Wave' || clip === 'Celebrate'}
                onClick={() => setDirection(i)}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="clip-controls" role="group" aria-label="Movement loop">
            {(['Idle', 'Walk', 'Wave', 'Celebrate'] as CharacterClip[]).map((c) => (
              <button
                key={c}
                aria-pressed={clip === c}
                className={clip === c ? 'active' : ''}
                onClick={() => {
                  setClip(c);
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <button className="text-button" onClick={() => setPaused((v) => !v)}>
            {paused ? 'Play movement' : 'Pause movement'} {paused ? '▷' : 'Ⅱ'}
          </button>
          <div className="model-downloads">
            <a href={`/hantu-codex/painted/${id}.png`} download>
              Character atlas ↓<small>48 poses · transparent painted PNG</small>
            </a>
            <a href={`/hantu-codex/painted/${id}-walk.png`} download>
              Walking sprite sheet ↓<small>32 frames · four directions</small>
            </a>
            <a href="/hantu-codex/painted/characters-painted.zip" download>
              All 15 painted characters ↓<small>Atlases + frame manifest</small>
            </a>
          </div>
          <p className="model-file-note">
            Warm painted artwork. Includes a resting pose, walking, waving and
            celebration loops.
          </p>
        </div>
      </div>
    </section>
  );
}
