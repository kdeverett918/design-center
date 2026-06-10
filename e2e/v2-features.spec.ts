import { expect, test } from '@playwright/test';

// v2.x feature coverage: find-your-direction organizer, gallery search/filters,
// favorites notes, shortlist share links, and the landing/SEO chrome.
test.describe('Find your direction (mood board organizer)', () => {
  test('industry + vibe chips re-rank the seed tiles with reasons', async ({ page }) => {
    await page.goto('/');
    // Curated default set shows Quiet Signal first.
    await expect(page.getByRole('button', { name: /quiet signal/i })).toBeVisible();

    await page.getByRole('button', { name: /education & kids/i }).click();
    await page.getByRole('button', { name: /^playful$/i }).click();
    await expect(page.getByText(/ranked for you/i)).toBeVisible();
    // A playful education theme surfaces in the ranked tiles.
    await expect(page.getByRole('button', { name: /sunnyside/i })).toBeVisible();

    // Clear returns to the curated set.
    await page.getByRole('button', { name: /^clear$/i }).click();
    await expect(page.getByText(/ranked for you/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /quiet signal/i })).toBeVisible();
  });

  test('a ranked tile seeds the whole board', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /food & hospitality/i }).click();
    const tile = page.getByRole('button', { name: /terracotta/i }).first();
    await tile.click();
    await expect(tile).toHaveAttribute('aria-pressed', 'true');
    // The live board reflects the seeded theme's palette.
    await expect(page.getByText(/palette · sandstone/i)).toBeVisible();
  });

  test('/start permanently redirects home', async ({ page }) => {
    await page.goto('/start');
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { name: /stop describing your dream website/i }),
    ).toBeVisible();
  });
});

test.describe('Gallery search & filters', () => {
  test('search narrows themes and shows the result count', async ({ page }) => {
    await page.goto('/gallery');
    const search = page.getByRole('searchbox', { name: /search the library/i });
    await search.fill('quiet');
    await expect(page.getByTestId('result-count')).toBeVisible();
    await page.getByRole('button', { name: /clear all/i }).click();
    await expect(page.getByTestId('result-count')).toHaveCount(0);
  });

  test('an impossible mix shows the designed empty state', async ({ page }) => {
    await page.goto('/gallery');
    await page
      .getByRole('searchbox', { name: /search the library/i })
      .fill('zzz-no-such-theme-zzz');
    await expect(page.getByRole('heading', { name: /nothing matches that mix/i })).toBeVisible();
    await page.getByRole('button', { name: /clear filters/i }).click();
    await expect(page.getByRole('heading', { name: /nothing matches that mix/i })).toHaveCount(0);
  });

  test('mood chip filters the palette grid', async ({ page }) => {
    await page.goto('/gallery');
    await page.getByRole('button', { name: /^Palettes/ }).click();
    await page.getByRole('button', { name: /^playful$/i }).click();
    await expect(page.getByTestId('result-count')).toBeVisible();
    const countText = await page.getByTestId('result-count').textContent();
    expect(countText).toMatch(/^\d+ of 50 shown$/);
  });
});

test.describe('Favorites v2', () => {
  test('notes persist and shortlist share link round-trips', async ({ page, context }) => {
    await page.goto('/gallery');
    // Star the first theme card.
    await page.getByRole('button', { name: /add .* to favorites/i }).first().click();
    await page.goto('/favorites');
    await expect(page.getByRole('heading', { name: /your shortlist/i })).toBeVisible();

    // Add a note and confirm it survives a reload.
    const note = page.getByPlaceholder(/add a note/i).first();
    await note.fill('love this, but warmer');
    await page.reload();
    await expect(page.getByPlaceholder(/add a note/i).first()).toHaveValue(
      'love this, but warmer',
    );

    // Copy a share link, then open it in a fresh page with clean storage.
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: /share shortlist/i }).click();
    await expect(page.getByRole('button', { name: /link copied/i })).toBeVisible();
    const url = await page.evaluate(() => navigator.clipboard.readText());
    expect(url).toContain('/favorites?s=');

    const fresh = await context.newPage();
    await fresh.addInitScript(() => localStorage.clear());
    await fresh.goto(url);
    await expect(fresh.getByText(/someone shared a shortlist/i)).toBeVisible();
    await fresh.getByRole('button', { name: /add to my shortlist/i }).click();
    await expect(fresh.getByText(/1 item saved/i)).toBeVisible();
    await fresh.close();
  });
});

