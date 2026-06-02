import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FavoritesProvider from '../../contexts/FavoritesProvider';
import Gallery from './Gallery';
import { themes } from '../../data/themes';
import { animationPresets } from '../../data/animations';
import { collectionById, collections } from '../../data/collections';
import { configForTheme } from '../../preview/previewConfig';

function renderGallery() {
  return render(
    <FavoritesProvider>
      <Gallery
        activeThemeId={themes[0]!.id}
        onSelectTheme={vi.fn()}
        config={configForTheme(themes[0]!)}
        onApplyLayout={vi.fn()}
      />
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

  it('renders the curated collection rail on the Themes tab', () => {
    renderGallery();
    // "All" plus one chip per collection.
    expect(screen.getByRole('button', { name: /^All$/ })).toBeInTheDocument();
    for (const c of collections) {
      expect(screen.getByRole('button', { name: c.name })).toBeInTheDocument();
    }
  });

  it('selecting a collection narrows the themes shown to that set', async () => {
    const user = userEvent.setup();
    renderGallery();
    const editorial = collectionById('editorial')!;
    await user.click(screen.getByRole('button', { name: editorial.name }));

    // The collection's description caption appears.
    expect(screen.getByText(editorial.description)).toBeInTheDocument();
    // Only the collection's themes have a preview card (one button per theme).
    for (const id of editorial.themeIds) {
      const theme = themes.find((t) => t.id === id)!;
      expect(
        screen.getByRole('button', { name: new RegExp(`Preview the ${theme.name} theme`) }),
      ).toBeInTheDocument();
    }
    // A theme outside the editorial collection is not shown.
    expect(
      screen.queryByRole('button', { name: /Preview the Stillwater theme/ }),
    ).not.toBeInTheDocument();
  });
});
