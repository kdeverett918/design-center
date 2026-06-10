import { useMotionValue, useSpring } from 'framer-motion';
import type { SpringOptions } from 'framer-motion';

// The preview renders inside ScaledFrame (transform: scale(s)). Pointer events
// arrive in SCREEN pixels; motion values position elements in CONTENT pixels.
// getBoundingClientRect() is the visual (scaled) box while offsetWidth is the
// layout (unscaled) width — their ratio recovers the scale factor.
export function toContentCoords(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number },
  offsetWidth: number,
): { x: number; y: number } {
  const scale = offsetWidth > 0 ? rect.width / offsetWidth : 1;
  return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
}

/**
 * Spring-smoothed pointer position in an element's CONTENT coordinate space.
 * Callers feed events via `track(e, el)`; `x/y` are raw, `sx/sy` are sprung.
 */
export function usePointerField(spring: SpringOptions = { stiffness: 300, damping: 25 }) {
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  const track = (e: { clientX: number; clientY: number }, el: HTMLElement) => {
    const p = toContentCoords(e.clientX, e.clientY, el.getBoundingClientRect(), el.offsetWidth);
    x.set(p.x);
    y.set(p.y);
  };

  // Center-relative variant (for tilt/magnet fields).
  const trackCentered = (e: { clientX: number; clientY: number }, el: HTMLElement) => {
    const p = toContentCoords(e.clientX, e.clientY, el.getBoundingClientRect(), el.offsetWidth);
    x.set(p.x - el.offsetWidth / 2);
    y.set(p.y - el.offsetHeight / 2);
  };

  return { x, y, sx, sy, track, trackCentered };
}
