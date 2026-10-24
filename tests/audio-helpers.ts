import { type Page } from '@playwright/test';

export async function observeRootAudio(page: Page) {
  await page.addInitScript(() => {
    const Original = window.AudioContext;
    const state = { contexts: [] as AudioContext[], sources: [] as AudioBufferSourceNode[] };
    Object.assign(window, { musicTest: state });
    window.AudioContext = class extends Original {
      constructor(options?: AudioContextOptions) {
        super(options);
        state.contexts.push(this);
      }
      createBufferSource() {
        const source = super.createBufferSource();
        state.sources.push(source);
        return source;
      }
    };
  });
}
export async function rootPlaying(page: Page) {
  return page.evaluate(() => {
    const state = (
      window as unknown as {
        musicTest: { contexts: AudioContext[]; sources: AudioBufferSourceNode[] };
      }
    ).musicTest;
    return (
      state.contexts[0]?.state === 'running' &&
      state.sources.filter((s) => s.loop && s.buffer?.duration === 48).length === 1
    );
  });
}
export async function hantuPlaying(page: Page) {
  return page
    .locator('audio[data-soundtrack]')
    .evaluate(
      (element: HTMLAudioElement) =>
        !element.paused && element.loop && element.duration === 60 && element.currentTime > 0,
    );
}
