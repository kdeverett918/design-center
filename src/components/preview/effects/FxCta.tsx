import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { m as motion, useTransform } from 'framer-motion';
import { useFx } from '../../../preview/effectsRuntime';
import { usePointerField } from './usePointerField';

const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v));

// Wraps a primary CTA with the selected hover/continuous treatments:
// magnetic pull, pop scale, token pulse, shine sweep — plus the one-shot
// confetti burst on mount when chosen. Renders children unchanged when no
// CTA effect is active.
export default function FxCta({ children }: { children: ReactNode }) {
  const fx = useFx();
  const ref = useRef<HTMLSpanElement>(null);
  const field = usePointerField({ stiffness: 240, damping: 18 });
  const mx = useTransform(field.sx, (v) => clamp(v * 0.3, 7));
  const my = useTransform(field.sy, (v) => clamp(v * 0.3, 7));

  const { magnetic, popScale, pulse, shine } = fx.cta;
  const wantsWrap = magnetic || popScale || pulse || shine || fx.confetti || fx.card.lift;
  if (!wantsWrap) return <>{children}</>;

  return (
    <motion.span
      ref={ref}
      className={`relative inline-block ${pulse ? 'fx-cta-pulse rounded-xl' : ''} ${
        shine ? 'fx-shine overflow-hidden rounded-xl' : ''
      } ${fx.card.lift && !magnetic ? 'fx-lift' : ''}`}
      style={magnetic ? { x: mx, y: my } : undefined}
      whileHover={popScale ? { scale: 1.07 } : undefined}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      onPointerMove={magnetic ? (e) => ref.current && field.trackCentered(e, ref.current) : undefined}
      onPointerLeave={
        magnetic
          ? () => {
              field.x.set(0);
              field.y.set(0);
            }
          : undefined
      }
    >
      {children}
      {fx.confetti && <ConfettiBurst />}
    </motion.span>
  );
}

// ~14 token-colored particles spraying once from the CTA on mount.
function ConfettiBurst() {
  const [alive, setAlive] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setAlive(false), 1100);
    return () => window.clearTimeout(t);
  }, []);
  if (!alive) return null;
  const colors = ['bg-primary', 'bg-secondary', 'bg-accent'];
  const parts = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    const dist = 46 + (i % 3) * 22;
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 18,
      cls: colors[i % 3]!,
      rot: (i % 2 ? 1 : -1) * (120 + i * 14),
      delay: (i % 4) * 0.03,
    };
  });
  return (
    <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-10">
      {parts.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute h-1.5 w-2.5 rounded-[2px] ${p.cls}`}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rot, scale: 0.7 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: p.delay }}
        />
      ))}
    </span>
  );
}
