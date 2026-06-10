import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, m as motion, useTransform } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useFx } from '../../../preview/effectsRuntime';
import { usePointerField } from './usePointerField';

// Feature-card shell with the selected hover effect. One transform owner per
// card (tilt > wobble > lift, enforced by the resolver); ripple stacks freely.
export default function FxCard({
  className,
  variants,
  children,
}: {
  className: string;
  /** Provided when stagger-reveal makes each card its own motion item. */
  variants?: Variants;
  children: ReactNode;
}) {
  const fx = useFx();
  const ref = useRef<HTMLDivElement>(null);
  const field = usePointerField({ stiffness: 250, damping: 20 });
  const rotateY = useTransform(field.sx, [-140, 140], [-10, 10]);
  const rotateX = useTransform(field.sy, [-90, 90], [7, -7]);
  const [ripples, setRipples] = useState<number[]>([]);
  const nextId = useRef(0);

  const { tilt, wobble, lift, ripple } = fx.card;
  const hoverCls = wobble ? 'fx-wobble' : lift ? 'fx-lift' : '';

  const onEnter = () => {
    if (!ripple) return;
    const id = nextId.current++;
    setRipples((rs) => [...rs, id]);
    window.setTimeout(() => setRipples((rs) => rs.filter((r) => r !== id)), 700);
  };

  const card = (
    <motion.div
      ref={ref}
      variants={variants}
      className={`relative ${ripple ? 'overflow-hidden' : ''} ${hoverCls} ${className}`}
      style={tilt ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined}
      onPointerMove={tilt ? (e) => ref.current && field.trackCentered(e, ref.current) : undefined}
      onPointerEnter={onEnter}
      onPointerLeave={
        tilt
          ? () => {
              field.x.set(0);
              field.y.set(0);
            }
          : undefined
      }
    >
      {children}
      {ripple && (
        <AnimatePresence>
          {ripples.map((id) => (
            <motion.span
              key={id}
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -ml-2 -mt-2 h-4 w-4 rounded-full border-2 border-primary"
              initial={{ scale: 0, opacity: 0.55 }}
              animate={{ scale: 9, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      )}
    </motion.div>
  );

  return tilt ? <div style={{ perspective: 700 }}>{card}</div> : card;
}

// Icon badge slot — spins on hover (sticker-spin) and/or floats (gentle-float).
export function FxIconBadge({ className, children }: { className: string; children: ReactNode }) {
  const fx = useFx();
  return (
    <motion.span
      className={`${className} ${fx.card.float ? 'motion-safe:animate-float' : ''}`}
      whileHover={fx.card.stickerSpin ? { rotate: 360, scale: 1.14 } : undefined}
      transition={{ type: 'spring', stiffness: 200, damping: 14 }}
    >
      {children}
    </motion.span>
  );
}
