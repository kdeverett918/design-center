import { expect, test } from '@playwright/test';

// Representative spread across the collections — one image per "family" so a
// regression in any imagery bucket trips a check without iterating all 42.
const REPRESENTATIVE_THEMES = ['maison', 'brutalist', 'launchpad', 'dispatch', 'sunnyside'];

test.describe('Design Center', () => {
  test('home loads the mood board landing page', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /build the design direction/i }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /surprise me/i })).toBeVisible();
  });

  test('gallery loads the theme library', async ({ page }) => {
    await page.goto('/gallery');
    await expect(
      page.getByRole('heading', { name: /customize your unique design/i }),
    ).toBeVisible();
    // Themes tab is active by default.
    await expect(page.getByRole('button', { name: /^Themes/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('switches Themes → Fonts', async ({ page }) => {
    await page.goto('/gallery');
    const fontsTab = page.getByRole('button', { name: /^Fonts/ });
    await fontsTab.click();
    await expect(fontsTab).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /^Themes/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('selecting a theme changes the preview background var', async ({ page }) => {
    await page.goto('/gallery');

    // The PREVIEW frame (right column) carries the active theme's --color-bg.
    // Many [data-dark] scopes exist (hero cluster + every theme card render in
    // their OWN fixed colors), so we must target the preview frame specifically:
    // it's the only [data-dark] nested inside DeviceFrame's scaled stage
    // (the element with the translateX(-50%) scale transform).
    const previewScope = page.locator('[style*="translateX(-50%)"] [data-dark]').first();
    await expect(previewScope).toBeVisible();
    const initial = await previewScope.evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--color-bg').trim(),
    );

    // Pick a different theme card (Obsidian is the dark one — guaranteed change).
    await page.getByRole('button', { name: /obsidian/i }).first().click();

    await expect
      .poll(async () =>
        previewScope.evaluate((el) =>
          getComputedStyle(el).getPropertyValue('--color-bg').trim(),
        ),
      )
      .not.toBe(initial);
  });

  // The mood FILTER chips were removed and replaced by a named *collections*
  // rail (All, Editorial, Kid-Friendly, …). Picking a collection narrows the
  // rendered theme cards; "All" shows every theme. We count the visible cards
  // directly because the Themes-tab badge always reports the full catalog size.
  test('a collection chip reduces the visible theme count', async ({ page }) => {
    await page.goto('/gallery');

    // Each ThemeCard renders exactly one hero thumbnail, so counting those is a
    // reliable proxy for "how many theme cards are on screen".
    const cards = page.locator('img[src^="/theme-images/"]');
    await expect(cards.first()).toBeVisible();
    const allCount = await cards.count();
    expect(allCount).toBeGreaterThan(10);

    // Kid-Friendly is a small curated set (5 themes) — guaranteed to be fewer.
    await page.getByRole('button', { name: /^Kid-Friendly$/ }).click();

    await expect.poll(async () => cards.count()).toBeLessThan(allCount);
    // sanity: the collection's description appears under the rail
    await expect(page.getByText(/bright, playful/i)).toBeVisible();
  });

  test('mood board "Surprise me" changes the selection', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /build the design direction/i })).toBeVisible();

    const subtitle = moodboardSubtitle(page);
    const before = await subtitle.innerText();

    // Shuffle until the displayed selection differs (random, so retry a few times).
    await expect
      .poll(
        async () => {
          await page.getByRole('button', { name: /surprise me/i }).click();
          return subtitle.innerText();
        },
        { timeout: 10_000 },
      )
      .not.toBe(before);
  });

  // ===========================================================================
  // Imagery is GLOBAL — every theme ships a /theme-images/<id>.webp.
  // ===========================================================================

  test('gallery renders a hero thumbnail for every theme (46)', async ({ page }) => {
    await page.goto('/gallery');
    const thumbs = page.locator('img[src^="/theme-images/"]');
    await expect(thumbs.first()).toBeVisible();
    // "All" collection is the default, so every catalogued theme is on screen.
    await expect.poll(async () => thumbs.count()).toBe(46);
  });

  test('no /theme-images asset 404s while browsing previews', async ({ page }) => {
    const broken: string[] = [];
    page.on('response', (res) => {
      const url = res.url();
      if (url.includes('/theme-images/') && res.status() >= 400) {
        broken.push(`${res.status()} ${url}`);
      }
    });

    await page.goto('/gallery');
    // Visit a spread of themed previews — the inline preview hero paints the
    // image (CSS background-image / <img>), which forces the real network load.
    for (const id of REPRESENTATIVE_THEMES) {
      await page.goto(`/gallery?theme=${id}`);
      const styled = page.locator(`[style*="/theme-images/${id}.webp"], img[src="/theme-images/${id}.webp"]`);
      await expect(styled.first()).toBeVisible();
    }

    expect(broken, `broken theme-images responses: ${broken.join(', ')}`).toHaveLength(0);
  });

  test('representative theme images resolve 200', async ({ request, baseURL }) => {
    for (const id of REPRESENTATIVE_THEMES) {
      const res = await request.get(`${baseURL}/theme-images/${id}.webp`);
      expect(res.status(), `/theme-images/${id}.webp`).toBe(200);
      const type = res.headers()['content-type'] ?? '';
      expect(type, `${id} content-type`).toMatch(/image|webp|octet-stream/);
    }
  });

  test('a deep-linked preview paints its theme hero image', async ({ page }) => {
    await page.goto('/gallery?theme=maison');
    // The preview hero renders the image as a CSS background or <img>.
    const hero = page.locator(
      '[style*="/theme-images/maison.webp"], img[src="/theme-images/maison.webp"]',
    );
    await expect(hero.first()).toBeVisible();
  });

  // ===========================================================================
  // Color-coded button system — present, visible, enabled, and NOT monochrome.
  // ===========================================================================

  test('gallery "Browse the library" is a visible primary CTA', async ({ page }) => {
    await page.goto('/gallery');
    const cta = page.getByRole('button', { name: /browse the library/i });
    await expect(cta).toBeVisible();
    await expect(cta).toBeEnabled();
  });

  test('moodboard send + surprise + reset buttons are color-coded & enabled', async ({ page }) => {
    await page.goto('/');

    const send = page.getByRole('button', { name: /send my selections/i });
    await send.scrollIntoViewIfNeeded();
    await expect(send).toBeVisible();
    await expect(send).toBeEnabled();
    // success tone == emerald-600 fill (not the old monochrome shell color)
    await expect(send).toHaveClass(/bg-emerald-600/);

    const surprise = page.getByRole('button', { name: /surprise me/i });
    await expect(surprise).toBeVisible();
    await expect(surprise).toBeEnabled();
    await expect(surprise).toHaveClass(/bg-violet-600/); // accent

    const reset = page.getByRole('button', { name: /start over/i });
    await expect(reset).toBeVisible();
    await expect(reset).toHaveClass(/bg-rose-600/); // danger

    // Confirm the computed fill is genuinely saturated, not a neutral shell gray.
    const bg = await send.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
  });

  test('favorites "Clear shortlist" reads as danger', async ({ page }) => {
    // The button only renders when the shortlist is non-empty — seed one star
    // before the FavoritesProvider hydrates from localStorage.
    await page.addInitScript(() => {
      try {
        localStorage.setItem('dc:favorites:v1', JSON.stringify(['theme:obsidian']));
      } catch {
        /* ignore */
      }
    });
    await page.goto('/favorites');

    const clear = page.getByRole('button', { name: /clear shortlist/i });
    await expect(clear).toBeVisible();
    await expect(clear).toBeEnabled();
    await expect(clear).toHaveClass(/bg-rose-600/); // danger tone
  });

  // ===========================================================================
  // Mood board "Start from a theme" quick-pick seeds the whole mix.
  // ===========================================================================

  test('moodboard "Start from a theme" reseeds the preview subtitle', async ({ page }) => {
    await page.goto('/');

    const subtitle = moodboardSubtitle(page);
    const before = await subtitle.innerText();

    // Launchpad uses a palette + font that differ from the default mix, so the
    // "Palette · Font" subtitle must change once it seeds the board.
    await page.getByRole('button', { name: /^Launchpad/ }).click();

    await expect.poll(async () => subtitle.innerText()).not.toBe(before);
    // The seeded quick-pick chip becomes the active selection.
    await expect(page.getByRole('button', { name: /^Launchpad/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  // ===========================================================================
  // Every route mounts with NO console errors / page errors.
  // ===========================================================================

  for (const path of ['/', '/gallery', '/favorites']) {
    test(`route ${path} loads with no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
      });

      await page.goto(path);
      // Wait for the lazy view chunk to mount (each view renders an <h1>).
      await expect(page.locator('h1').first()).toBeVisible();
      await page.waitForLoadState('networkidle');

      expect(errors, errors.join('\n')).toHaveLength(0);
    });
  }
});

// The PreviewStage subtitle on the mood board is the "<Palette> · <Font>" line
// directly under the "Custom mix" title. Scope to that block so we never grab a
// stray "·" elsewhere (footer, step indicator).
function moodboardSubtitle(page: import('@playwright/test').Page) {
  return page
    .locator('p.truncate', { hasText: '·' })
    .first();
}
