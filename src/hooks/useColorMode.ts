import { useCallback, useState } from 'react';

export type ColorMode = 'light' | 'dark';

const STORAGE_KEY = 'dc:mode';

// Read the mode the inline boot script (index.html) already applied to <html>.
function currentMode(): ColorMode {
  if (typeof document !== 'undefined') {
    const m = document.documentElement.dataset.mode;
    if (m === 'light' || m === 'dark') return m;
  }
  return 'dark';
}

// Shell light/dark mode. The actual colors switch via CSS vars keyed on
// <html data-mode>, so toggling just flips the attribute + persists it; no
// other component needs the value.
export function useColorMode(): [ColorMode, () => void] {
  const [mode, setMode] = useState<ColorMode>(currentMode);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next: ColorMode = prev === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') document.documentElement.dataset.mode = next;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage unavailable — ignore */
      }
      return next;
    });
  }, []);

  return [mode, toggle];
}
