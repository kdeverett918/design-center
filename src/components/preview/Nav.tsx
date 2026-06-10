import { Activity } from 'lucide-react';
import { useFx } from '../../preview/effectsRuntime';
import FxCta from './effects/FxCta';

// Token-only navigation, three variants. Used both as a layout thumbnail and as
// the live SamplePage nav. (nav-sidebar is a dashboard pattern — shown as a
// thumbnail but the marketing SamplePage uses a top bar.)
export default function Nav({ variant, brand }: { variant: string; brand: string }) {
  const fx = useFx();
  const linkCls = fx.link.underline ? 'fx-underline' : '';
  const Logo = (
    <div className="flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-xl bg-primary">
        <Activity size={16} className="text-onPrimary" />
      </span>
      <span className="font-heading text-lg font-semibold text-ink">{brand}</span>
    </div>
  );
  const links = ['Services', 'About', 'Resources'];

  if (variant === 'nav-sidebar') {
    return (
      <div className="flex bg-bg" style={{ minHeight: 220 }}>
        <div className="w-44 space-y-2 border-r tk-line bg-surface p-5">
          {Logo}
          <div className="space-y-1 pt-3">
            {['Dashboard', ...links, 'Settings'].map((l, i) => (
              <div
                key={l}
                className={`rounded-lg px-3 py-2 text-sm ${i === 0 ? 'bg-primary text-onPrimary' : 'text-muted'}`}
              >
                {l}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="h-3 w-1/3 rounded bg-ink/10" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-16 rounded-xl bg-surface tk-shadow" />
            <div className="h-16 rounded-xl bg-surface tk-shadow" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'nav-centered-logo') {
    return (
      <div className="grid grid-cols-3 items-center border-b tk-line bg-bg px-8 py-5">
        <div className="flex gap-5 text-sm text-muted">
          <span className={linkCls}>Services</span>
          <span className={linkCls}>About</span>
        </div>
        <div className="flex justify-center">{Logo}</div>
        <div className="flex items-center justify-end gap-5 text-sm text-muted">
          <span className={linkCls}>Resources</span>
          <FxCta>
            <span className="rounded-full bg-primary px-4 py-1.5 font-medium text-onPrimary">Book</span>
          </FxCta>
        </div>
      </div>
    );
  }

  // nav-sticky-clear (default)
  return (
    <div className="flex items-center justify-between border-b tk-line bg-bg px-8 py-5">
      {Logo}
      <div className="hidden items-center gap-6 text-sm text-muted sm:flex">
        {links.map((l) => (
          <span key={l} className={linkCls}>
            {l}
          </span>
        ))}
        <FxCta>
          <span className="rounded-full bg-primary px-4 py-1.5 font-medium text-onPrimary">Book a visit</span>
        </FxCta>
      </div>
    </div>
  );
}
