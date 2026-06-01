import { useState } from 'react';
import { Check, ClipboardCopy, Printer } from 'lucide-react';
import { buildBriefText, COLOR_ROLES } from './buildBrief';
import type { BriefInput } from './buildBrief';

type BriefSummaryProps = BriefInput;

export default function BriefSummary(props: BriefSummaryProps) {
  const { brand, themeName, palette, fonts, config, notes } = props;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildBriefText(props));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <div className="rounded-3xl border border-shell-line bg-shell-panel p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-sm font-semibold text-shell-ink">Design brief</h3>
          <p className="text-[11px] text-shell-mute">
            {themeName ? `Based on ${themeName}` : 'Custom mix'} · {brand}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 rounded-lg border border-shell-line px-2.5 py-1.5 text-[11px] font-medium text-shell-ink hover:border-shell-glow/50"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <ClipboardCopy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Print brief"
            className="grid h-8 w-8 place-items-center rounded-lg border border-shell-line text-shell-mute hover:text-shell-ink"
          >
            <Printer size={14} />
          </button>
        </div>
      </div>

      {/* palette */}
      <div className="mt-4">
        <div className="mb-1.5 text-[10px] uppercase tracking-wide text-shell-mute">
          Palette · {palette.name}
        </div>
        <div className="grid grid-cols-7 overflow-hidden rounded-lg ring-1 ring-shell-line">
          {COLOR_ROLES.map((r) => (
            <div
              key={r}
              className="h-9"
              style={{ backgroundColor: palette.colors[r] }}
              title={`${r} ${palette.colors[r]}`}
            />
          ))}
        </div>
        <div className="mt-1.5 grid grid-cols-7 gap-0.5 text-center text-[10px] capitalize text-shell-mute">
          {COLOR_ROLES.map((r) => (
            <span key={r} className="truncate" title={palette.colors[r]}>
              {r.slice(0, 3)}
            </span>
          ))}
        </div>
      </div>

      {/* type + layout */}
      <dl className="mt-4 space-y-2 border-t border-shell-line pt-4 text-xs">
        <Row label="Heading" value={`${fonts.heading.family} · ${fonts.heading.weights.join('/')}`} />
        <Row label="Body" value={`${fonts.body.family} · ${fonts.body.weights.join('/')}`} />
        <Row label="Hero" value={config.hero} />
        <Row label="Cards" value={config.cardStyle} />
        <Row label="Motion" value={config.motion} />
      </dl>

      {notes?.trim() && (
        <p className="mt-4 border-t border-shell-line pt-3 text-xs leading-relaxed text-shell-mute">
          “{notes.trim()}”
        </p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-shell-mute">{label}</dt>
      <dd className="truncate font-medium capitalize text-shell-ink" title={value}>
        {value}
      </dd>
    </div>
  );
}
