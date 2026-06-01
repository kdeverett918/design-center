import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FavoritesProvider from './FavoritesProvider';
import { favKey, useFavorites } from './favoritesContext';

function Probe() {
  const { has, toggle, ids, count, clear } = useFavorites();
  return (
    <div>
      <span data-testid="count">{count}</span>
      <span data-testid="has-theme">{String(has('theme', 'obsidian'))}</span>
      <span data-testid="palette-ids">{ids('palette').join(',')}</span>
      <button onClick={() => toggle('theme', 'obsidian')}>theme</button>
      <button onClick={() => toggle('palette', 'reef')}>palette-reef</button>
      <button onClick={() => toggle('palette', 'meridian')}>palette-meridian</button>
      <button onClick={() => clear()}>clear</button>
    </div>
  );
}

describe('favKey', () => {
  it('namespaces kind and id', () => {
    expect(favKey('theme', 'obsidian')).toBe('theme:obsidian');
    expect(favKey('palette', 'reef')).toBe('palette:reef');
  });
});

describe('useFavorites within FavoritesProvider', () => {
  it('toggles add and remove, tracking count and has()', async () => {
    const user = userEvent.setup();
    render(
      <FavoritesProvider>
        <Probe />
      </FavoritesProvider>,
    );

    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('has-theme').textContent).toBe('false');

    await user.click(screen.getByText('theme'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('has-theme').textContent).toBe('true');

    await user.click(screen.getByText('theme'));
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('has-theme').textContent).toBe('false');
  });

  it('ids(kind) returns only that kind, by id', async () => {
    const user = userEvent.setup();
    render(
      <FavoritesProvider>
        <Probe />
      </FavoritesProvider>,
    );

    await user.click(screen.getByText('palette-reef'));
    await user.click(screen.getByText('palette-meridian'));
    await user.click(screen.getByText('theme'));

    expect(screen.getByTestId('count').textContent).toBe('3');
    const paletteIds = screen.getByTestId('palette-ids').textContent!.split(',').sort();
    expect(paletteIds).toEqual(['meridian', 'reef']);
  });

  it('clear() empties the whole shortlist', async () => {
    const user = userEvent.setup();
    render(
      <FavoritesProvider>
        <Probe />
      </FavoritesProvider>,
    );

    await user.click(screen.getByText('palette-reef'));
    await user.click(screen.getByText('theme'));
    expect(screen.getByTestId('count').textContent).toBe('2');

    await user.click(screen.getByText('clear'));
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('palette-ids').textContent).toBe('');
  });

  it('persists across remounts via localStorage', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <FavoritesProvider>
        <Probe />
      </FavoritesProvider>,
    );
    await user.click(screen.getByText('palette-reef'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    unmount();

    // Fresh provider hydrates from the persisted state.
    render(
      <FavoritesProvider>
        <Probe />
      </FavoritesProvider>,
    );
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('palette-ids').textContent).toBe('reef');
  });

  it('throws when used outside a provider', () => {
    expect(() => render(<Probe />)).toThrow(/within <FavoritesProvider>/);
  });
});
