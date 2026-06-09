import { expect, test } from '@playwright/test';

// v2.0 feature coverage: guided quiz, gallery search/filters, favorites notes,
// shortlist share links, and the new landing/SEO chrome.
test.describe('Guided quiz', () => {
  test('full happy path: 5 answers → 3 recommendations with reasoning', async ({ page }) => {
    await page.goto('/start');
    await expect(page.getByRole('heading', { name: /five questions/i })).toBeVisible();

    // Q1 industry (auto-advances)
    await page.getByRole('button', { name: /healthcare & therapy/i }).click();
    // Q2 vibes (multi-select + Next)
    await page.getByRole('button', { name: /^calm$/i }).click();
    await page.getByRole('button', { name: /^trustworthy$/i }).click();
    await page.getByRole('button', { name: /^next$/i }).click();
    // Q3 scheme, Q4 energy, Q5 density (auto-advance)
    await page.getByRole('button', { name: /bright & airy/i }).click();
    await page.getByRole('button', { name: /calm & steady/i }).click();
    await page.getByRole('button', { name: /minimal & clean/i }).click();

    await expect(page.getByRole('heading', { name: /your shortlist, decided/i })).toBeVisible();
    await expect(page.getByText(/picked because/i).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /start from this/i })).toHaveCount(3);
  });

  test('"Start from this" seeds the mood board', async ({ page }) => {
    await page.goto('/start');
    await page.getByRole('button', { name: /education & kids/i }).click();
    await page.getByRole('button', { name: /^playful$/i }).click();
    await page.getByRole('button', { name: /^next$/i }).click();
    await page.getByRole('button', { name: /surprise me/i }).click();
    // Option cards' accessible names include their hint text — match loosely.
    await page.getByRole('button', { name: /energetic/i }).click();
    await page.getByRole('button', { name: /decorative & expressive/i }).click();
    await page.getByRole('link', { name: /start from this/i }).first().click();
    await expect(page).toHaveURL(/\/\?b=/);
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

  test('quiz shows the live narrowing rail on desktop', async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), 'rail is intentionally hidden below lg');
    await page.goto('/start');
    await expect(page.getByText(/still in the running/i)).toBeVisible();
    await page.getByRole('button', { name: /healthcare & therapy/i }).click();
    await expect(page.getByText(/currently leading/i)).toBeVisible();
  });
});

test.describe('Mood board dropdown pickers', () => {
  test('palette dropdown re-themes the board', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /^color palette/i }).click();
    await page.getByRole('option', { name: /^noir/i }).click();
    // The menu closes on pick and the live board reflects the new palette.
    await expect(page.getByRole('option', { name: /^noir/i })).toHaveCount(0);
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
    await page.goto('/start');
    await expect(page).toHaveTitle(/find your style/i);
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
