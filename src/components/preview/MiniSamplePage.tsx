import { Activity, ArrowRight } from 'lucide-react';

interface MiniSamplePageProps {
  /** Brand/site name shown in the mini nav + hero. */
  brand: string;
  headline?: string;
}

// A compact, token-only marketing page. Styled ENTIRELY with token utilities
// (bg-bg, text-ink, bg-primary, font-heading…) and the tk-* color-mix helpers —
// no hard-coded colors or fonts. Rendered inside a ThemedScope, it becomes a
// tiny live page in whatever palette + fonts that scope provides.
export default function MiniSamplePage({
  brand,
  headline = 'Care that listens, built around you.',
}: MiniSamplePageProps) {
  return (
    <div className="flex h-full flex-col bg-bg text-ink font-body">
      {/* mini nav */}
      <div className="flex items-center justify-between border-b tk-line px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="grid h-4 w-4 place-items-center rounded-md bg-primary">
            <Activity size={10} className="text-bg" />
          </span>
          <span className="font-heading text-[11px] font-semibold text-ink">{brand}</span>
        </div>
        <div className="flex items-center gap-2 text-[8px] text-muted">
          <span>Services</span>
          <span>About</span>
          <span className="rounded-full bg-primary px-2 py-0.5 text-bg">Book</span>
        </div>
      </div>

      {/* hero */}
      <div className="relative flex-1 px-4 pb-3 pt-4">
        <span className="inline-block rounded-full tk-tint-secondary px-2 py-0.5 text-[7px] font-medium text-ink">
          Now accepting new clients
        </span>
        <h3 className="mt-2 font-heading text-[15px] font-semibold leading-tight text-ink">
          {headline}
        </h3>
        <p className="mt-1.5 text-[8px] leading-relaxed text-muted">
          Evidence-based, compassionate support — from first visit to lasting progress.
        </p>
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[8px] font-semibold text-bg">
            Get started <ArrowRight size={8} />
          </span>
          <span className="rounded-lg border tk-line-strong px-2.5 py-1 text-[8px] font-medium text-ink">
            Learn more
          </span>
        </div>

        {/* feature chips */}
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {['Personalized plans', 'Telehealth ready'].map((f) => (
            <div
              key={f}
              className="rounded-lg border tk-line bg-surface px-2 py-1.5 tk-shadow"
            >
              <div className="mb-1 h-1.5 w-1.5 rounded-full bg-accent" />
              <div className="text-[8px] font-semibold text-ink">{f}</div>
            </div>
          ))}
        </div>
      </div>

      {/* footer strip */}
      <div className="flex items-center justify-between border-t tk-line bg-surface px-4 py-2 text-[7px] text-muted">
        <span>© {brand}</span>
        <span className="text-primary">Privacy · Terms</span>
      </div>
    </div>
  );
}
