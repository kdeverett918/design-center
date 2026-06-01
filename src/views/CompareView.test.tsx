import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import FavoritesProvider from '../contexts/FavoritesProvider';
import CompareView from './CompareView';

function renderView(entry = '/compare?a=obsidian&b=stillwater') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <FavoritesProvider>
        <CompareView />
      </FavoritesProvider>
    </MemoryRouter>,
  );
}

describe('CompareView', () => {
  it('reflects the ?a / ?b params in the two selects and previews', () => {
    renderView();

    const selectA = screen.getByRole('combobox', { name: /theme for slot a/i });
    const selectB = screen.getByRole('combobox', { name: /theme for slot b/i });
    expect(selectA).toHaveValue('obsidian');
    expect(selectB).toHaveValue('stillwater');

    // Readouts match the param-driven themes.
    expect(screen.getByRole('heading', { name: 'Obsidian' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Stillwater' })).toBeInTheDocument();

    // Both previews mount a themed token scope (PreviewFrame's [data-dark] root).
    expect(document.querySelectorAll('[data-dark]').length).toBeGreaterThanOrEqual(2);
  });

  it('updates a slot when its select changes', async () => {
    const user = userEvent.setup();
    renderView();

    const selectA = screen.getByRole('combobox', { name: /theme for slot a/i });
    await user.selectOptions(selectA, 'vital');

    // The slot's readout label now reflects the chosen theme.
    expect(screen.getByRole('heading', { name: 'Vital' })).toBeInTheDocument();
    // Slot B is untouched.
    expect(screen.getByRole('heading', { name: 'Stillwater' })).toBeInTheDocument();
  });

  it('swaps the two slots', async () => {
    const user = userEvent.setup();
    renderView();

    const sectionA = screen
      .getByRole('combobox', { name: /theme for slot a/i })
      .closest('section')!;
    expect(within(sectionA).getByRole('heading', { name: 'Obsidian' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /swap/i }));

    expect(within(sectionA).getByRole('heading', { name: 'Stillwater' })).toBeInTheDocument();
  });
});
