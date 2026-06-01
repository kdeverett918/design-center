import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface ScaledFrameProps {
  /** Width the children are rendered at before scaling down to fit. */
  baseWidth?: number;
  /** Visible thumbnail height in px. */
  height: number;
  children: ReactNode;
}

// Renders children at a realistic page width, then scales the whole thing down
// to fit the card — a true thumbnail of the actual themed element (no abstract
// wireframes). Crops to `height` from the top, like a screenshot.
export default function ScaledFrame({ baseWidth = 860, height, children }: ScaledFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = w > 0 ? w / baseWidth : 1;

  return (
    <div ref={ref} className="relative w-full overflow-hidden" style={{ height }}>
      <div
        className="origin-top-left"
        style={{ width: baseWidth, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
