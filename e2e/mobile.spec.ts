import { expect, test } from '@playwright/test';

// Mobile-viewport coverage. The shared behavioral suite in design-center.spec.ts
// already runs under BOTH the desktop-chrome and mobile-chrome projects, so core
// flows are exercised on mobile too. THIS file adds responsive-specific checks
// that only make sense on a small touch viewport, so the whole describe is
// skipped on the desktop project.
test.describe('Mobile viewport', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only responsive checks');

  const ROUTES = ['/', '/gallery', '/favorites'];

  // A page that overflows horizontally is the #1 mobile defect — assert the
  // document never scrolls sideways (1px tolerance for sub-pixel rounding).
  async function expectNoHorizontalScroll(page: import('@playwright/test').Page) {
    const { scrollW, clientW } = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(scrollW, `horizontal overflow: scrollWidth ${scrollW} > clientWidth ${clientW}`).toBeLessThanOrEqual(
      clientW + 1,
    );
  }

  for (const route of ROUTES) {
    test(`no horizontal overflow on ${route}`, async ({ page }) => {
      await page.goto(route);
      // Let fonts/images/layout settle.
      await page.waitForLoadState('networkidle');
      await expectNoHorizontalScroll(page);
    });
  }

  test('the nav rail navigates between routes on mobile', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Gallery' }).click();
    await expect(page).toHaveURL(/\/gallery$/);
    await expect(page.getByRole('heading', { name: /customize your unique design/i })).toBeVisible();

    // Labels collapse to icons on mobile but aria-labels keep the links reachable.
    await page.getByRole('link', { name: 'Mood board' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: /stop describing your dream website/i })).toBeVisible();
  });

  test('the shortlist link is reachable and reads as a colored CTA', async ({ page }) => {
    await page.goto('/');
    const shortlist = page.getByRole('link', { name: /shortlist/i });
    await expect(shortlist).toBeVisible();
    // info/sky solid fill (color-coded), not the old monochrome chrome.
    await expect(shortlist).toHaveClass(/bg-sky-600/);
    await shortlist.click();
    await expect(page).toHaveURL(/\/favorites$/);
  });

  test('the preview defaults to the mobile device frame', async ({ page }) => {
    await page.goto('/');
    // PreviewStage seeds device='mobile' when innerWidth < 768; the toggle reflects it.
    const mobileToggle = page.getByRole('button', { name: 'Mobile' }).first();
    await expect(mobileToggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('gallery tabs work and a theme card updates the preview on mobile', async ({ page }) => {
    await page.goto('/gallery');
    // Tabs render and switch.
    const fontsTab = page.getByRole('button', { name: /^Fonts/ });
    await fontsTab.click();
    await expect(fontsTab).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: /^Themes/ }).click();

    // Tapping a theme card re-themes the preview (its --color-bg changes).
    const previewScope = page.locator('[style*="translateX(-50%)"] [data-dark]').first();
    await expect(previewScope).toBeVisible();
    const before = await previewScope.evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--color-bg').trim(),
    );
    // The card's full label — a loose /obsidian/i would hit the hero montage's
    // "Feature the Obsidian mood" frame first.
    await page.getByRole('button', { name: /preview the obsidian theme/i }).click();
    await expect
      .poll(async () =>
        page
          .locator('[style*="translateX(-50%)"] [data-dark]')
          .first()
          .evaluate((el) => getComputedStyle(el).getPropertyValue('--color-bg').trim()),
      )
      .not.toBe(before);
  });

  test('the mood board is usable on mobile (Send is reachable + color-coded)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /stop describing your dream website/i })).toBeVisible();
    await expectNoHorizontalScroll(page);
    // Primary client action: Send → success/emerald, visible + enabled.
    const send = page.getByRole('button', { name: /send my selections/i });
    await expect(send).toBeVisible();
    await expect(send).toBeEnabled();
    await expect(send).toHaveClass(/bg-emerald-600/);
  });

  test('a deep-linked theme paints its hero image on mobile', async ({ page }) => {
    const failed: string[] = [];
    page.on('response', (r) => {
      if (r.url().includes('/theme-images/') && r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
    });
    await page.goto('/gallery?theme=sunnyside');
    await page.waitForLoadState('networkidle');
    const painted = await page.evaluate(() =>
      [...document.querySelectorAll('*')].some((el) =>
        /theme-images\/sunnyside/.test(getComputedStyle(el).backgroundImage || ''),
      ),
    );
    expect(painted, 'hero image should be painted for sunnyside on mobile').toBe(true);
    expect(failed, `theme-image 4xx/5xx: ${failed.join(', ')}`).toHaveLength(0);
  });
});
