import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m as motion, useSpring } from 'framer-motion';
import { useFx, anyCursor } from '../../../preview/effectsRuntime';
import { usePointerField } from './usePointerField';

// Full-page cursor effects for the live preview. Renders as a
// pointer-events-none overlay; pointer listeners attach to the parent wrapper
// (the relative div PreviewFrame puts around SamplePage), so the math covers
// the whole scrollable page and stays correct inside the scaled frame.
export default function CursorLayer() {
  const fx = useFx();
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const nextId = useRef(0);

  const field = usePointerField({ stiffness: 500, damping: 30 });
  // Laggier springs per effect, all driven from the same raw values.
  const followX = useSpring(field.x, { stiffness: 120, damping: 16 });
  const followY = useSpring(field.y, { stiffness: 120, damping: 16 });
  const spotX = useSpring(field.x, { stiffness: 350, damping: 26 });
  const spotY = useSpring(field.y, { stiffness: 350, damping: 26 });
  const lag1x = useSpring(field.x, { stiffness: 300, damping: 26 });
  const lag1y = useSpring(field.y, { stiffness: 300, damping: 26 });
  const lag2x = useSpring(lag1x, { stiffness: 220, damping: 26 });
  const lag2y = useSpring(lag1y, { stiffness: 220, damping: 26 });
  const lag3x = useSpring(lag2x, { stiffness: 160, damping: 26 });
  const lag3y = useSpring(lag2y, { stiffness: 160, damping: 26 });

  const wantRipple = fx.cursor.ripple;
  const hideCursor = fx.cursor.dot;

  useEffect(() => {
    const parent = rootRef.current?.parentElement;
    if (!parent || !anyCursor(fx)) return;

    const onMove = (e: PointerEvent) => field.track(e, parent);
    const onEnter = () => setActive(true);
    const onLeave = () => setActive(false);
    const onDown = (e: PointerEvent) => {
      if (!wantRipple) return;
      const rect = parent.getBoundingClientRect();
      const scale = parent.offsetWidth > 0 ? rect.width / parent.offsetWidth : 1;
      const id = nextId.current++;
      setRipples((rs) => [
        ...rs,
        { id, x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale },
      ]);
      window.setTimeout(() => setRipples((rs) => rs.filter((r) => r.id !== id)), 750);
    };

    parent.addEventListener('pointermove', onMove);
    parent.addEventListener('pointerenter', onEnter);
    parent.addEventListener('pointerleave', onLeave);
    parent.addEventListener('pointerdown', onDown);
    if (hideCursor) parent.style.cursor = 'none';
    return () => {
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerenter', onEnter);
      parent.removeEventListener('pointerleave', onLeave);
      parent.removeEventListener('pointerdown', onDown);
      if (hideCursor) parent.style.cursor = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- field fns are stable
  }, [fx, wantRipple, hideCursor]);

  if (!anyCursor(fx)) return null;

  const show = active ? 'opacity-100' : 'opacity-0';
  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {fx.cursor.spotlight && (
        <motion.span
          className={`absolute left-0 top-0 -ml-32 -mt-32 h-64 w-64 rounded-full transition-opacity duration-300 ${show}`}
          style={{
            x: spotX,
            y: spotY,
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 32%, transparent), transparent 65%)',
          }}
        />
      )}
      {fx.cursor.trail &&
        [
          { x: lag1x, y: lag1y, cls: 'h-2.5 w-2.5 bg-primary', o: 0.8 },
          { x: lag2x, y: lag2y, cls: 'h-2 w-2 bg-secondary', o: 0.6 },
          { x: lag3x, y: lag3y, cls: 'h-1.5 w-1.5 bg-accent', o: 0.4 },
        ].map((d, i) => (
          <motion.span
            key={i}
            className={`absolute left-0 top-0 -ml-1 -mt-1 rounded-full ${d.cls} transition-opacity duration-300 ${show}`}
            style={{ x: d.x, y: d.y, opacity: active ? d.o : 0 }}
          />
        ))}
      {fx.cursor.dot && (
        <>
          <motion.span
            className={`absolute left-0 top-0 -ml-4 -mt-4 h-8 w-8 rounded-full border-2 border-accent transition-opacity duration-300 ${show}`}
            style={{ x: field.sx, y: field.sy }}
          />
          <motion.span
            className={`absolute left-0 top-0 -ml-1 -mt-1 h-2 w-2 rounded-full bg-accent transition-opacity duration-300 ${show}`}
            style={{ x: field.x, y: field.y }}
          />
        </>
      )}
      {fx.cursor.follow && (
        <motion.span
          className={`absolute left-0 top-0 -ml-6 -mt-3 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold text-onAccent transition-opacity duration-300 ${show}`}
          style={{ x: followX, y: followY }}
        >
          you
        </motion.span>
      )}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="absolute rounded-full border-2 border-primary"
            style={{ left: r.x, top: r.y, marginLeft: -10, marginTop: -10, width: 20, height: 20 }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 7, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
