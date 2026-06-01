import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SectionProps {
  brand?: string;
}

const FAQS = [
  {
    q: 'Do you accept insurance?',
    a: 'Most major plans are accepted, and we verify your benefits before your first visit so there are no surprises.',
  },
  {
    q: 'Can I do visits from home?',
    a: 'Yes — secure telehealth visits use the same clinicians you see in person, with no extra software to install.',
  },
  {
    q: 'How quickly can I be seen?',
    a: 'New clients are typically scheduled within a few days, and urgent needs are flagged for same-week care.',
  },
  {
    q: 'What if I need to cancel?',
    a: 'Reschedule or cancel any time from your portal — there are no long-term commitments or hidden fees.',
  },
];

export default function FaqAccordion({ brand = 'Your Practice' }: SectionProps) {
  // First two rows start open so the section reads as content, not an empty list.
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true, 1: true });

  return (
    <section className="bg-bg px-8 py-14 font-body">
      <div className="mx-auto max-w-xl">
        <div className="text-center">
          <span className="inline-block rounded-full tk-tint-secondary px-3 py-1 text-xs font-medium text-ink">
            Questions, answered
          </span>
          <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-ink">
            Good to know before you book
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            A few things people ask before getting started with {brand}.
          </p>
        </div>

        <div className="mt-8 divide-y tk-line border-y tk-line">
          {FAQS.map((faq, i) => {
            const isOpen = !!open[i];
            return (
              <div key={faq.q}>
                <button
                  type="button"
                  onClick={() => setOpen((prev) => ({ ...prev, [i]: !prev[i] }))}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="font-heading text-base font-semibold text-ink">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-primary transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="pb-4 pr-8 text-sm leading-relaxed text-muted">{faq.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
