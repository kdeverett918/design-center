import { useFx } from '../../preview/effectsRuntime';
import { useCopy } from '../../preview/copyContext';
import type { LogoStyle } from '../../preview/previewConfig';
import BrandMark from './BrandMark';
import FxCta from './effects/FxCta';

// Token-only navigation, three variants. Used both as a layout thumbnail and as
// the live SamplePage nav. (nav-sidebar is a dashboard pattern — shown as a
// thumbnail but the marketing SamplePage uses a top bar.)
export default function Nav({
  variant,
  brand,
  logoStyle,
}: {
  variant: string;
  brand: string;
  logoStyle?: LogoStyle;
}) {
  const fx = useFx();
  const copy = useCopy();
  const linkCls = fx.link.underline ? 'fx-underline' : '';
  const Logo = (
    <div className="flex items-center gap-2">
      <BrandMark brand={brand} logoStyle={logoStyle} />
      <span className="font-heading text-lg font-semibold text-ink">{brand}</span>
    </div>
  );
  const links = copy.navLinks;

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
          <span className={linkCls}>{links[0]}</span>
          <span className={linkCls}>{links[1]}</span>
        </div>
        <div className="flex justify-center">{Logo}</div>
        <div className="flex items-center justify-end gap-5 text-sm text-muted">
          <span className={linkCls}>{links[2]}</span>
          <FxCta>
            <span className="rounded-full bg-primary px-4 py-1.5 font-medium text-onPrimary">{copy.navCta}</span>
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
          <span className="rounded-full bg-primary px-4 py-1.5 font-medium text-onPrimary">{copy.navCta}</span>
        </FxCta>
      </div>
    </div>
  );
}
