import { Howl, Howler } from 'howler';

export type AudioCue = 'success' | 'tap' | 'error';

// Create browser audio lazily, after the saved mute preference is restored.
let muted = true;
let cues: Record<AudioCue, Howl> | undefined;
let background: HTMLAudioElement | undefined;

function syncBackground(): void {
  if (typeof window === 'undefined') return;
  if (muted || document.hidden) {
    background?.pause();
    return;
  }
  if (!background) {
    background = new Audio('/hantu-codex/audio/rain-and-lanterns.wav');
    background.loop = true;
    background.volume = 0.32;
    background.preload = 'metadata';
    background.hidden = true;
    background.dataset.soundtrack = 'rain-and-lanterns';
    document.body.append(background);
  }
  if (background.paused) {
    // Browsers may reject autoplay. A trusted gesture retries on this same element.
    void background
      .play()
      .then(() => {
        if (muted || document.hidden) background?.pause();
      })
      .catch(() => {});
  }
}

export function bindAmbientAudio(): () => void {
  const unlock = (event: Event) => {
    if (
      !event.isTrusted ||
      (event.target instanceof Element && event.target.closest('.sound-toggle'))
    )
      return;
    if (
      event instanceof KeyboardEvent &&
      (event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        ['Shift', 'Control', 'Alt', 'Meta'].includes(event.key))
    )
      return;
    syncBackground();
  };
  document.addEventListener('pointerdown', unlock);
  document.addEventListener('click', unlock);
  document.addEventListener('keydown', unlock);
  document.addEventListener('visibilitychange', syncBackground);
  return () => {
    document.removeEventListener('pointerdown', unlock);
    document.removeEventListener('click', unlock);
    document.removeEventListener('keydown', unlock);
    document.removeEventListener('visibilitychange', syncBackground);
  };
}

function getCues(): Record<AudioCue, Howl> {
  if (!cues) {
    cues = {
      success: new Howl({ src: ['/hantu-codex/audio/success.wav'], volume: 0.35 }),
      tap: new Howl({ src: ['/hantu-codex/audio/tap.wav'], volume: 0.25 }),
      error: new Howl({ src: ['/hantu-codex/audio/error.wav'], volume: 0.25 }),
    };
  }
  return cues;
}

/** Apply the saved preference or a direct sound-toggle interaction. */
export function setMuted(value: boolean): void {
  muted = value;
  if (typeof window !== 'undefined') Howler.mute(value);
  syncBackground();
}

export function isMuted(): boolean {
  return muted;
}

/** Call after a player interaction, never as an ambient or cultural recording. */
export function playCue(cue: AudioCue): void {
  if (typeof window === 'undefined' || muted) return;
  const sound = getCues()[cue];
  sound.stop();
  sound.play();
}

/** Release the utility's sounds when the whole game shell unmounts. */
export function disposeAudio(): void {
  if (cues) Object.values(cues).forEach((sound) => sound.unload());
  cues = undefined;
  background?.pause();
  background?.remove();
  background = undefined;
}
