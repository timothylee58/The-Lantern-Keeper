import { test, expect } from '@playwright/test';
test('cinematic, village, playable expedition, codex, secret and finale', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/hantu-codex/?debug');
  await expect(page.getByRole('heading', { name: /After the rain/ })).toBeVisible();
  await page.getByRole('button', { name: 'Skip cinematic · Begin your story' }).click();
  await expect(page.getByRole('heading', { name: /Small kindnesses/ })).toBeVisible();
  await page.getByRole('button', { name: 'Mei Lin, needs your help' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /Show the whole message/ }).click();
  await page.getByRole('button', { name: /Let’s help/ }).click();
  await expect(page.getByRole('heading', { name: 'Lantern panels' })).toBeVisible();
  await page.getByRole('button', { name: 'Enter the woodland' }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page
    .getByRole('button', { name: 'Move right', exact: true })
    .dispatchEvent('pointerdown', { pointerId: 1 });
  await page.waitForTimeout(350);
  await page
    .getByRole('button', { name: 'Move right', exact: true })
    .dispatchEvent('pointerup', { pointerId: 1 });
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A quiet moment.' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep exploring' }).click();
  await page.getByRole('button', { name: 'Hantu', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search spirits' }).fill('Langsuan');
  await expect(page.getByRole('heading', { name: 'Langsuir', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Langsuir.*keeper of the canopy/i }).click();
  await expect(page.getByRole('tab', { name: 'Folklore Notes' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByText(/not presented here as a verified regional name/)).toBeVisible();
  await page.getByRole('button', { name: 'Close record' }).click();
  await page.getByRole('button', { name: 'Village', exact: true }).click();
  for (let i = 0; i < 3; i++)
    await page.getByRole('button', { name: 'Tap the curious wooden spoon' }).click();
  await expect(page.getByRole('heading', { name: 'A spoonful of rhythm.' })).toBeVisible();
  await page.getByRole('button', { name: 'Save one for the neighbors' }).click();
  await page.getByRole('button', { name: 'Grant all lanterns' }).click();
  await page.getByRole('button', { name: 'Go to finale' }).click();
  await expect(page.getByRole('heading', { name: /Welcome home/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: /Welcome home/ })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  expect(errors).toEqual([]);
});
test('pattern expedition completes through actual visible controls', async ({ page }) => {
  await page.goto('/hantu-codex/expedition/daniel/');
  await page.getByRole('button', { name: 'Enter the woodland' }).click();
  for (const seq of [
    [3, 2, 2],
    [3, 2, 2, 1],
    [3, 2, 2, 1, 1],
  ]) {
    await expect(page.getByRole('button', { name: '1 ○ Circle' })).toBeEnabled();
    for (const i of seq) {
      await page
        .getByRole('button', {
          name: ['1 ○ Circle', '2 △ Triangle', '3 □ Square', '4 ＋ Cross'][i],
        })
        .click();
      await page.waitForTimeout(100);
    }
  }
  await expect(page.getByText('Daniel’s lantern is glowing.')).toBeVisible();
  await page.getByRole('button', { name: 'Open your codex' }).click();
  await expect(page.getByRole('tab', { name: 'Field Notes' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.getByRole('button', { name: 'Return to the village', exact: false }).last().click();
  await expect(page.getByRole('button', { name: 'Daniel, ready for the gathering' })).toBeVisible();
});

test('self-hosted fonts, character loops and mobile reading layouts', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/hantu-codex/characters/');
  await expect(page.locator('.character-view canvas')).toBeVisible();
  await expect(page.getByText('Folding a little friend…')).toHaveCount(0);
  for (const name of ['Walk', 'Wave', 'Celebrate', 'Idle']) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  }
  await page.getByRole('button', { name: 'Pause movement' }).click();
  await expect(page.getByRole('button', { name: 'Play movement' })).toBeVisible();
  await page.getByRole('button', { name: 'Toyol SPIRIT', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Toyol', exact: true })).toBeVisible();
  await expect(page.getByText('Folding a little friend…')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Animated GLB/ })).toHaveAttribute(
    'href',
    '/hantu-codex/models/toyol.glb',
  );
  await expect(page.getByRole('link', { name: /CAD-compatible DXF/ })).toHaveAttribute(
    'href',
    '/hantu-codex/models/toyol.dxf',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/hantu-codex/codex/');
  if (testInfo.project.name === 'mobile')
    expect(
      await page
        .locator('.spirit-grid')
        .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length),
    ).toBe(2);
  await page.goto('/hantu-codex/village/');
  await page.getByRole('button', { name: 'Farah, needs your help' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  if (testInfo.project.name === 'mobile') {
    const box = await page.getByRole('dialog').boundingBox();
    expect(Math.abs(box!.y + box!.height - 844)).toBeLessThan(3);
  }
  await page.getByRole('button', { name: 'Close conversation' }).click();
  await page.goto('/hantu-codex/journal/');
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    const vars = getComputedStyle(document.documentElement);
    return ['--font-fraunces', '--font-nunito', '--font-caveat'].map((v) =>
      vars.getPropertyValue(v),
    );
  });
  expect(fonts.every((f) => f.length > 0)).toBe(true);
  expect(
    await page.locator('.ari-note').evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(22);
  expect(
    await page
      .locator('.neighbor p')
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(14);
  expect(errors).toEqual([]);
});

test('Lantern Keeper retains its adventure and adds links and automatic looping music', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
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
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'A little light. A great adventure.' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore Hantu Codex' })).toHaveAttribute(
    'href',
    '/hantu-codex/',
  );
  await expect(page.getByRole('link', { name: 'Meet the Hantu characters' })).toHaveAttribute(
    'href',
    '/hantu-codex/characters/',
  );
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'true');
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { musicTest: { contexts: AudioContext[] } }).musicTest.contexts
          .length,
    ),
  ).toBe(1);
  await page.getByRole('button', { name: 'Begin your story' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'true');
  await expect
    .poll(() =>
      page.evaluate(() => {
        const s = (
          window as unknown as {
            musicTest: { contexts: AudioContext[]; sources: AudioBufferSourceNode[] };
          }
        ).musicTest;
        return (
          s.sources.length > 0 &&
          s.sources[0].loop &&
          s.sources[0].loopEnd === 48 &&
          s.sources[0].buffer?.duration === 48 &&
          s.contexts[0].state === 'running'
        );
      }),
    )
    .toBe(true);
  await page.locator('.close').click();
  await page.locator('#sound').click();
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'false');
  expect(errors).toEqual([]);
});

test('original adventure completes and persists without affecting Hantu saves', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Begin your story' }).click();
  await page.getByRole('textbox', { name: 'YOUR KEEPER’S NAME' }).fill('Ari QA');
  await page.getByRole('button', { name: 'Step into the valley' }).click();
  for (let i = 0; i < 6; i++) {
    await page.locator('[data-choice="0"]').click();
    await page.locator('#next').click();
  }
  await expect(page.getByRole('heading', { name: 'You brought the light home.' })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Your story lives on' }).click();
  await expect(page.getByRole('heading', { name: 'You brought the light home.' })).toBeVisible();
  await page.getByRole('button', { name: 'Open your storybook' }).click();
  await expect(page.locator('.journal-entry')).toHaveCount(7);
  expect(await page.evaluate(() => localStorage.getItem('hantu-codex-v2'))).toBeNull();
});

test('artwork proportions and screenshots across both adventures', async ({ page }, testInfo) => {
  const failures: string[] = [];
  page.on('pageerror', (e) => failures.push(e.message));
  page.on('response', (r) => {
    if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
  });
  for (const [path, name] of [
    ['/', 'lantern-keeper'],
    ['/hantu-codex/', 'hantu-story'],
    ['/hantu-codex/codex/', 'hantu-collection'],
    ['/hantu-codex/journal/', 'hantu-journal'],
    ['/hantu-codex/characters/', 'hantu-characters'],
  ]) {
    await page.goto(path);
    // Streaming background music may keep a request open after the page is ready.
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const bad = await page
      .locator('img')
      .evaluateAll(
        (images) =>
          images.filter(
            (i) => !(i as HTMLImageElement).complete || !(i as HTMLImageElement).naturalWidth,
          ).length,
      );
    expect(bad).toBe(0);
    if (name === 'hantu-characters') {
      await page.locator('.model-stage').scrollIntoViewIfNeeded();
      await expect(page.locator('.character-view canvas')).toBeVisible();
      await expect(page.getByText('Folding a little friend…')).toHaveCount(0);
      expect(
        await page
          .locator('.character-view canvas')
          .evaluate((el) => getComputedStyle(el).objectFit),
      ).toBe('contain');
    }
    if (name === 'hantu-collection' || name === 'hantu-journal') {
      const atlas = page.locator('.spirit-art svg,.scene-art svg');
      expect(await atlas.count()).toBeGreaterThan(0);
      for (const svg of await atlas.all())
        await expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
    await page.screenshot({
      path: testInfo.outputPath(`${name}-${testInfo.project.name}.png`),
      fullPage: false,
    });
  }
  expect(failures).toEqual([]);
});
