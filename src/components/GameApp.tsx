'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, MotionConfig, useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Story from './cinematic/Story';
import { SpiritArt, SceneArt } from './art';
import { Button } from './ui/button';
import CharacterView from './CharacterView';
import CharacterWorkshop from './CharacterWorkshop';
import {
  NEIGHBORS,
  SPIRITS,
  VOICES,
  SIGHTINGS,
  REGIONS,
  filterSpirits,
  STORY_ORDER,
  type Neighbor,
  type Spirit,
} from '../data';
import { useGame, sanitizeJournal } from '../store/game';
import { bindAmbientAudio, playCue, setMuted } from '../lib/audio';
const Expedition = dynamic(() => import('./Expedition'), {
  ssr: false,
  loading: () => <div className="loading">Lighting the woodland…</div>,
});
type View =
  | 'story'
  | 'village'
  | 'expedition'
  | 'codex'
  | 'journal'
  | 'sightings'
  | 'finale'
  | 'characters';
const NAV: [string, string, View][] = [
  ['Story', '/', 'story'],
  ['Village', '/village/', 'village'],
  ['Hantu', '/codex/', 'codex'],
  ['Sightings', '/sightings/', 'sightings'],
  ['Journal', '/journal/', 'journal'],
  ['Characters', '/characters/', 'characters'],
];
function RegionFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="region-filter" role="group" aria-label="Filter by region">
      {Object.entries(REGIONS).map(([id, label]) => (
        <button
          key={id}
          className={value === id ? 'active' : ''}
          aria-pressed={value === id}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
function Dialogue({
  neighbor,
  onClose,
  onStart,
  done,
  motionEnabled,
}: {
  neighbor: Neighbor;
  onClose: () => void;
  onStart: () => void;
  done: boolean;
  motionEnabled: boolean;
}) {
  const [shown, setShown] = useState(0),
    ref = useRef<HTMLDialogElement>(null),
    text = done ? neighbor.thanks : neighbor.intro;
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.showModal();
    return () => {
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  useEffect(() => {
    if (!motionEnabled) {
      setShown(text.length);
      return;
    }
    setShown(0);
    const timer = setInterval(() => setShown((v) => Math.min(text.length, v + 2)), 20);
    return () => clearInterval(timer);
  }, [text, motionEnabled]);
  const advance = () => {
    if (shown < text.length) setShown(text.length);
    else onStart();
  };
  return (
    <dialog
      className="neighbor-dialog"
      ref={ref}
      onCancel={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === ref.current) {
          e.preventDefault();
          advance();
        }
      }}
    >
      <button className="close-dialog" onClick={onClose} aria-label="Close conversation">
        ×
      </button>
      <CharacterView
        id={neighbor.id}
        clip={done ? 'Celebrate' : 'Wave'}
        motionEnabled={motionEnabled}
      />
      <div>
        <span className="eyebrow">{neighbor.community}</span>
        <h2>{neighbor.name}</h2>
        <p className="dialogue-line" onClick={() => setShown(text.length)}>
          <span aria-hidden="true">
            {text.slice(0, shown)}
            {shown < text.length ? '▏' : ''}
          </span>
          <span className="sr-only">{text}</span>
        </p>
        <span className="eyebrow">
          {neighbor.mechanic.replace('-', ' ')} · {neighbor.item}
        </span>
        <Button onClick={advance}>
          {shown < text.length
            ? 'Show the whole message'
            : done
              ? 'Visit this expedition again'
              : 'Let’s help'}{' '}
          <span>↗</span>
        </Button>
        <button className="text-button" onClick={onClose}>
          I’ll come back in a moment
        </button>
      </div>
    </dialog>
  );
}
export default function GameApp({ view, expeditionId }: { view: View; expeditionId?: string }) {
  const router = useRouter(),
    game = useGame(),
    reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false),
    [debug, setDebug] = useState(false),
    [storageError, setStorageError] = useState(''),
    [query, setQuery] = useState(''),
    [region, setRegion] = useState('ALL'),
    [only, setOnly] = useState(false),
    [detail, setDetail] = useState<Spirit | null>(null),
    [noteTab, setNoteTab] = useState<'field' | 'folklore'>('field'),
    [variant, setVariant] = useState(0),
    [neighbor, setNeighbor] = useState<Neighbor | null>(null),
    [won, setWon] = useState(false),
    [sighting, setSighting] = useState(SIGHTINGS[0]),
    [toast, setToast] = useState(''),
    [resetOpen, setResetOpen] = useState(false),
    [eggOpen, setEggOpen] = useState(false),
    [spoonTaps, setSpoonTaps] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null),
    resetDialog = useRef<HTMLDialogElement>(null),
    eggDialog = useRef<HTMLDialogElement>(null),
    file = useRef<HTMLInputElement>(null),
    previousFocus = useRef<HTMLElement | null>(null);
  const motionEnabled = mounted && game.motionEnabled && !reduced;
  const current = NEIGHBORS.find((n) => n.id === expeditionId) || NEIGHBORS[0];
  useEffect(() => {
    setDebug(new URLSearchParams(window.location.search).has('debug'));
    try {
      const existing = localStorage.getItem('hantu-codex-v2');
      if (!existing) {
        const old = localStorage.getItem('hantu-codex-v1');
        if (old) useGame.getState().restore(sanitizeJournal(JSON.parse(old)));
      }
      void useGame.persist.rehydrate();
    } catch {
      setStorageError('Browser saving is unavailable. Export your journal to keep a copy.');
    }
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted) return;
    return bindAmbientAudio();
  }, [mounted]);
  useEffect(() => {
    if (!mounted) return;
    setMuted(game.audioMuted);
  }, [game.audioMuted, mounted]);
  useEffect(() => {
    if (detail) dialog.current?.showModal();
    else if (dialog.current?.open) {
      dialog.current.close();
      previousFocus.current?.focus();
    }
  }, [detail]);
  useEffect(() => {
    if (eggOpen) eggDialog.current?.showModal();
    else eggDialog.current?.close();
  }, [eggOpen]);
  useEffect(() => {
    if (resetOpen) resetDialog.current?.showModal();
    else resetDialog.current?.close();
  }, [resetOpen]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  const go = (path: string) => router.push(`${path}${debug ? '?debug' : ''}`);
  const openRecord = (s: Spirit, tab: 'field' | 'folklore' = 'field') => {
    previousFocus.current = document.activeElement as HTMLElement;
    setVariant(0);
    setNoteTab(tab);
    setDetail(s);
  };
  const start = (n: Neighbor) => {
    setNeighbor(null);
    go(`/expedition/${n.id}/`);
  };
  const exportJournal = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ version: 2, ...sanitizeJournal(game) }, null, 2)], {
        type: 'application/json',
      }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hantu-codex-journal.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const restoreJournal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      if (f.size > 100000) throw new Error('Too large');
      const d: unknown = JSON.parse(await f.text());
      if (!d || typeof d !== 'object' || !('version' in d) || ![1, 2].includes(Number(d.version)))
        throw new Error('Invalid');
      game.restore(d);
      setToast('Your field journal is restored.');
    } catch {
      setToast('That file is not a Hantu Codex journal. Your progress is unchanged.');
    }
    e.target.value = '';
  };
  const shareKeepsake = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0b1026';
    ctx.fillRect(0, 0, 1200, 630);
    ctx.strokeStyle = '#ffd36e';
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 35, 1130, 560);
    ctx.fillStyle = '#ffd36e';
    ctx.font = '24px Georgia';
    ctx.fillText('THE LANTERN KEEPER · HANTU CODEX', 80, 110);
    ctx.font = '70px Georgia';
    ctx.fillText('Eight little lights.', 80, 240);
    ctx.fillStyle = '#f4e9d2';
    ctx.fillText('One evening, together.', 80, 325);
    ctx.font = '25px sans-serif';
    ctx.fillText(`${game.name || 'Ari'} brought the village’s stories home.`, 80, 420);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i < game.lanternsLit.length ? '#ffd36e' : '#25334c';
      ctx.beginPath();
      ctx.ellipse(120 + i * 135, 510, 22, 30, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const a = document.createElement('a');
    a.download = 'lantern-keeper-gathering.png';
    a.href = canvas.toDataURL();
    a.click();
  };
  return (
    <MotionConfig reducedMotion={motionEnabled ? 'never' : 'always'}>
      <div className={`app ${!motionEnabled ? 'still' : ''}`} inert={!mounted}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Leave the Next basePath for the separate original game. */}
        <a className="lantern-return" href="/">
          ← The Lantern Keeper
        </a>
        <header>
          <button className="brand" onClick={() => go('/')} aria-label="Hantu Codex home">
            <span className="brand-glyph">◈</span>
            <span>
              HANTU CODEX<small>THE LANTERN KEEPER</small>
            </span>
          </button>
          <nav aria-label="Main navigation">
            {NAV.map(([label, path, key]) => (
              <button
                key={key}
                className={view === key ? 'active' : ''}
                aria-current={view === key ? 'page' : undefined}
                onClick={() => go(path)}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="header-tools">
            <button
              className="motion-toggle"
              aria-label="Ambient motion"
              aria-pressed={motionEnabled}
              onClick={() => game.patch({ motionEnabled: !game.motionEnabled })}
            >
              {motionEnabled ? '≈' : 'Ⅱ'}
              <span>Motion</span>
            </button>
            <button
              className="sound-toggle"
              aria-label={game.audioMuted ? 'Turn sound on' : 'Mute sound'}
              aria-pressed={!game.audioMuted}
              title="Rain & Lanterns · gentle rain and a playful folklore score"
              onClick={() => {
                setMuted(!game.audioMuted);
                game.patch({ audioMuted: !game.audioMuted });
                if (game.audioMuted) playCue('tap');
              }}
            >
              {game.audioMuted ? '♪̸' : '♪'}
              <span>{game.audioMuted ? 'Muted' : 'Sound'}</span>
            </button>
            <button
              className="collection-count"
              onClick={() => go('/village/')}
              aria-label={`${game.lanternsLit.length} of 8 lanterns lit`}
            >
              ✧ {game.lanternsLit.length}
              <span>/8</span>
            </button>
          </div>
        </header>
        <main id="main">
          {view === 'characters' && <CharacterWorkshop motionEnabled={motionEnabled} />}
          {view === 'story' && (
            <Story begin={() => go('/village/')} motionEnabled={motionEnabled} />
          )}
          {view === 'village' && (
            <section className="page-section village-page">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">THE VILLAGE AFTER THE RAIN</span>
                  <h1>
                    Small kindnesses.
                    <br />
                    <em>Brighter evenings.</em>
                  </h1>
                  <p>Choose a neighbor. Recover a keepsake. Relight a little piece of home.</p>
                </div>
                <div className="collection-stamp">
                  <strong>{String(game.lanternsLit.length).padStart(2, '0')}</strong>
                  <span>
                    OF 08 LANTERNS
                    <br />
                    GLOWING AGAIN
                  </span>
                </div>
              </div>
              <div
                className="village-map"
                style={
                  {
                    '--village-light': 0.22 + game.lanternsLit.length * 0.085,
                  } as React.CSSProperties
                }
              >
                <div className="village-background" />
                {NEIGHBORS.map((n, i) => (
                  <motion.button
                    className={`village-pin ${game.lanternsLit.includes(n.id) ? 'lit' : ''}`}
                    key={n.id}
                    style={{ left: `${n.x}%`, top: `${n.y}%` }}
                    onClick={() => setNeighbor(n)}
                    aria-label={`${n.name}, ${game.neighborsHelped.includes(n.id) ? 'ready for the gathering' : 'needs your help'}`}
                    animate={
                      motionEnabled && game.lanternsLit.includes(n.id)
                        ? { scale: [1, 1.06, 1] }
                        : undefined
                    }
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.2 }}
                  >
                    <span className="lantern-shape">
                      {game.lanternsLit.includes(n.id) ? '✦' : String(i + 1).padStart(2, '0')}
                    </span>
                    <b>{n.name}</b>
                  </motion.button>
                ))}
                <button
                  className="snack-secret"
                  aria-label="Tap the curious wooden spoon"
                  title="A spoon is tapping by the snack table…"
                  onClick={() => {
                    playCue('tap');
                    setSpoonTaps((v) => v + 1);
                    if (spoonTaps >= 2 || game.eggFound) {
                      game.patch({ eggFound: true });
                      setEggOpen(true);
                    } else
                      setToast(
                        spoonTaps === 0
                          ? 'Tap… the snack table seems to know a little rhythm.'
                          : 'Tap, tap… one more for the little borrower?',
                      );
                  }}
                >
                  <svg viewBox="0 0 44 44" width="32" height="32" aria-hidden="true">
                    <ellipse
                      cx="27"
                      cy="13"
                      rx="8"
                      ry="11"
                      fill="#ffd36e"
                      transform="rotate(35 27 13)"
                    />
                    <path d="M23 21 10 38" stroke="#c89854" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                </button>
                <span className="village-caption">A FICTIONAL VILLAGE · A SHARED INVITATION</span>
              </div>
              <div className="village-progress" aria-label="Gathering preparations">
                {NEIGHBORS.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setNeighbor(n)}
                    className={game.neighborsHelped.includes(n.id) ? 'done' : ''}
                  >
                    <span>{game.neighborsHelped.includes(n.id) ? '✦' : '○'}</span>
                    <b>{n.name}</b>
                    <small>{game.neighborsHelped.includes(n.id) ? n.addition : n.item}</small>
                  </button>
                ))}
              </div>
              {game.neighborsHelped.length === 8 && (
                <div className="gathering-invitation">
                  <span>✧</span>
                  <h2>The neighbors are ready.</h2>
                  <p>Eight little kindnesses have made room for one beautiful evening.</p>
                  <Button onClick={() => go('/finale/')}>Join the gathering ↗</Button>
                </div>
              )}
              <div className="village-how">
                <div>
                  <span>01</span>
                  <h3>Meet a neighbor</h3>
                  <p>Listen to their story and choose a small way to help.</p>
                </div>
                <div>
                  <span>02</span>
                  <h3>Follow the borrower</h3>
                  <p>Chase, soften your lantern, or repeat a playful pattern.</p>
                </div>
                <div>
                  <span>03</span>
                  <h3>Bring a story home</h3>
                  <p>A keepsake returns. A codex opens. A lantern glows.</p>
                </div>
              </div>
            </section>
          )}
          {view === 'expedition' && (
            <section className="page-section hunter-page">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    {current.name.toUpperCase()} · {current.community}
                  </span>
                  <h1>
                    {current.title.split('.').slice(0, -1).join('.')}
                    <em>.</em>
                  </h1>
                  <p>
                    {current.item} · {current.mechanic.replace('-', ' ')} expedition
                  </p>
                </div>
                <button className="text-button" onClick={() => go('/village/')}>
                  ← Return to the village
                </button>
              </div>
              {!won ? (
                <Expedition
                  key={current.id}
                  neighbor={current}
                  motionEnabled={motionEnabled}
                  onWin={() => {
                    game.complete(current.id);
                    setWon(true);
                  }}
                />
              ) : (
                <motion.div
                  className="win-card"
                  initial={motionEnabled ? { rotateY: -85, opacity: 0 } : false}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.65 }}
                >
                  <div className="win-art">
                    <CharacterView
                      id={current.spirit}
                      clip="Celebrate"
                      motionEnabled={motionEnabled}
                    />
                  </div>
                  <div>
                    <span className="eyebrow">KEEPSAKE HOME · CODEX RECORD UNLOCKED</span>
                    <h2>“{current.reply}”</h2>
                    <p>{current.thanks}</p>
                    <div className="win-lantern">
                      ✦ <span>{current.name}’s lantern is glowing.</span>
                    </div>
                    <Button
                      onClick={() => openRecord(SPIRITS.find((s) => s.id === current.spirit)!)}
                    >
                      Open your codex ↗
                    </Button>
                    <button className="text-button" onClick={() => go('/village/')}>
                      Return to the village →
                    </button>
                  </div>
                </motion.div>
              )}
            </section>
          )}
          {view === 'codex' && (
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">THE FIELD COLLECTION · VOL. 01</span>
                  <h1>
                    A name travels.
                    <br />
                    <em>A story changes.</em>
                  </h1>
                  <p>
                    Six spirit types. Eight fictional encounters.
                    <br />
                    Open a record to separate the story you played from the tradition behind it.
                  </p>
                </div>
                <div className="collection-stamp">
                  <strong>{String(game.codexUnlocked.length).padStart(2, '0')}</strong>
                  <span>
                    OF 06 ENCOUNTERS
                    <br />
                    DISCOVERED
                  </span>
                </div>
              </div>
              <div className="codex-filters">
                <RegionFilter value={region} onChange={setRegion} />
                <label className="search">
                  <span>⌕</span>
                  <input
                    placeholder="Search a spirit or spelling…"
                    aria-label="Search spirits"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <label className="collected-toggle">
                  <input
                    type="checkbox"
                    checked={only}
                    onChange={(e) => setOnly(e.target.checked)}
                  />{' '}
                  My collection
                </label>
              </div>
              <div className="spirit-grid">
                {filterSpirits(query, region, only, game.codexUnlocked).map((s) => (
                  <motion.button
                    key={s.id}
                    className="spirit-card"
                    onClick={() =>
                      openRecord(s, game.codexUnlocked.includes(s.id) ? 'field' : 'folklore')
                    }
                    whileHover={motionEnabled ? { y: -6, rotateY: -2 } : undefined}
                  >
                    <div className="spirit-image">
                      <SpiritArt spirit={s} locked={!game.codexUnlocked.includes(s.id)} />
                      <span className="card-index">
                        FIELD RECORD / {String(s.art + 1).padStart(2, '0')}
                      </span>
                      <span className="spirit-status">
                        {game.codexUnlocked.includes(s.id)
                          ? '✧ Collected'
                          : '○ Encounter undiscovered'}
                      </span>
                    </div>
                    <div className="card-copy">
                      <span className="eyebrow">
                        {s.tag} · {s.regions.join(' / ')}
                      </span>
                      <div>
                        <h2>{s.name}</h2>
                        <span className="card-arrow">↗</span>
                      </div>
                      <p>{s.subtitle}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
              {filterSpirits(query, region, only, game.codexUnlocked).length === 0 && (
                <div className="empty">
                  <h2>No tracks here yet.</h2>
                  <p>Try another spelling, or explore the village to collect a record.</p>
                  <button
                    onClick={() => {
                      setOnly(false);
                      setQuery('');
                      setRegion('ALL');
                    }}
                  >
                    Show all spirits
                  </button>
                </div>
              )}
              <p className="source-note">
                Folklore Notes are always available to read. Field Notes and full portraits unlock
                through play. Regional accounts are not a single fixed canon.
              </p>
            </section>
          )}
          {view === 'sightings' && (
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">THE ARCHIPELAGO FIELD MAP</span>
                  <h1>
                    Somewhere, a lantern <em>glows.</em>
                  </h1>
                  <p>Invented field routes inspired by an interconnected region.</p>
                </div>
              </div>
              <RegionFilter
                value={region}
                onChange={(r) => {
                  setRegion(r);
                  setSighting(SIGHTINGS.find((s) => r === 'ALL' || s.region === r)!);
                }}
              />
              <div className="map-layout">
                <div className="field-map">
                  <div className="map-grid" />
                  <svg
                    viewBox="0 0 1000 700"
                    aria-label="Stylized Southeast Asia, not to scale"
                    role="img"
                  >
                    <g fill="#223e46" stroke="#627d78" strokeWidth="2">
                      <path d="M260 30l65 22 5 90 40 91 4 80 36 58-24 16-39-57-19-65-40-74-33-93z" />
                      <path d="M142 260l64 40 50 81 46 71 51 95-18 28-49-53-46-58-66-110z" />
                      <path d="M402 569l57 8 55 18 81 5 39 22-34 20-114-17-88-24z" />
                      <path d="M610 232l45-48 62 15 60-41 60 18 12 42-28 38 18 54-42 79-67 30-62-30-20-58-56-32z" />
                    </g>
                    <g fill="#b7c1c0" fontSize="17" fontFamily="monospace" letterSpacing="3">
                      <text x="246" y="160">
                        MALAYSIA
                      </text>
                      <text x="360" y="430">
                        SINGAPORE
                      </text>
                      <text x="677" y="332">
                        BORNEO
                      </text>
                      <text x="400" y="675">
                        INDONESIA
                      </text>
                      <text x="655" y="139">
                        BRUNEI
                      </text>
                    </g>
                  </svg>
                  {SIGHTINGS.filter((s) => region === 'ALL' || s.region === region).map((s) => (
                    <button
                      key={s.id}
                      style={{ left: `${s.x}%`, top: `${s.y}%` }}
                      className={`map-pin ${sighting.id === s.id ? 'active' : ''}`}
                      aria-label={`${s.place}, ${s.area}`}
                      onClick={() => setSighting(s)}
                    >
                      <span />
                      <b>{s.id}</b>
                    </button>
                  ))}
                  <span className="map-compass">
                    N<br />✦
                  </span>
                  <span className="map-label">FICTIONAL ROUTES · NOT TO SCALE</span>
                </div>
                <aside className="route-card">
                  <span className="eyebrow">
                    {sighting.date} / {sighting.region}
                  </span>
                  <h2>{sighting.place}</h2>
                  <span className="muted">{sighting.area}</span>
                  <div className="route-art">
                    <SpiritArt spirit={SPIRITS.find((s) => s.id === sighting.spirit)!} />
                  </div>
                  <h3>{SPIRITS.find((s) => s.id === sighting.spirit)!.name}</h3>
                  <p>{SPIRITS.find((s) => s.id === sighting.spirit)!.clue}</p>
                  <button
                    className="gold-button"
                    onClick={() => start(NEIGHBORS.find((n) => n.spirit === sighting.spirit)!)}
                  >
                    Explore an encounter ↗
                  </button>
                </aside>
              </div>
              <p className="source-note">
                These sightings and place names are fictional game prompts, not reports of real
                paranormal events. Each link opens a village expedition; the map is not a navigation
                guide.
              </p>
            </section>
          )}
          {view === 'journal' && (
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">YOUR FIELD JOURNAL</span>
                  <h1>
                    Listen first.
                    <br />
                    <em>Keep the story.</em>
                  </h1>
                  <p>
                    Eight fictional neighbors introduce distinct living traditions.
                    <br />
                    Their families’ experiences do not speak for every member of a community.
                  </p>
                </div>
              </div>
              <div className="journal-grid">
                {STORY_ORDER.map((id, i) => {
                  const n = NEIGHBORS.find((v) => v.id === id)!,
                    v = VOICES[i];
                  return (
                    <article className="neighbor" key={id}>
                      <SceneArt id={id} />
                      <div>
                        <span
                          className={`preparation ${game.neighborsHelped.includes(id) ? 'done' : ''}`}
                        >
                          {game.neighborsHelped.includes(id)
                            ? '✦ Ready for the gathering'
                            : '○ A small kindness to do'}
                        </span>
                        <span className="eyebrow">{n.community}</span>
                        <h2>
                          {n.name}
                          <em>{v.title}</em>
                        </h2>
                        <p>{v.text}</p>
                        <a href={v.url} target="_blank" rel="noreferrer">
                          {v.source} ↗
                        </a>
                        <button className="text-button" onClick={() => setNeighbor(n)}>
                          {game.neighborsHelped.includes(id)
                            ? 'Hear the good news'
                            : 'Help this neighbor'}{' '}
                          →
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="journal-desk">
                <div>
                  <span className="eyebrow">THE RESEARCHER’S NOTEBOOK</span>
                  <h2>Keep a little of the journey.</h2>
                  <label>
                    Your keeper’s name
                    <input
                      maxLength={32}
                      value={game.name}
                      onChange={(e) => game.patch({ name: e.target.value })}
                    />
                  </label>
                  <label>
                    Field notes
                    <textarea
                      className="ari-note"
                      maxLength={10000}
                      placeholder="A story to ask about. A small wonder to remember…"
                      value={game.notes}
                      onChange={(e) => game.patch({ notes: e.target.value })}
                    />
                  </label>
                </div>
                <aside>
                  <h3>Saved in this browser</h3>
                  {game.eggFound && (
                    <button onClick={() => setEggOpen(true)}>✧ A tasty little secret</button>
                  )}
                  <p>
                    {game.runs} completed expeditions · {game.neighborsHelped.length}/8 neighbors
                    helped.
                  </p>
                  <p>
                    Export your journal before clearing browser data or changing devices. Cloud
                    saves are not connected.
                  </p>
                  {storageError && <p role="alert">{storageError}</p>}
                  <button onClick={exportJournal}>Export journal ↓</button>
                  <button onClick={() => file.current?.click()}>Import journal ↑</button>
                  <input
                    hidden
                    ref={file}
                    type="file"
                    accept="application/json,.json"
                    onChange={restoreJournal}
                  />
                  {/* Full navigation leaves the independently mounted Hantu app. */}
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                  <a href="/">Revisit the original village adventure ↗</a>
                </aside>
              </div>
            </section>
          )}
          {view === 'finale' && (
            <section className="page-section finale-page">
              {game.neighborsHelped.length < 8 ? (
                <div className="gathering-invitation">
                  <span>✧</span>
                  <h1>
                    A few more lights
                    <br />
                    <em>to bring home.</em>
                  </h1>
                  <p>
                    {8 - game.neighborsHelped.length} neighbors are still preparing. The gathering
                    will be ready when all eight lanterns glow.
                  </p>
                  <Button onClick={() => go('/village/')}>Back to the village →</Button>
                </div>
              ) : (
                <>
                  <div className="finale-art" />
                  <div className="finale-copy">
                    <span className="eyebrow">EIGHT LITTLE LIGHTS. ONE EVENING, TOGETHER.</span>
                    <h1>
                      Welcome home,
                      <br />
                      <em>{game.name || 'Ari'}.</em>
                    </h1>
                    <p>
                      Farah shares a verse. Lanterns glow above Kavitha’s doorstep. Daniel makes
                      room for a new dance partner. From the weaving corner to Dina’s table,
                      everyone has helped make this evening possible.
                    </p>
                    <p className="finale-joke">
                      The Toyol has returned all the buttons.
                      <br />
                      <em>Almost all the buttons.</em>
                    </p>
                  </div>
                  <div className="finale-neighbors">
                    {NEIGHBORS.map((n) => (
                      <div key={n.id}>
                        <SceneArt id={n.id} />
                        <b>{n.name}</b>
                        <p>{n.addition}</p>
                      </div>
                    ))}
                  </div>
                  <div className="finale-actions">
                    <Button onClick={shareKeepsake}>Save a gathering keepsake ↓</Button>
                    <Button variant="outline" onClick={() => setResetOpen(true)}>
                      Play again ↻
                    </Button>
                    <button className="text-button" onClick={() => go('/village/')}>
                      Keep exploring →
                    </button>
                  </div>
                  <div className="credits">
                    <span className="eyebrow">MADE WITH CARE</span>
                    <h2>A storybook, not a single story.</h2>
                    <p>
                      Original fictional characters and encounters. Paper-cut artwork generated for
                      this game. Original synthesized music and cues; no traditional performance is
                      reproduced. Cultural and folklore references are linked in the journal and
                      codex. No external CC0 artwork is used.
                    </p>
                    <p>
                      <a href="/hantu-codex/audio/rain-and-lanterns.wav">Rain &amp; Lanterns</a>:
                      soft rain, bamboo-like tones, plucked strings, small gong colours and a lively
                      frame-drum pulse. An original fantasy score inspired by instrumental colours
                      across Malaysia, Singapore, Indonesia and Brunei.
                    </p>
                    <p>
                      Motion principles inspired by{' '}
                      <a href="https://motion.zajno.com" target="_blank" rel="noreferrer">
                        Zajno Motion
                      </a>
                      , implemented with original code. Typeface credits: Fraunces, Nunito, Caveat ·
                      Google Fonts.
                    </p>
                  </div>
                </>
              )}
            </section>
          )}
        </main>
        <footer>
          <button className="brand" onClick={() => go('/')}>
            <span className="brand-glyph">◈</span>
            <span>
              HANTU CODEX<small>STORIES TRAVEL. KINDNESS STAYS.</small>
            </span>
          </button>
          <p>
            Rooted in Southeast Asian storytelling.
            <br />
            Made for curious hearts, with room for wonder.
          </p>
          <span>
            MY · SG · ID · BORNEO · BN
            <br />
            <small>Fictional encounters. Distinct living traditions.</small>
          </span>
        </footer>
        {neighbor && (
          <Dialogue
            key={neighbor.id}
            neighbor={neighbor}
            done={game.neighborsHelped.includes(neighbor.id)}
            motionEnabled={motionEnabled}
            onClose={() => setNeighbor(null)}
            onStart={() => start(neighbor)}
          />
        )}
        <dialog ref={dialog} className="record-dialog" onCancel={() => setDetail(null)}>
          {detail && (
            <div className="dialog-inner">
              <button
                className="close-dialog"
                aria-label="Close record"
                onClick={() => setDetail(null)}
              >
                ×
              </button>
              <div className="detail-art">
                {game.codexUnlocked.includes(detail.id) ? (
                  <CharacterView id={detail.id} clip="Idle" motionEnabled={motionEnabled} />
                ) : (
                  <SpiritArt spirit={detail} locked />
                )}
              </div>
              <div className="detail-copy">
                <span className="eyebrow">
                  {detail.tag} · {detail.level}
                </span>
                <h2>{detail.name}</h2>
                <div className="note-tabs" role="tablist" aria-label="Record sections">
                  <button
                    role="tab"
                    aria-selected={noteTab === 'field'}
                    onClick={() => setNoteTab('field')}
                  >
                    Field Notes
                  </button>
                  <button
                    role="tab"
                    aria-selected={noteTab === 'folklore'}
                    onClick={() => setNoteTab('folklore')}
                  >
                    Folklore Notes
                  </button>
                </div>
                {noteTab === 'folklore' ? (
                  <div role="tabpanel">
                    <span className="record-label">SOURCED TRADITION · ACCOUNTS VARY</span>
                    <p>{detail.lore}</p>
                    <div className="variant-tabs" role="group" aria-label="Regional accounts">
                      {detail.variants.map(([country], i) => (
                        <button
                          key={country}
                          aria-pressed={variant === i}
                          className={variant === i ? 'active' : ''}
                          onClick={() => setVariant(i)}
                        >
                          {REGIONS[country]}
                        </button>
                      ))}
                    </div>
                    <div className="variant-note">
                      <h3>{detail.variants[variant][1]}</h3>
                      <p>{detail.variants[variant][2]}</p>
                    </div>
                    <a
                      className="source-link"
                      href={detail.source[1]}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Read the source: {detail.source[0]} ↗
                    </a>
                  </div>
                ) : (
                  <div role="tabpanel">
                    <span className="record-label">OUR FICTIONAL GAME ENCOUNTERS</span>
                    {game.codexUnlocked.includes(detail.id) ? (
                      <>
                        <p>{detail.summary}</p>
                        {NEIGHBORS.filter((n) => n.spirit === detail.id).map((n) => (
                          <div className="field-note" key={n.id}>
                            <h3>
                              {n.name} · {n.item}
                            </h3>
                            <p>
                              {game.neighborsHelped.includes(n.id) ? `“${n.reply}”` : n.problem}
                            </p>
                            <button className="text-button" onClick={() => start(n)}>
                              {game.neighborsHelped.includes(n.id)
                                ? 'Revisit this encounter'
                                : 'Help this neighbor'}{' '}
                              ↗
                            </button>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        <p>
                          This encounter is still undiscovered. Help a neighbor to reveal the full
                          portrait and their story.
                        </p>
                        <Button
                          onClick={() => start(NEIGHBORS.find((n) => n.spirit === detail.id)!)}
                        >
                          Follow the first clue ↗
                        </Button>
                      </>
                    )}
                  </div>
                )}
                <p className="record-disclaimer">
                  The friendly character is a fictional reinterpretation, not a traditional
                  depiction or religious teaching.
                </p>
                {won && <Button onClick={() => go('/village/')}>Return to the village →</Button>}
              </div>
            </div>
          )}
        </dialog>
        <dialog ref={resetDialog} className="start-dialog" onCancel={() => setResetOpen(false)}>
          <h2>A fresh notebook?</h2>
          <p>
            This resets your eight lanterns and notes in this browser. Export your journal first if
            you want to keep it.
          </p>
          <Button
            onClick={() => {
              game.reset();
              setResetOpen(false);
              go('/');
            }}
          >
            Start a fresh journey
          </Button>
          <button className="text-button" onClick={() => setResetOpen(false)}>
            Keep my current journal
          </button>
        </dialog>
        <dialog className="egg-dialog" ref={eggDialog} onCancel={() => setEggOpen(false)}>
          <button
            className="close-dialog"
            aria-label="Close tasty secret"
            onClick={() => setEggOpen(false)}
          >
            ×
          </button>
          <span className="eyebrow">A TASTY LITTLE SECRET</span>
          <div className="egg-plate" aria-hidden="true">
            <span>●</span>
            <span>●</span>
            <span>●</span>
          </div>
          <h2>A spoonful of rhythm.</h2>
          <p>“Someone told me a spoon could carry a rhythm. I tried. Mine carries dessert.”</p>
          <p>
            Three pandan-green treats bounce on a plate. The Toyol looks extremely pleased with this
            scientific discovery.
          </p>
          <p className="source-note">
            An affectionate, unofficial nod to Metronomik’s <em>Ondeh Ondeh: Kaya’s Tasty Tale</em>.
            Original dialogue, visuals, and sounds; no game assets are reused.
          </p>
          <a href="https://www.youtube.com/watch?v=ibIX4yyZ4x0" target="_blank" rel="noreferrer">
            Watch the trailer that inspired the nod ↗
          </a>
          <button className="gold-button" onClick={() => setEggOpen(false)}>
            Save one for the neighbors →
          </button>
        </dialog>
        {debug && (
          <aside className="debug-panel" aria-label="Demo controls">
            <b>DEMO CONTROLS</b>
            <select
              aria-label="Jump to expedition"
              value={expeditionId || ''}
              onChange={(e) => {
                if (e.target.value) go(`/expedition/${e.target.value}/`);
              }}
            >
              <option value="">Jump to expedition…</option>
              {NEIGHBORS.map((n) => (
                <option value={n.id} key={n.id}>
                  {n.name} · {n.mechanic}
                </option>
              ))}
            </select>
            <button onClick={() => game.demoAll()}>Grant all lanterns</button>
            <button onClick={() => go('/finale/')}>Go to finale</button>
          </aside>
        )}
        {toast && (
          <div className="toast" role="status">
            ✧ {toast}
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
