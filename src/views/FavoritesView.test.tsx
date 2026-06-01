import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import FavoritesProvider from '../contexts/FavoritesProvider';
import { useFavorites } from '../contexts/favoritesContext';
import FavoritesView from './FavoritesView';

function Harness() {
  const { toggle } = useFavorites();
  return (
    <>
      <button onClick={() => toggle('theme', 'obsidian')}>fav-theme</button>
      <button onClick={() => toggle('palette', 'reef')}>fav-palette</button>
      <FavoritesView />
    </>
  );
}

function renderView() {
  return render(
    <MemoryRouter>
      <FavoritesProvider>
        <Harness />
      </FavoritesProvider>
    </MemoryRouter>,
  );
}

describe('FavoritesView', () => {
  it('shows the empty state until something is starred', async () => {
    const user = userEvent.setup();
    renderView();

    expect(screen.getByText(/nothing starred yet/i)).toBeInTheDocument();

    await user.click(screen.getByText('fav-theme'));
    await user.click(screen.getByText('fav-palette'));

    expect(screen.queryByText(/nothing starred yet/i)).not.toBeInTheDocument();
    // grouped sections appear with the starred items
    expect(screen.getByRole('heading', { name: 'Obsidian' })).toBeInTheDocument();
    expect(screen.getByText(/2 items saved/i)).toBeInTheDocument();
  });

  it('clears the shortlist back to empty', async () => {
    const user = userEvent.setup();
    renderView();

    await user.click(screen.getByText('fav-theme'));
    expect(screen.queryByText(/nothing starred yet/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear shortlist/i }));
    expect(screen.getByText(/nothing starred yet/i)).toBeInTheDocument();
  });
});
