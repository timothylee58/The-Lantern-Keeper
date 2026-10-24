'use client';
import { useEffect, useRef, useState } from 'react';
import type { Neighbor } from '../data';
import { newRun, type Run } from '../game/engine/simulation';
import type { GameBridge } from '../game/engine/createGame';
import { loadGameFonts } from '../lib/fonts';
import { playCue } from '../lib/audio';
import { useGame } from '../store/game';
export default function Expedition({
  neighbor,
  onWin,
  motionEnabled,
}: {
  neighbor: Neighbor;
  onWin: () => void;
  motionEnabled: boolean;
}) {
  const host = useRef<HTMLDivElement>(null),
    bridge = useRef<GameBridge | null>(null),
    result = useRef(onWin);
  result.current = onWin;
  const [started, setStarted] = useState(false),
    [gentle, setGentle] = useState(true),
    [paused, setPaused] = useState(false),
    [round, setRound] = useState(0),
    [hud, setHud] = useState<Run>(newRun(neighbor.mechanic, neighbor.seed)),
    [soft, setSoft] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    if (bridge.current) bridge.current.motion = motionEnabled;
  }, [motionEnabled]);
  useEffect(() => {
    if (bridge.current) bridge.current.paused = paused;
  }, [paused]);
  useEffect(() => {
    if (!started || !host.current) return;
    let dead = false,
      game: { destroy: (removeCanvas: boolean) => void } | undefined;
    const b: GameBridge = {
      input: { x: 0, y: 0, soft: false },
      paused: false,
      motion: motionEnabled,
      onFrame: (s) => {
        if (!dead) setHud(s);
      },
      onResult: (s) => {
        if (!dead && s.status === 'won') {
          playCue('success');
          result.current();
        }
      },
      onCue: () => playCue('tap'),
    };
    bridge.current = b;
    Promise.all([import('../game/engine/createGame'), loadGameFonts()])
      .then(([{ createExpedition }]) => {
        if (!dead && host.current) game = createExpedition(host.current, neighbor, b, gentle);
      })
      .catch(() => {
        if (!dead) setError('The woodland could not load. Check your connection and try again.');
      });
    const pause = () => {
      b.paused = true;
      b.input = { x: 0, y: 0, soft: false };
      setPaused(true);
    };
    const visibility = () => {
      if (document.hidden) pause();
    };
    window.addEventListener('blur', pause);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      dead = true;
      game?.destroy(true);
      bridge.current = null;
      window.removeEventListener('blur', pause);
      document.removeEventListener('visibilitychange', visibility);
    };
    // Ambient changes update the bridge without restarting an expedition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, round, neighbor.id, gentle]);
  const begin = () => {
    setError('');
    setSoft(false);
    setPaused(false);
    setHud(newRun(neighbor.mechanic, neighbor.seed, gentle));
    setStarted(true);
    setRound((r) => r + 1);
    setTimeout(() => host.current?.focus(), 0);
  };
  const arrow = (x: number, y: number, label: string, glyph: string) => (
    <button
      aria-label={label}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        if (bridge.current) {
          bridge.current.input.x = x;
          bridge.current.input.y = y;
        }
      }}
      onPointerUp={() => {
        if (bridge.current) {
          bridge.current.input.x = 0;
          bridge.current.input.y = 0;
        }
      }}
      onPointerCancel={() => {
        if (bridge.current) {
          bridge.current.input.x = 0;
          bridge.current.input.y = 0;
        }
      }}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && bridge.current) {
          e.preventDefault();
          bridge.current.input.x = x;
          bridge.current.input.y = y;
        }
      }}
      onKeyUp={() => {
        if (bridge.current) {
          bridge.current.input.x = 0;
          bridge.current.input.y = 0;
        }
      }}
    >
      {glyph}
    </button>
  );
  const pattern = neighbor.mechanic === 'pattern';
  return (
    <section className="hunter-game">
      <div className="game-toolbar">
        <span>
          HANTU HUNTER <b>{neighbor.name}’s expedition</b>
        </span>
        <button
          disabled={!started || hud.status !== 'playing'}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>
      <div className="game-stage">
        <div
          className="phaser-host"
          ref={host}
          tabIndex={0}
          role="application"
          aria-label={
            pattern
              ? 'Pattern expedition. Watch the lights and use number keys 1 through 4 to repeat them.'
              : 'Woodland expedition. Use arrow keys or WASD. Hold Shift to soften your lantern.'
          }
        />
        <div className="game-hud">
          <span>
            {pattern ? `✧ Round ${Math.min(3, hud.round + 1)}/3` : `✧ ${hud.clues.length}/3 pieces`}
          </span>
          <span>◷ {Math.ceil(hud.remaining)}s</span>
          <span>
            {pattern
              ? hud.patternPhase === 'show'
                ? 'Watch the lights'
                : 'Your turn'
              : neighbor.mechanic === 'chase'
                ? 'Follow the borrower'
                : soft
                  ? 'Soft glow'
                  : 'Bright lantern'}
          </span>
        </div>
        {started && hud.status === 'playing' && (
          <p className="game-hint" aria-live="polite">
            {hud.feedback}
          </p>
        )}
        {(!started || error) && (
          <div className="game-overlay">
            <span className="eyebrow">
              {neighbor.mechanic.replace('-', ' ')} · A GENTLE EXPEDITION
            </span>
            <h2>{neighbor.item}</h2>
            <p>{error || neighbor.problem}</p>
            <label className="gentle-choice">
              <input
                type="checkbox"
                checked={gentle}
                onChange={(e) => setGentle(e.target.checked)}
              />{' '}
              Extra time · 3 minutes
            </label>
            <p className="game-help">
              {pattern
                ? 'Watch the lights, then tap the same order. Keys 1–4 or the buttons below. Correct order matters; rhythm is a bonus.'
                : neighbor.mechanic === 'chase'
                  ? 'Move with WASD / arrows or the touch pad. Catch the borrower three times, then return to the green camp.'
                  : 'Follow the faint gold glows. Hold Shift or toggle Soften light beside each clue. Find three, then return to the green camp.'}
            </p>
            <button className="gold-button" onClick={begin}>
              Enter the woodland <span>↗</span>
            </button>
          </div>
        )}
        {started && paused && hud.status === 'playing' && (
          <div className="game-overlay">
            <h2>A quiet moment.</h2>
            <p>Your expedition is paused.</p>
            <button
              className="gold-button"
              onClick={() => {
                setPaused(false);
                host.current?.focus();
              }}
            >
              Keep exploring →
            </button>
          </div>
        )}
        {started && hud.status === 'timeout' && (
          <div className="game-overlay">
            <h2>Another little try?</h2>
            <p>The forest is patient. Your village progress is safe.</p>
            <button className="gold-button" onClick={begin}>
              Try again ↗
            </button>
          </div>
        )}
      </div>
      <div className="game-controls">
        {pattern ? (
          <div className="pattern-buttons">
            {['○ Circle', '△ Triangle', '□ Square', '＋ Cross'].map((label, i) => (
              <button
                key={label}
                disabled={
                  !started || paused || hud.patternPhase !== 'input' || hud.status !== 'playing'
                }
                onClick={() => {
                  if (bridge.current) bridge.current.input.tap = i;
                }}
              >
                <kbd>{i + 1}</kbd> {label}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="dpad">
              <span />
              {arrow(0, -1, 'Move up', '↑')}
              <span />
              {arrow(-1, 0, 'Move left', '←')}
              {arrow(0, 1, 'Move down', '↓')}
              {arrow(1, 0, 'Move right', '→')}
            </div>
            <div className="action-controls">
              <button
                aria-pressed={soft}
                className={soft ? 'selected' : ''}
                onClick={() => {
                  setSoft(!soft);
                  if (bridge.current) bridge.current.input.soft = !soft;
                }}
              >
                ♧ {soft ? 'Soft glow on' : 'Soften light'}
              </button>
            </div>
            <p>
              Three pieces. One little kindness.
              <br />
              Return to the green circle.
            </p>
          </>
        )}
      </div>
      <div className="game-access-note">
        {useGame.getState().audioMuted
          ? 'Sound is off. Every cue is also visible.'
          : 'Original game sounds. No traditional music is reproduced.'}
      </div>
    </section>
  );
}
