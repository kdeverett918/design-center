import { useEffect, useId, useState } from 'react';
import type { ReactElement } from 'react';
import { animate, m as motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { useFx } from '../../../preview/effectsRuntime';

const EXPO = [0.16, 1, 0.3, 1] as const;
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@$';

// The hero headline with the selected entrance effect applied ONCE on mount
// (the preview re-mounts on replay/selection, which re-runs it). With no
// headline effect resolved this renders a plain h1 — thumbnails stay inert.
export default function FxHeadline({
  className,
  children,
}: {
  className: string;
  children: string;
}) {
  const fx = useFx();
  const text = children;
  const shimmer = fx.headline.shimmer ? ' fx-shimmer' : '';
  const glitch = fx.headline.glitch ? ' fx-glitch' : '';
  const cls = className + shimmer + glitch;
  const dataText = fx.headline.glitch ? text : undefined;
  // The gradient-trace underline rides along with whichever entrance won.
  const withTrace = (head: ReactElement) =>
    fx.headline.trace ? (
      <>
        {head}
        <TraceUnderline />
      </>
    ) : (
      head
    );

  if (fx.headlineFx === 'typewriter') {
    return withTrace(<TypeOnce className={cls} text={text} dataText={dataText} />);
  }
  if (fx.headlineFx === 'text-scramble') {
    return withTrace(<ScrambleOnce className={cls} text={text} dataText={dataText} />);
  }
  if (fx.headlineFx === 'kinetic-type') {
    return withTrace(
      <h1 className={cls} data-text={dataText}>
        {text.split(' ').map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            className="inline-block whitespace-pre"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22, delay: i * 0.11 }}
          >
            {word}
            {i < text.split(' ').length - 1 ? ' ' : ''}
          </motion.span>
        ))}
      </h1>,
    );
  }
  if (fx.headlineFx === 'reveal-mask') {
    return withTrace(
      <motion.h1
        className={cls}
        data-text={dataText}
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: 'inset(0 0% 0 0)' }}
        transition={{ duration: 0.9, ease: EXPO }}
      >
        {text}
      </motion.h1>,
    );
  }
  if (fx.headlineFx === 'poster-reveal') {
    return withTrace(
      <span className="block overflow-hidden">
        <motion.h1
          className={cls}
          data-text={dataText}
          initial={{ y: '105%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, ease: EXPO }}
        >
          {text}
        </motion.h1>
      </span>,
    );
  }
  return withTrace(
    <h1 className={cls} data-text={dataText}>
      {text}
    </h1>,
  );
}

// Apple-keynote-style flourish: a stroked path draws itself in under the
// headline, painted with a primary→accent→secondary gradient from the live
// tokens. pathLength + round caps make the leading edge read like a pen.
// text-align is inherited, so the wrapper centers wherever the headline does.
function TraceUnderline() {
  const gradId = useId();
  return (
    <span aria-hidden="true" className="block leading-none">
      <svg viewBox="0 0 320 26" fill="none" className="mt-3 inline-block h-5 w-48 max-w-full">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: 'var(--color-primary)' }} />
            <stop offset="0.55" style={{ stopColor: 'var(--color-accent)' }} />
            <stop offset="1" style={{ stopColor: 'var(--color-secondary)' }} />
          </linearGradient>
        </defs>
        <motion.path
          d="M5 17 C 56 5, 112 23, 168 13 S 268 7, 315 13"
          stroke={`url(#${gradId})`}
          strokeWidth="5.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 1.2, ease: 'easeInOut', delay: 0.25 },
            opacity: { duration: 0.2, delay: 0.25 },
          }}
        />
      </svg>
    </span>
  );
}

function TypeOnce({
  className,
  text,
  dataText,
}: {
  className: string;
  text: string;
  dataText?: string;
}) {
  const mv = useMotionValue(0);
  const [count, setCount] = useState(0);
  useMotionValueEvent(mv, 'change', (v) => setCount(Math.round(v)));
  useEffect(() => {
    const controls = animate(mv, text.length, {
      duration: Math.min(0.05 * text.length, 2.4),
      ease: 'linear',
    });
    return () => controls.stop();
  }, [mv, text]);
  const done = count >= text.length;
  return (
    <h1 className={className} data-text={dataText} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      {!done && (
        <motion.span
          aria-hidden="true"
          className="ml-1 inline-block h-[0.85em] w-[3px] translate-y-[0.08em] bg-primary"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.7, ease: 'linear', repeat: Infinity }}
        />
      )}
    </h1>
  );
}

function ScrambleOnce({
  className,
  text,
  dataText,
}: {
  className: string;
  text: string;
  dataText?: string;
}) {
  const mv = useMotionValue(0);
  const [shown, setShown] = useState(text);
  useMotionValueEvent(mv, 'change', (v) => {
    const revealed = Math.floor(v);
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text.charAt(i);
      out +=
        i < revealed || ch === ' '
          ? ch
          : GLYPHS.charAt((Math.floor(v * 9) + i * 5) % GLYPHS.length);
    }
    setShown(out);
  });
  useEffect(() => {
    const controls = animate(mv, text.length, { duration: 1.6, ease: 'linear' });
    return () => controls.stop();
  }, [mv, text]);
  return (
    <h1 className={className} data-text={dataText} aria-label={text}>
      <span aria-hidden="true">{shown}</span>
    </h1>
  );
}
