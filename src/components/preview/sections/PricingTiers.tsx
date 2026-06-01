import { Check } from 'lucide-react';

interface SectionProps {
  brand?: string;
}

const TIERS = [
  {
    name: 'Starter',
    price: '$0',
    cadence: '/mo',
    blurb: 'For getting your bearings.',
    features: ['Intake & first visit', 'Care plan overview', 'Secure messaging'],
    cta: 'Start free',
    featured: false,
  },
  {
    name: 'Care',
    price: '$89',
    cadence: '/mo',
    blurb: 'Most clients land here.',
    features: ['Everything in Starter', 'Weekly telehealth visits', 'Personalized goals', 'Progress tracking'],
    cta: 'Get started',
    featured: true,
  },
  {
    name: 'Family',
    price: '$149',
    cadence: '/mo',
    blurb: 'Whole-household support.',
    features: ['Everything in Care', 'Up to 4 members', 'Priority scheduling', 'Dedicated coordinator'],
    cta: 'Talk to us',
    featured: false,
  },
];

export default function PricingTiers({ brand = 'Your Practice' }: SectionProps) {
  return (
    <section className="bg-bg px-8 py-14 font-body">
      <div className="mx-auto max-w-md text-center">
        <span className="inline-block rounded-full tk-tint-secondary px-3 py-1 text-xs font-medium text-ink">
          Simple, honest pricing
        </span>
        <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-ink">
          Plans that fit real life
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Care from {brand} with no surprises — switch or cancel any time.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={
              tier.featured
                ? 'relative rounded-3xl bg-primary p-6 text-onPrimary tk-shadow'
                : 'rounded-3xl border tk-line bg-surface p-6'
            }
          >
            {tier.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-onAccent">
                Most popular
              </span>
            )}
            <h3
              className={
                tier.featured
                  ? 'font-heading text-lg font-semibold text-onPrimary'
                  : 'font-heading text-lg font-semibold text-ink'
              }
            >
              {tier.name}
            </h3>
            <p className={tier.featured ? 'mt-1 text-xs text-onPrimary/80' : 'mt-1 text-xs text-muted'}>
              {tier.blurb}
            </p>
            <div className="mt-4 flex items-baseline gap-1">
              <span
                className={
                  tier.featured
                    ? 'font-heading text-4xl font-semibold text-onPrimary'
                    : 'font-heading text-4xl font-semibold text-ink'
                }
              >
                {tier.price}
              </span>
              <span className={tier.featured ? 'text-sm text-onPrimary/80' : 'text-sm text-muted'}>
                {tier.cadence}
              </span>
            </div>

            <ul className="mt-5 space-y-2.5">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check
                    size={15}
                    className={tier.featured ? 'mt-0.5 shrink-0 text-onPrimary' : 'mt-0.5 shrink-0 text-primary'}
                  />
                  <span className={tier.featured ? 'text-onPrimary/90' : 'text-ink'}>{feature}</span>
                </li>
              ))}
            </ul>

            <span
              className={
                tier.featured
                  ? 'mt-6 block rounded-xl bg-bg px-4 py-2.5 text-center text-sm font-semibold text-primary'
                  : 'mt-6 block rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-onPrimary'
              }
            >
              {tier.cta}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