test.describe('Creative shell elements', () => {
  test('home ticker rail links every theme into the gallery', async ({ page }) => {
    await page.goto('/');
    const rail = page.getByLabel(/all 46 themes/i);
    await expect(rail).toBeVisible();
    await expect(rail.getByRole('link', { name: /stillwater/i })).toBeVisible();
  });

});

test.describe('Effects animate the live preview', () => {
  test('selected effects manifest inside the page (marquee band + headline intact)', async ({
    page,
  }) => {
    await page.goto('/');
    // Default board has the motion panel open; toggle the ticker band on.
    await page.getByRole('button', { name: 'Marquee Ticker' }).click();
    const band = page.locator('main').getByLabel(/speech therapy, telehealth/i);
    await expect(band).toBeVisible();
    // Entrance effects must never eat the headline text.
    await page.getByRole('button', { name: 'Typewriter' }).click();
    await expect(
      page.locator('main').getByText(/care that listens, built around you/i).first(),
    ).toBeVisible();
  });
});

test.describe('Per-design color mode', () => {
  test('preview scheme toggle flips the design without touching the shell', async ({ page }) => {
    await page.goto('/');
    // Default board (Quiet Signal) is a light design.
    const frame = page.locator('main [data-dark]').first();
    await expect(frame).toHaveAttribute('data-dark', 'false');
    const shellMode = await page.evaluate(() => document.documentElement.dataset.mode);

    await page.getByRole('button', { name: 'Dark mode preview' }).click();
    await expect(frame).toHaveAttribute('data-dark', 'true');
    // The studio shell did not change — only the previewed design did.
    expect(await page.evaluate(() => document.documentElement.dataset.mode)).toBe(shellMode);

    // The brief records the choice (also present in the hidden print copy).
    await expect(page.getByText(/dark variant \(derived\)/i).first()).toBeVisible();

    await page.getByRole('button', { name: 'As designed' }).click();
    await expect(frame).toHaveAttribute('data-dark', 'false');
  });
});

test.describe('Mood board dropdown pickers', () => {
  test('palette dropdown re-themes the board', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /^color palette/i }).click();
    // Featured rows are numbered, so the accessible name is e.g. "07 Noir Dark".
    await page.getByRole('option', { name: /noir/i }).click();
    // The menu closes on pick and the live board reflects the new palette.
    await expect(page.getByRole('option', { name: /noir/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /color palette: noir/i })).toBeVisible();
    await expect(page.getByText(/palette · noir/i)).toBeVisible();
  });

  test('type dropdown closes on Escape without changing the pick', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: /^type pairing/i });
    const before = await trigger.getAttribute('aria-label');
    await trigger.click();
    await expect(page.getByRole('listbox', { name: /type pairing/i })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox', { name: /type pairing/i })).toHaveCount(0);
    await expect(trigger).toHaveAttribute('aria-label', before!);
  });
});

test.describe('v2 chrome & SEO', () => {
  test('per-route titles update', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page).toHaveTitle(/theme gallery/i);
    await page.goto('/favorites');
    await expect(page).toHaveTitle(/your shortlist/i);
  });

  test('footer carries the studio CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /visit thetechslp\.com/i })).toBeVisible();
  });

  test('how-it-works strip renders all four steps', async ({ page }) => {
    await page.goto('/');
    for (const step of ['Start from a style', 'Make it yours', 'Star what you love', 'Send the brief']) {
      await expect(page.getByRole('heading', { name: step })).toBeVisible();
    }
  });
});
