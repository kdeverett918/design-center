import { Activity, HeartPulse, Stethoscope, Brain, Leaf, ShieldCheck } from 'lucide-react';

interface SectionProps {
  brand?: string;
}

const LOGOS = [
  { icon: Activity, label: 'NorthPoint' },
  { icon: HeartPulse, label: 'CareWell' },
  { icon: Stethoscope, label: 'Meridian' },
  { icon: Brain, label: 'Clarity Co.' },
  { icon: Leaf, label: 'Evergreen' },
  { icon: ShieldCheck, label: 'Guardian' },
];

export default function LogoCloud({ brand = 'Your Practice' }: SectionProps) {
  return (
    <section className="bg-bg px-8 py-12 font-body">
      <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-muted">
        Trusted by teams who refer to {brand}
      </p>
      <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-3">
        {LOGOS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-2xl border tk-line bg-surface px-4 py-2.5"
          >
            <span className="grid h-7 w-7 place-items-center rounded-xl tk-tint-primary">
              <Icon size={15} className="text-primary" />
            </span>
            <span className="font-heading text-sm font-semibold text-ink">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
