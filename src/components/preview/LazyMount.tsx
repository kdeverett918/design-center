import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface LazyMountProps {
  /** Reserved height so the placeholder doesn't collapse before mount. */
  height: number;
  children: ReactNode;
}

// Defers rendering heavy children (a full themed, scaled preview) until the
// element is near the viewport — keeps the Layouts grid snappy with 30+ live
// thumbnails. Once shown, it stays mounted.
export default function LazyMount({ height, children }: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  // With no IntersectionObserver available, render immediately.
  const [show, setShow] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (show || typeof IntersectionObserver === 'undefined') return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setShow(true);
      },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show]);

  return (
    <div ref={ref} style={{ minHeight: height }}>
      {show ? children : null}
    </div>
  );
}
