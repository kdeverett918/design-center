import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FavoritesProvider from '../../contexts/FavoritesProvider';
import Gallery from './Gallery';
import { themes } from '../../data/themes';
import { animationPresets } from '../../data/animations';

function renderGallery() {
  return render(
    <FavoritesProvider>
      <Gallery activeThemeId={themes[0]!.id} onSelectTheme={vi.fn()} />
    </FavoritesProvider>,
  );
}

const tab = (name: RegExp) => screen.getByRole('button', { name });

describe('Gallery', () => {
  it('opens on the Themes tab showing the full theme count', () => {
    renderGallery();
    const themesTab = tab(/^Themes/);
    expect(themesTab).toHaveAttribute('aria-pressed', 'true');
    expect(within(themesTab).getByText(String(themes.length))).toBeInTheDocument();
  });

  it('switches Themes → Fonts and toggles aria-pressed', async () => {
    const user = userEvent.setup();
    renderGallery();
    const fontsTab = tab(/^Fonts/);
    expect(fontsTab).toHaveAttribute('aria-pressed', 'false');
    await user.click(fontsTab);
    expect(fontsTab).toHaveAttribute('aria-pressed', 'true');
    expect(tab(/^Themes/)).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows all animations on the Animations tab', async () => {
    const user = userEvent.setup();
    renderGallery();
    const animTab = tab(/^Animations/);
    await user.click(animTab);
    expect(within(animTab).getByText(String(animationPresets.length))).toBeInTheDocument();
    // Every preset renders an AnimationCard with a heading of its name.
    expect(screen.getByRole('heading', { name: 'Fade Up' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'View Transition' })).toBeInTheDocument();
  });

  it('a mood filter chip reduces the theme count', async () => {
    const user = userEvent.setup();
    renderGallery();
    const themesTab = tab(/^Themes/);
    const before = themes.length;

    // "playful" only applies to a subset of themes → count must shrink.
    const chip = screen.getByRole('button', { name: /^playful$/i });
    await user.click(chip);

    const playfulCount = themes.filter((t) => t.moods.includes('playful')).length;
    expect(playfulCount).toBeGreaterThan(0);
    expect(playfulCount).toBeLessThan(before);
    expect(within(themesTab).getByText(String(playfulCount))).toBeInTheDocument();
  });

  it('shows an empty state when filters match nothing, and clears it', async () => {
    const user = userEvent.setup();
    renderGallery();
    // No theme is both "playful" AND healthcare → this combination yields zero.
    expect(
      themes.filter((t) => t.moods.includes('playful') && t.industries.includes('healthcare')),
    ).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: /^playful$/i }));
    await user.click(screen.getByRole('button', { name: /^healthcare$/i }));

    expect(screen.getByText(/nothing matches those filters/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(screen.queryByText(/nothing matches those filters/i)).not.toBeInTheDocument();
  });
});
