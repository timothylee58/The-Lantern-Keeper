import { test, expect } from '@playwright/test';
import { observeRootAudio, rootPlaying, hantuPlaying } from './audio-helpers';
test.use({ launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } });
test('both soundtracks start automatically; Hantu music survives navigation and mute persists', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await observeRootAudio(page);
  await page.goto('/');
  await expect.poll(() => rootPlaying(page)).toBe(true);
  await expect(page.locator('#sound')).toContainText('Sound on');
  await page.locator('#sound').click();
  await page.reload();
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'false');
  expect(await rootPlaying(page)).toBe(false);

  await page.goto('/hantu-codex/');
  await expect.poll(() => hantuPlaying(page)).toBe(true);
  await page.locator('audio[data-soundtrack]').evaluate((element: HTMLAudioElement) => {
    element.dataset.retained = 'yes';
  });
  await page.getByRole('button', { name: 'Village', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Small kindnesses/ })).toBeVisible();
  await expect(page.locator('audio[data-soundtrack]')).toHaveCount(1);
  await expect(page.locator('audio[data-soundtrack]')).toHaveAttribute('data-retained', 'yes');
  await expect.poll(() => hantuPlaying(page)).toBe(true);
  await page.getByRole('button', { name: 'Mute sound', exact: true }).click();
  await expect
    .poll(() => page.locator('audio').evaluate((el: HTMLAudioElement) => el.paused))
    .toBe(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Turn sound on', exact: true })).toBeVisible();
  await expect(page.locator('audio[data-soundtrack]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Turn sound on', exact: true }).click();
  await expect.poll(() => hantuPlaying(page)).toBe(true);
  const back = page.getByRole('link', { name: '← The Lantern Keeper', exact: true });
  await expect(back).toHaveAttribute('href', '/');
  expect((await back.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await back.click();
  await expect(
    page.getByRole('heading', { name: 'A little light. A great adventure.' }),
  ).toBeVisible();
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'false');
  expect(errors).toEqual([]);
});
