'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { storyNeighbors } from '../../data';
import { SceneArt } from '../art';
import { Button } from '../ui/button';
import CharacterView from '../CharacterView';
export default function Story({
  begin,
  motionEnabled,
}: {
  begin: () => void;
  motionEnabled: boolean;
}) {
  const ref = useRef<HTMLElement>(null),
    camera = useRef<HTMLDivElement>(null),
    [chapter, setChapter] = useState(0);
  useEffect(() => {
    if (!motionEnabled || !ref.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top top+=88',
        end: 'bottom bottom',
        onUpdate: (self) => setChapter(Math.min(7, Math.floor(self.progress * 8))),
      });
      gsap.to('.hero-art', {
        scale: 1.06,
        duration: 18,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      gsap.to('.hero-orbit', {
        rotation: 12,
        duration: 12,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    });
    return () => {
      context.revert();
      lenis.destroy();
      gsap.ticker.remove(update);
    };
  }, [motionEnabled]);
  useEffect(() => {
    if (!motionEnabled || !camera.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        camera.current,
        { opacity: 0.2, scale: 1.06, clipPath: 'inset(0 0 10% 0)' },
        { opacity: 1, scale: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'power3.out' },
      );
    }, camera);
    return () => ctx.revert();
  }, [chapter, motionEnabled]);
  const choose = (i: number) => {
    setChapter(i);
    if (motionEnabled && ref.current) {
      const el = ref.current;
      window.scrollTo({
        top: el.offsetTop - 88 + ((el.offsetHeight - window.innerHeight + 88) * (i + 0.3)) / 8,
        behavior: 'smooth',
      });
    }
  };
  const n = storyNeighbors[chapter];
  return (
    <>
      <section className="hero">
        <link
          rel="preload"
          as="image"
          media="(max-width:760px)"
          href="/hantu-codex/art/village.webp"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          media="(min-width:761px)"
          href="/hantu-codex/art/village-wide.webp"
          fetchPriority="high"
        />
        <div className="hero-art" />
        <div className="hero-shade" />
        <div className="hero-orbit" aria-hidden="true" />
        <div className="hero-copy">
          <span className="eyebrow">
            <i /> A LITTLE MYSTERY. A LOT OF HEART.
          </span>
          <h1>
            After the rain,
            <br />
            we bring back
            <br />
            <em>the light.</em>
          </h1>
          <p>
            A storm has scattered the village’s keepsakes.
            <br className="desktop-br" /> Eight neighbors are waiting. The forest has a few
            <br className="desktop-br" /> very innocent-looking suspects.
          </p>
          <a className="gold-button" href="#prologue">
            Follow the story <span>↓</span>
          </a>
          <button className="text-button" onClick={begin}>
            Skip cinematic · Begin your story ↗
          </button>
        </div>
        <div className="hero-caption">
          <span>THE LANTERN KEEPER</span>
          <b>Hantu Codex</b>
          <small>An original Southeast Asian storybook adventure.</small>
        </div>
        <div className="hero-bottom">
          <span>01 / A GATHERING AFTER THE STORM</span>
          <span>SCROLL TO WANDER ↓</span>
        </div>
        <div className="fireflies" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <i
              key={i}
              style={{
                left: `${12 + i * 7}%`,
                top: `${20 + ((i * 29) % 70)}%`,
                animationDelay: `${i * -0.7}s`,
              }}
            />
          ))}
        </div>
      </section>
      <section
        className={`story-scroll ${!motionEnabled ? 'manual-story' : ''}`}
        id="prologue"
        ref={ref}
      >
        <div className="story-sticky">
          <div className="story-heading">
            <span className="eyebrow">EIGHT NEIGHBORS. ONE SHARED EVENING.</span>
            <button className="text-button" onClick={begin}>
              Skip to the village ↗
            </button>
          </div>
          <div className="story-stage">
            <div className="story-words">
              <div className="chapter-number">
                0{chapter + 1}
                <span>/ 08</span>
              </div>
              <div>
                <span className="eyebrow">
                  {n.name} · {n.community}
                </span>
                <h2>{n.title}</h2>
                <p>{n.problem}</p>
                <div className="keepsake">
                  <span>↳ A LITTLE HELP GOES A LONG WAY</span>
                  <strong>{n.item}</strong>
                </div>
              </div>
              <div className="chapter-controls">
                <button
                  disabled={chapter === 0}
                  aria-label="Previous neighbor"
                  onClick={() => choose(chapter - 1)}
                >
                  ←
                </button>
                <span>{n.name}’s story</span>
                <button
                  disabled={chapter === 7}
                  aria-label="Next neighbor"
                  onClick={() => choose(chapter + 1)}
                >
                  →
                </button>
              </div>
            </div>
            <div className="scene-frame">
              <div className="scene-layer" ref={camera}>
                <SceneArt id={n.id} />
              </div>
              <span className="scene-stamp">
                A SMALL ACT OF CARE
                <br />A STORY WORTH KEEPING
              </span>
              <span className="scene-corner">✧</span>
            </div>
          </div>
          <div className="chapter-track" aria-label="Neighbor chapters">
            {storyNeighbors.map((v, i) => (
              <button
                key={v.id}
                className={i === chapter ? 'active' : ''}
                aria-label={`Read ${v.name}'s story`}
                aria-current={i === chapter ? 'step' : undefined}
                onClick={() => choose(i)}
              >
                <i />
                <span>{v.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="begin-story">
        <div className="keeper-paper" aria-hidden="true">
          <span>◈</span>
          <CharacterView id="ari" clip="Idle" motionEnabled={motionEnabled} />
          <p>
            ARI
            <br />
            <small>APPRENTICE FOLKLORE RESEARCHER</small>
          </p>
        </div>
        <div>
          <span className="eyebrow">YOU ARE THE LANTERN KEEPER</span>
          <h2>
            A curious heart.
            <br />
            An unfinished <em>codex.</em>
          </h2>
          <p>
            Play as Ari, a young researcher with roots across the Causeway. Help your neighbors by
            day. Follow the little borrowers at twilight. Return their keepsakes with kindness, and
            a shared evening begins to take shape.
          </p>
          <p>
            Eight lanterns. Three playful kinds of expedition. One gathering with room for everyone.
          </p>
          <Button onClick={begin}>
            Begin your story <span>↗</span>
          </Button>
          <small className="fiction-note">
            This village and its encounters are fictional. The codex keeps sourced folklore separate
            from our playful retellings.
          </small>
        </div>
      </section>
    </>
  );
}
