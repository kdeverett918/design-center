import { Sparkles, ShieldCheck, MessageSquareText, CalendarHeart, HeartPulse } from 'lucide-react';

interface SectionProps {
  brand?: string;
}

export default function BentoGrid({ brand = 'Your Practice' }: SectionProps) {
  return (
    <section className="bg-bg px-8 py-14 font-body">
      <div className="mx-auto max-w-md text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-ink">
          Everything care should be
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          One connected experience with {brand} — from first hello to lasting progress.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {/* Large feature cell */}
        <div className="col-span-2 row-span-2 flex flex-col justify-between rounded-3xl tk-tint-primary p-6">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary">
            <Sparkles size={20} className="text-onPrimary" />
          </span>
          <div className="mt-8">
            <h3 className="font-heading text-xl font-semibold text-ink">A plan that adapts</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
              Your care evolves visit by visit, guided by goals you actually set yourself.
            </p>
          </div>
        </div>

        <div className="rounded-3xl tk-tint-secondary p-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface">
            <ShieldCheck size={17} className="text-primary" />
          </span>
          <h3 className="mt-4 font-heading text-sm font-semibold text-ink">Private by design</h3>
        </div>

        <div className="rounded-3xl tk-tint-accent p-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface">
            <MessageSquareText size={17} className="text-primary" />
          </span>
          <h3 className="mt-4 font-heading text-sm font-semibold text-ink">Secure messaging</h3>
        </div>

        <div className="rounded-3xl border tk-line bg-surface p-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl tk-tint-primary">
            <CalendarHeart size={17} className="text-primary" />
          </span>
          <h3 className="mt-4 font-heading text-sm font-semibold text-ink">Easy scheduling</h3>
        </div>

        <div className="col-span-2 flex items-center gap-3 rounded-3xl border tk-line bg-surface p-5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl tk-tint-primary">
            <HeartPulse size={17} className="text-primary" />
          </span>
          <div>
            <h3 className="font-heading text-sm font-semibold text-ink">Whole-person care</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              Every visit looks at the bigger picture, not just the symptom.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
