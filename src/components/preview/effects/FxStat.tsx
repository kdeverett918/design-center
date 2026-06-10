import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { useFx } from '../../../preview/effectsRuntime';

// Stat values tick up from zero when they scroll into view (count-up effect).
// Parses a leading number and re-attaches any suffix ("12k+" → 0→12 + "k+").
export default function FxStat({ value }: { value: string }) {
  const fx = useFx();
  if (!fx.countUp) return <>{value}</>;
  return <CountUpValue value={value} />;
}

function CountUpValue({ value }: { value: string }) {
  const match = /^([\d.]+)(.*)$/.exec(value);
  const target = match ? parseFloat(match[1]!) : NaN;
  const suffix = match?.[2] ?? '';
  const decimals = match && match[1]!.includes('.') ? match[1]!.split('.')[1]!.length : 0;

  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const mv = useMotionValue(0);
  const [n, setN] = useState(0);
  useMotionValueEvent(mv, 'change', (v) => setN(v));
  useEffect(() => {
    if (!inView || Number.isNaN(target)) return;
    const controls = animate(mv, target, { duration: 1.4, ease: 'easeOut' });
    return () => controls.stop();
  }, [inView, mv, target]);

  if (Number.isNaN(target)) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref} className="tabular-nums">
      {n.toFixed(decimals)}
      {suffix}
    </span>
  );
}
