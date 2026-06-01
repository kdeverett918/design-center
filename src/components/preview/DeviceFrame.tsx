import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { DeviceMode } from '../../preview/previewConfig';

const DEVICE_WIDTH: Record<DeviceMode, number> = {
  desktop: 1280,
  tablet: 834,
  mobile: 390,
};

interface DeviceFrameProps {
  mode: DeviceMode;
  /** Fixed pane height in px, or 'fill' to measure the parent. */
  height: number | 'fill';
  children: ReactNode;
}

// Renders children at the device's true base width, then scales the whole thing
// down to fit the available pane width — so a real desktop layout is visible
// inside a narrow preview pane. The scaled element scrolls internally.
export default function DeviceFrame({ mode, height, children }: DeviceFrameProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const base = DEVICE_WIDTH[mode];
  const paneHeight = height === 'fill' ? size.h : height;
  // Never upscale past 1; mobile/tablet sit centered with side gutters.
  const target = mode === 'desktop' ? size.w : Math.min(size.w, base);
  const scale = size.w > 0 ? Math.min(target / base, 1) : 1;
  const innerHeight = scale > 0 ? paneHeight / scale : paneHeight;

  return (
    <div
      ref={outerRef}
      className="relative w-full overflow-hidden bg-shell-base"
      style={height === 'fill' ? { height: '100%' } : { height }}
    >
      <div
        className="absolute left-1/2 top-0 overflow-y-auto scrollbar-thin"
        style={{
          width: base,
          height: innerHeight,
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {children}
      </div>
    </div>
  );
}
