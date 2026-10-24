import { test, expect } from '@playwright/test';
import { observeRootAudio, rootPlaying, hantuPlaying } from './audio-helpers';
test.use({
  launchOptions: {
    args: [
      '--autoplay-policy=document-user-activation-required',
      '--disable-features=PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies',
    ],
  },
});
test('Lantern Keeper unlocks from keyboard and remembers an explicit mute', async ({ page }) => {
  await observeRootAudio(page);
  await page.goto('/');
  await expect(page.locator('#sound')).toContainText('Sound ready');
  expect(await rootPlaying(page)).toBe(false);
  await page.keyboard.press('Tab');
  await expect.poll(() => rootPlaying(page)).toBe(true);
  await page.locator('#sound').click();
  await page.getByRole('button', { name: 'Begin your story' }).click();
  await page.locator('.close').click();
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await expect(page.locator('#sound')).toContainText('Sound off');
  await page.locator('#sound').click();
  await expect.poll(() => rootPlaying(page)).toBe(true);
});

test('Hantu starts rain and music on first tap, loops, and pauses in the background', async ({
  page,
}) => {
  // Headless Chromium can exempt media from autoplay policy. Exercise the standard
  // NotAllowedError deterministically, then use real native playback after a gesture.
  await page.addInitScript(() => {
    const originalPlay = HTMLMediaElement.prototype.play;
    let activated = false;
    for (const type of ['pointerdown', 'click', 'keydown']) {
      document.addEventListener(
        type,
        (event) => {
          if (event.isTrusted) activated = true;
        },
        true,
      );
    }
    Object.assign(window, { autoplayRejections: 0 });
    HTMLMediaElement.prototype.play = function () {
      if (!activated) {
        const state = window as unknown as { autoplayRejections: number };
        state.autoplayRejections++;
        return Promise.reject(new DOMException('A user gesture is required', 'NotAllowedError'));
      }
      return originalPlay.call(this);
    };
  });
  await page.goto('/hantu-codex/');
  const track = page.locator('audio[data-soundtrack]');
  await expect(track).toHaveCount(1);
  await expect.poll(() => track.evaluate((el: HTMLAudioElement) => el.paused)).toBe(true);
  expect(
    await page.evaluate(
      () => (window as unknown as { autoplayRejections: number }).autoplayRejections,
    ),
  ).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Village', exact: true }).click();
  await expect.poll(() => hantuPlaying(page)).toBe(true);
  // Exercise the actual loop boundary without making the suite wait a full minute.
  await track.evaluate(
    (el: HTMLAudioElement) =>
      new Promise<void>((resolve) => {
        el.addEventListener('seeked', () => resolve(), { once: true });
        el.currentTime = 58.8;
      }),
  );
  expect(await track.evaluate((el: HTMLAudioElement) => el.currentTime)).toBeGreaterThan(58);
  await expect.poll(() => track.evaluate((el: HTMLAudioElement) => el.currentTime)).toBeLessThan(3);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => track.evaluate((el: HTMLAudioElement) => el.paused)).toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => hantuPlaying(page)).toBe(true);
});
