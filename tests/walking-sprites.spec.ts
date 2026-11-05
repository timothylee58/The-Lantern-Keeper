import { test, expect } from '@playwright/test';
import manifest from '../public/painted/manifest.json';
test('all 15 pixel characters, directional loops, pause and no 3D requests', async ({
  page,
}, info) => {
  const modelRequests: string[] = [];
  page.on('request', (r) => {
    if (/\.glb|\/models\//.test(r.url())) modelRequests.push(r.url());
  });
  await page.goto('/hantu-codex/characters/');
  for (const c of manifest.characters) {
    await page
      .getByRole('group', { name: 'Choose character' })
      .getByRole('button', { name: new RegExp('^' + c.name) })
      .click();
    const canvas = page.locator('.character-view canvas');
    await canvas.scrollIntoViewIfNeeded();
    await expect(canvas).toHaveAttribute('data-loaded', 'true');
    await expect(canvas).toHaveCSS('image-rendering', 'auto');
    for (const name of ['Idle', 'Walk', 'Wave', 'Celebrate']) {
      await page.getByRole('button', { name, exact: true }).click();
      await expect(page.locator('.character-view')).toHaveAttribute(
        'aria-label',
        new RegExp(name.toLowerCase() + ' loop'),
      );
    }
    await page.getByRole('button', { name: 'Walk', exact: true }).click();
    await page
      .getByRole('group', { name: 'Character direction' })
      .getByRole('button', { name: 'right', exact: true })
      .click();
    await expect(page.locator('.character-view')).toHaveAttribute('aria-label', /right view/);
    const response = await page.request.get('/hantu-codex/painted/' + c.image);
    expect(response.ok()).toBeTruthy();
    const png = await response.body();
    expect(png.readUInt32BE(16)).toBe(1536);
    expect(png.readUInt32BE(20)).toBe(1536);
  }
  await page.getByRole('button', { name: 'Walk', exact: true }).click();
  const canvas = page.locator('.character-view canvas');
  await canvas.scrollIntoViewIfNeeded();
  const pixels = () => canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL());
  const before = await pixels();
  await expect.poll(pixels).not.toBe(before);
  await page.getByRole('button', { name: 'Pause movement' }).click();
  await canvas.scrollIntoViewIfNeeded();
  const paused = await pixels();
  await page.waitForTimeout(250);
  expect(await pixels()).toBe(paused);
  await page.getByRole('button', { name: 'Play movement' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await canvas.scrollIntoViewIfNeeded();
  const reduced = await pixels();
  await page.waitForTimeout(250);
  expect(await pixels()).toBe(reduced);
  expect((await page.request.get('/hantu-codex/painted/characters-painted.zip')).ok()).toBeTruthy();
  expect(await page.getByRole('button', { name: '3D model', exact: true }).count()).toBe(0);
  expect(modelRequests).toEqual([]);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
  await page.screenshot({ path: info.outputPath('pixel-workshop.png') });
  if (info.project.name === 'desktop') {
    await page.setViewportSize({ width: 1050, height: 930 });
    await page.setContent(
      '<body style="margin:0;background:#182137;color:#f2dfb8;font-family:serif"><main style="display:grid;grid-template-columns:repeat(5,192px);gap:16px;padding:16px">' +
        manifest.characters
          .map(
            (c) =>
              '<article><div style="width:192px;height:256px;background-size:1536px 1536px;background-image:url(http://127.0.0.1:4173/hantu-codex/painted/' +
              c.image +
              ');"></div><p style="margin:4px;text-align:center">' +
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
    await page.screenshot({ path: info.outputPath('all-pixel-characters.png') });
  }
});
