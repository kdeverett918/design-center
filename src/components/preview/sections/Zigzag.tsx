import { ArrowRight } from 'lucide-react';

interface SectionProps {
  brand?: string;
}

const ROWS = [
  {
    eyebrow: 'Your first visit',
    title: 'Start with a real conversation',
    body: 'We listen before we plan. Your first visit maps where you are now and where you want to go — no rushing, no scripts.',
    cta: 'Book an intake',
  },
  {
    eyebrow: 'Ongoing care',
    title: 'Progress that keeps showing up',
    body: 'Between visits you stay connected through secure messaging and shared goals, so momentum never depends on a single appointment.',
    cta: 'See how it works',
  },
];

export default function Zigzag({ brand = 'Your Practice' }: SectionProps) {
  return (
    <section className="bg-bg px-8 py-14 font-body">
      <div className="mx-auto max-w-md text-center">
        <span className="inline-block rounded-full tk-tint-secondary px-3 py-1 text-xs font-medium text-ink">
          How {brand} works
        </span>
      </div>

      <div className="mt-10 space-y-12">
        {ROWS.map((row, i) => {
          const flip = i % 2 === 1;
          return (
            <div key={row.title} className="grid items-center gap-6 sm:grid-cols-2">
              <div
                className={`relative aspect-[4/3] overflow-hidden rounded-3xl tk-mesh tk-shadow ${
                  flip ? 'sm:order-2' : ''
                }`}
              >
                <div className="absolute inset-0 grid place-items-center">
                  <span className="font-heading text-xl font-semibold text-onPrimary/90">{brand}</span>
                </div>
              </div>
              <div className={flip ? 'sm:order-1' : ''}>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                  {row.eyebrow}
                </span>
                <h3 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-ink">
                  {row.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{row.body}</p>
                <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-onPrimary">
                  {row.cta} <ArrowRight size={15} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
