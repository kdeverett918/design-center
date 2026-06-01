interface SectionProps {
  brand?: string;
}

const STATS = [
  { value: '12k+', label: 'Sessions delivered' },
  { value: '98%', label: 'Would recommend' },
  { value: '4.9', label: 'Average rating' },
  { value: '24h', label: 'Avg. response time' },
];

export default function StatsBand({ brand = 'Your Practice' }: SectionProps) {
  return (
    <section className="bg-primary px-8 py-12 font-body">
      <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-onPrimary/70">
        {brand}, by the numbers
      </p>
      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-8 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="font-heading text-4xl font-semibold text-onPrimary">{stat.value}</div>
            <div className="mt-1.5 text-xs text-onPrimary/80">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
