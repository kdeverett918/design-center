import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

// Plays a bundled Lottie JSON once with the SVG renderer. lottie-web (light)
// is imported on demand, so it ships as its own lazy chunk and never weighs
// the main bundle. Reduced-motion users get nothing extra — the surrounding
// text already carries the meaning. Authored + verified in the lottie-lab
// Skottie player (C:\Users\Kristine\lottie-lab, text-to-lottie skill).
export default function LottieFlourish({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    let disposed = false;
    let anim: { destroy(): void } | null = null;
    (async () => {
      try {
        const [{ default: lottie }, data] = await Promise.all([
          import('lottie-web/build/player/lottie_light'),
          fetch(src).then((r) => r.json()),
        ]);
        if (disposed) return;
        anim = lottie.loadAnimation({
          container: el,
          renderer: 'svg',
          loop: false,
          autoplay: true,
          animationData: data,
        });
      } catch {
        if (!disposed) setFailed(true); // decorative — vanish quietly
      }
    })();
    return () => {
      disposed = true;
      anim?.destroy();
    };
  }, [src, reduced]);

  if (reduced || failed) return null;
  return <div ref={ref} aria-hidden="true" className={className} />;
}
