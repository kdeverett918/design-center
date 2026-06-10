import { ArrowRight } from 'lucide-react';
import { useFx } from '../../preview/effectsRuntime';

// Token-only footer, three variants. Shared by the layout thumbnail + SamplePage.
export default function Footer({ variant, brand }: { variant: string; brand: string }) {
  const fx = useFx();
  const linkCls = fx.link.underline ? 'fx-underline' : '';
  if (variant === 'footer-cta-band') {
    return (
      <div className="bg-bg">
        <div className="mx-6 my-6 rounded-3xl bg-primary px-8 py-8 text-center">
          <p className="font-heading text-2xl font-semibold text-onPrimary">Ready to get started?</p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-bg px-5 py-2.5 text-sm font-semibold text-primary">
            Book a visit <ArrowRight size={15} />
          </span>
        </div>
        <div className="flex justify-center gap-5 px-8 pb-6 text-xs text-muted">
          <span className={linkCls}>Privacy</span>
          <span className={linkCls}>Terms</span>
          <span className={linkCls}>Contact</span>
        </div>
      </div>
    );
  }

  if (variant === 'footer-mega') {
    return (
      <div className="grid grid-cols-2 gap-6 border-t tk-line bg-surface px-8 py-8 sm:grid-cols-4">
        <div>
          <span className="font-heading text-base font-semibold text-ink">{brand}</span>
          <p className="mt-2 text-xs text-muted">Care that listens, built around you.</p>
        </div>
        {['Services', 'Company', 'Resources'].map((col) => (
          <div key={col} className="space-y-2 text-xs text-muted">
            <div className="font-semibold text-ink">{col}</div>
            <div>Link one</div>
            <div>Link two</div>
            <div>Link three</div>
          </div>
        ))}
      </div>
    );
  }

  // footer-minimal (default)
  return (
    <div className="flex flex-col items-center gap-3 border-t tk-line bg-surface px-8 py-8">
      <span className="font-heading text-base font-semibold text-ink">{brand}</span>
      <div className="flex gap-5 text-xs text-muted">
        <span className={linkCls}>Privacy</span>
        <span className={linkCls}>Terms</span>
        <span className={linkCls}>Contact</span>
        <span className={`text-primary ${linkCls}`}>Book a visit</span>
      </div>
    </div>
  );
}
