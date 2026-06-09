import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

// Fires true once when the element first approaches the viewport, then stays
// true. Used to defer per-card work (e.g. Google Fonts requests) until a card
// is actually about to be seen. No IntersectionObserver → treat as visible.
export function useInViewOnce(ref: RefObject<Element | null>, rootMargin = '300px'): boolean {
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setInView(true);
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, ref, rootMargin]);

  return inView;
}
