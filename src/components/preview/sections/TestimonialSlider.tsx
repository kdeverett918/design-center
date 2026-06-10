import { useEffect, useState } from 'react';
import { Quote, Star } from 'lucide-react';
import { AnimatePresence, m as motion, useReducedMotion } from 'framer-motion';
import { useCopy } from '../../../preview/copyContext';
import { fill } from '../../../preview/copyPacks';

interface SectionProps {
  brand?: string;
}


export default function TestimonialSlider({ brand = 'Your Practice' }: SectionProps) {
  const reduced = useReducedMotion() ?? false;
  const copy = useCopy();
  const QUOTES = copy.testimonials.map((t) => ({
    text: t.quote,
    name: t.name,
    detail: t.detail,
    initials: t.name
      .split(/[.\s]+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  }));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % QUOTES.length), 4500);
    return () => clearInterval(id);
  }, [reduced, QUOTES.length]);

  const active = QUOTES[index];

  return (
    <section className="bg-bg px-8 py-14 font-body">
      <div className="mx-auto max-w-2xl">
        <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-muted">
          {fill(copy.testimonialsTitle, brand)}
        </p>

        <div className="relative mt-6 min-h-[12rem] rounded-3xl border tk-line bg-surface p-8 text-center tk-shadow">
          <Quote size={28} className="mx-auto text-primary/40" />
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mt-3 flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} className="fill-accent text-accent" />
                ))}
              </div>
              <p className="mt-4 font-heading text-xl font-medium leading-relaxed text-ink">
                “{active.text}”
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-xs font-semibold text-onPrimary">
                  {active.initials}
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-ink">{active.name}</span>
                  <span className="block text-xs text-muted">{active.detail}</span>
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex justify-center gap-2">
          {QUOTES.map((quote, i) => (
            <button
              key={quote.name}
              type="button"
              aria-label={`Show testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-6 bg-primary' : 'w-2 tk-tint-primary'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
