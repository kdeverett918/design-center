import { Activity, ArrowRight, HeartPulse, MessageSquareText, ShieldCheck, Star } from 'lucide-react';

interface SamplePageProps {
  brand: string;
}

const features = [
  {
    icon: HeartPulse,
    title: 'Personalized care plans',
    body: 'Every plan is built around the person — goals, pace, and real life.',
  },
  {
    icon: MessageSquareText,
    title: 'Telehealth that works',
    body: 'Secure video visits with the same clinicians you know and trust.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy you can feel',
    body: 'Your information is protected at every step, by design.',
  },
];

const stats = [
  { value: '12k+', label: 'Sessions delivered' },
  { value: '98%', label: 'Would recommend' },
  { value: '4.9', label: 'Average rating' },
  { value: '24h', label: 'Avg. response' },
];

// The full live preview. Styled ONLY with token utilities + tk-* helpers — no
// hard-coded colors or fonts. It becomes whatever theme is scoped to it.
export default function SamplePage({ brand }: SamplePageProps) {
  return (
    <div className="bg-bg text-ink font-body">
      {/* nav */}
      <header className="flex items-center justify-between border-b tk-line px-8 py-4">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-primary">
            <Activity size={16} className="text-bg" />
          </span>
          <span className="font-heading text-lg font-semibold text-ink">{brand}</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-muted sm:flex">
          <span>Services</span>
          <span>About</span>
          <span>Resources</span>
          <span className="rounded-full bg-primary px-4 py-1.5 font-medium text-bg">
            Book a visit
          </span>
        </nav>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden px-8 py-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full tk-tint-primary blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full tk-tint-accent blur-2xl" />
        <div className="relative max-w-2xl">
          <span className="inline-block rounded-full tk-tint-secondary px-3 py-1 text-xs font-medium text-ink">
            Now accepting new clients
          </span>
          <h1 className="mt-5 font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-ink">
            Care that listens, built around you.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
            Evidence-based, compassionate support from a team that treats you like a
            person — not a chart. From the first visit to lasting progress.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-bg">
              Get started <ArrowRight size={16} />
            </span>
            <span className="rounded-xl border tk-line-strong px-5 py-3 text-sm font-medium text-ink">
              Meet the team
            </span>
          </div>
        </div>
      </section>

      {/* feature cards */}
      <section className="grid gap-4 px-8 pb-14 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-2xl border tk-line bg-surface p-5 tk-shadow"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl tk-tint-primary">
              <Icon size={18} className="text-primary" />
            </span>
            <h3 className="mt-4 font-heading text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </section>

      {/* stats band */}
      <section className="bg-primary px-8 py-10">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-heading text-3xl font-semibold text-bg">{s.value}</div>
              <div className="mt-1 text-xs text-bg/80">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* testimonial */}
      <section className="px-8 py-14">
        <div className="mx-auto max-w-2xl rounded-3xl border tk-line bg-surface p-8 text-center tk-shadow">
          <div className="mb-3 flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className="fill-accent text-accent" />
            ))}
          </div>
          <p className="font-heading text-xl font-medium leading-relaxed text-ink">
            “I finally felt heard. The plan fit my life, and the progress was real.”
          </p>
          <p className="mt-4 text-sm text-muted">— A. Rivera, client since 2024</p>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t tk-line bg-surface px-8 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary">
              <Activity size={13} className="text-bg" />
            </span>
            <span className="font-heading text-sm font-semibold text-ink">{brand}</span>
          </div>
          <div className="flex gap-5 text-xs text-muted">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
            <span className="text-primary">Book a visit</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
