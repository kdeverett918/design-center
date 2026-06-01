import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useColorMode } from './useColorMode';

function Probe() {
  const [mode, toggle] = useColorMode();
  return (
    <button type="button" onClick={toggle}>
      {mode}
    </button>
  );
}

describe('useColorMode', () => {
  it('reads the current <html data-mode>, toggles, persists, and updates the attribute', async () => {
    document.documentElement.dataset.mode = 'dark';
    const user = userEvent.setup();
    render(<Probe />);
    const btn = screen.getByRole('button');

    expect(btn.textContent).toBe('dark');

    await user.click(btn);
    expect(btn.textContent).toBe('light');
    expect(document.documentElement.dataset.mode).toBe('light');
    expect(localStorage.getItem('dc:mode')).toBe('light');

    await user.click(btn);
    expect(btn.textContent).toBe('dark');
    expect(document.documentElement.dataset.mode).toBe('dark');
    expect(localStorage.getItem('dc:mode')).toBe('dark');
  });
});
