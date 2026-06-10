import { Activity } from 'lucide-react';
import type { LogoStyle } from '../../preview/previewConfig';

// Generated brand mark: a tiny client-side "logo" derived from the brand name
// and the palette tokens. The default ('pulse') is the original Activity icon,
// so nothing changes until a client picks a style.
export default function BrandMark({
  brand,
  logoStyle = 'pulse',
  size = 'md',
}: {
  brand: string;
  logoStyle?: LogoStyle;
  size?: 'sm' | 'md';
}) {
  const initials =
    brand
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'A';
  const box = size === 'sm' ? 'h-4 w-4 text-[7px]' : 'h-7 w-7 text-[11px]';
  const icon = size === 'sm' ? 10 : 16;

  if (logoStyle === 'monogram-circle') {
    return (
      <span className={`grid ${box} place-items-center rounded-full bg-primary font-heading font-bold text-onPrimary`}>
        {initials}
      </span>
    );
  }
  if (logoStyle === 'monogram-tile') {
    return (
      <span
        className={`grid ${box} place-items-center rounded-md font-heading font-bold text-onPrimary`}
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
      >
        {initials}
      </span>
    );
  }
  if (logoStyle === 'badge-ring') {
    return (
      <span className={`grid ${box} place-items-center rounded-full border-2 border-primary font-heading font-bold text-primary`}>
        {initials.charAt(0)}
      </span>
    );
  }
  if (logoStyle === 'wordmark-bar') {
    return <span className={`${size === 'sm' ? 'h-4 w-1' : 'h-7 w-1.5'} rounded-full bg-accent`} />;
  }
  // 'pulse' — the original mark
  return (
    <span className={`grid ${box} place-items-center ${size === 'sm' ? 'rounded-md' : 'rounded-xl'} bg-primary`}>
      <Activity size={icon} className="text-onPrimary" />
    </span>
  );
}
