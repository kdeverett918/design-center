import { useEffect, useRef } from 'react';
import { useMotionValue } from 'framer-motion';
import type { RefObject } from 'react';

// Hero background parallax: the layer drifts slower than the page scroll.
// Finds the DeviceFrame's scroll pane; no-ops in thumbnails (no scroll parent)
// and when disabled — the returned MotionValue just stays at 0.
export function useParallax(
  anchor: RefObject<HTMLElement | null>,
  enabled: boolean,
  factor = -0.12,
) {
  const y = useMotionValue(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const pane = anchor.current?.closest('.overflow-y-auto');
    if (!pane) return;
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => y.set(pane.scrollTop * factor));
    };
    pane.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      pane.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, [anchor, enabled, factor, y]);

  return y;
}
