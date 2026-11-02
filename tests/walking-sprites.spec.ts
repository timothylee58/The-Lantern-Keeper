import { test, expect } from '@playwright/test';
import manifest from '../public/sprites/manifest.json';
test('all character walking sheets, directions, pause and downloads', async ({ page }, info) => {
  await page.goto('/hantu-codex/characters/');
  for (const c of manifest.characters) {
    await page
      .getByRole('group', { name: 'Choose character' })
      .getByRole('button', { name: new RegExp('^' + c.name) })
      .click();
    const sprite = page.locator('.walking-sprite');
    await sprite.scrollIntoViewIfNeeded();
    await expect(sprite).toBeVisible();
    const response = await page.request.get('/hantu-codex/sprites/' + c.image);
    expect(response.ok()).toBeTruthy();
    expect((await response.body()).subarray(1, 4).toString()).toBe('PNG');
    await page
      .getByRole('group', { name: 'Walking direction' })
      .getByRole('button', { name: 'right', exact: true })
      .click();
    await expect(sprite).toHaveCSS('background-position-y', '-256px');
  }
  await expect(page.locator('.walking-sprite')).toHaveCSS('animation-play-state', 'running');
  await page.getByRole('button', { name: 'Pause movement' }).click();
  await expect(page.locator('.walking-sprite')).toHaveCSS('animation-play-state', 'paused');
  await page.getByRole('button', { name: 'Play movement' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.walking-sprite')).toHaveCSS('animation-play-state', 'paused');
  for (const href of [
    '/hantu-codex/sprites/walking-sprites.zip',
    '/hantu-codex/models/lantern-keeper-unity.unitypackage',
  ])
    expect((await page.request.get(href)).ok()).toBeTruthy();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
  await page.screenshot({ path: info.outputPath('walking-workshop.png') });
  if (info.project.name === 'desktop') {
    await page.setViewportSize({ width: 1050, height: 930 });
    await page.setContent(
      '<body style="margin:0;background:#182137;color:#f2dfb8;font-family:serif"><main style="display:grid;grid-template-columns:repeat(5,192px);gap:16px;padding:16px">' +
        manifest.characters
          .map(
            (c) =>
              '<article><div style="width:192px;height:256px;background-image:url(http://127.0.0.1:4173/hantu-codex/sprites/' +
              c.image +
              ');background-position:-576px -256px"></div><p style="margin:4px;text-align:center">' +
              c.name +
              '</p></article>',
          )
          .join('') +
        '</main></body>',
    );
    await page.evaluate(async () => {
      await Promise.all(
        Array.from(document.querySelectorAll('article div')).map(
          (el) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => resolve();
              img.src = getComputedStyle(el).backgroundImage.slice(5, -2);
            }),
        ),
      );
    });
    await page.screenshot({ path: info.outputPath('all-walking-characters.png') });
  }
});
