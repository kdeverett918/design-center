import { CalendarHeart, ClipboardList, LineChart } from 'lucide-react';

interface SectionProps {
  brand?: string;
}

const COLUMNS = [
  {
    icon: CalendarHeart,
    title: 'Care on your schedule',
    body: 'Book, reschedule, and join visits from anywhere — evenings and weekends included.',
  },
  {
    icon: ClipboardList,
    title: 'Plans built for you',
    body: 'Every step is mapped to your goals, then adjusted as your needs change over time.',
  },
  {
    icon: LineChart,
    title: 'Progress you can see',
    body: 'Track milestones visit by visit, so the work always feels like it is going somewhere.',
  },
];

export default function FeatureColumns({ brand = 'Your Practice' }: SectionProps) {
  return (
    <section className="bg-bg px-8 py-14 font-body">
      <div className="mx-auto max-w-md text-center">
        <span className="inline-block rounded-full tk-tint-secondary px-3 py-1 text-xs font-medium text-ink">
          Why {brand}
        </span>
        <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-ink">
          Built around how care actually works
        </h2>
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        {COLUMNS.map(({ icon: Icon, title, body }) => (
          <div key={title}>
            <span className="grid h-11 w-11 place-items-center rounded-2xl tk-tint-primary">
              <Icon size={20} className="text-primary" />
            </span>
            <h3 className="mt-4 font-heading text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
