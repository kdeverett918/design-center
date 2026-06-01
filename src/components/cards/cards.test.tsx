import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import FavoritesProvider from '../../contexts/FavoritesProvider';
import FavoriteStar from './FavoriteStar';
import PaletteCard from './PaletteCard';
import AnimationCard from './AnimationCard';
import { paletteById } from '../../data/palettes';
import { animationById } from '../../data/animations';

function withFavorites(ui: ReactElement) {
  return render(<FavoritesProvider>{ui}</FavoritesProvider>);
}

describe('FavoriteStar', () => {
  it('toggles aria-pressed inside a provider', async () => {
    const user = userEvent.setup();
    withFavorites(<FavoriteStar kind="theme" id="obsidian" label="Obsidian" />);

    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(btn).toHaveAccessibleName(/add obsidian to favorites/i);

    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(btn).toHaveAccessibleName(/remove obsidian from favorites/i);

    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('PaletteCard', () => {
  const meridian = paletteById('meridian')!;

  it('renders the palette name and every swatch hex as a label', () => {
    withFavorites(<PaletteCard palette={meridian} />);
    expect(screen.getByText('Meridian')).toBeInTheDocument();
    // Swatch buttons expose "Role #HEX" accessible names.
    expect(
      screen.getByRole('button', { name: new RegExp(meridian.colors.primary, 'i') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: new RegExp(meridian.colors.accent, 'i') }),
    ).toBeInTheDocument();
  });

  it('reveals the hex text on hover', async () => {
    const user = userEvent.setup();
    withFavorites(<PaletteCard palette={meridian} />);
    const swatch = screen.getByRole('button', {
      name: new RegExp(`primary ${meridian.colors.primary}`, 'i'),
    });
    const label = within(swatch).getByText(meridian.colors.primary);
    expect(label.className).toContain('opacity-0');
    await user.hover(swatch);
    expect(label.className).toContain('opacity-100');
  });
});

describe('AnimationCard', () => {
  it('shows spec labels (category, easing, library) and intensity', () => {
    const preset = animationById('fade-up')!;
    withFavorites(<AnimationCard preset={preset} />);
    // "Fade Up" also appears inside the live demo, so scope to the card heading.
    expect(screen.getByRole('heading', { name: 'Fade Up' })).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Easing')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText(preset.category)).toBeInTheDocument();
    expect(screen.getByText(preset.easing)).toBeInTheDocument();
    expect(screen.getByText(preset.intensity)).toBeInTheDocument();
  });

  it('formats sub-second and multi-second durations', () => {
    withFavorites(<AnimationCard preset={animationById('fade-up')!} />);
    expect(screen.getByText('500ms')).toBeInTheDocument();

    withFavorites(<AnimationCard preset={animationById('count-up')!} />);
    expect(screen.getByText('1.5s')).toBeInTheDocument();

    withFavorites(<AnimationCard preset={animationById('parallax-layer')!} />);
    expect(screen.getByText('scroll-driven')).toBeInTheDocument();
  });
});
