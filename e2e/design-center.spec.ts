import { expect, test } from '@playwright/test';

test.describe('Design Center', () => {
  test('home loads the gallery', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /find the look that fits/i })).toBeVisible();
    // Themes tab is active by default.
    await expect(page.getByRole('button', { name: /^Themes/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('switches Themes → Fonts', async ({ page }) => {
    await page.goto('/');
    const fontsTab = page.getByRole('button', { name: /^Fonts/ });
    await fontsTab.click();
    await expect(fontsTab).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /^Themes/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('selecting a theme changes the preview background var', async ({ page }) => {
    await page.goto('/');

    // The preview frame carries the themed --color-bg custom property.
    const scope = page.locator('[data-dark]').first();
    await expect(scope).toBeVisible();
    const initial = await scope.evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--color-bg').trim(),
    );

    // Pick a different theme card (Obsidian is the dark one — guaranteed change).
    await page.getByRole('button', { name: /obsidian/i }).first().click();

    await expect
      .poll(async () =>
        page
          .locator('[data-dark]')
          .first()
          .evaluate((el) => getComputedStyle(el).getPropertyValue('--color-bg').trim()),
      )
      .not.toBe(initial);
  });

  test('a mood filter chip reduces the theme count', async ({ page }) => {
    await page.goto('/');
    const themesTab = page.getByRole('button', { name: /^Themes/ });
    const before = Number((await themesTab.innerText()).match(/\d+/)?.[0]);

    await page.getByRole('button', { name: /^playful$/i }).click();

    await expect
      .poll(async () => Number((await themesTab.innerText()).match(/\d+/)?.[0]))
      .toBeLessThan(before);
  });

  test('/moodboard loads and "Surprise me" changes the selection', async ({ page }) => {
    await page.goto('/moodboard');
    await expect(page.getByRole('heading', { name: /mix your own/i })).toBeVisible();

    const subtitle = page.getByText(/·/).first();
    const before = await subtitle.innerText();

    // Shuffle until the displayed selection differs (random, so retry a few times).
    let changed = false;
    for (let i = 0; i < 8 && !changed; i++) {
      await page.getByRole('button', { name: /surprise me/i }).click();
      const after = await subtitle.innerText();
      changed = after !== before;
    }
    expect(changed).toBe(true);
  });
});
