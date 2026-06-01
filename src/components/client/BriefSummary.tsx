import { useState } from 'react';
import { Check, ClipboardCopy, Printer } from 'lucide-react';
import type { FontPairing, Palette, PaletteColors } from '../../types';
import type { PreviewConfig } from '../../preview/previewConfig';

interface BriefSummaryProps {
  brand: string;
  themeName?: string;
  palette: Palette;
  fonts: FontPairing;
  config: PreviewConfig;
  notes?: string;
}

const COLOR_ROLES: (keyof PaletteColors)[] = [
  'primary',
  'secondary',
  'accent',
  'ink',
  'muted',
  'surface',
  'background',
];

function buildBriefText(p: BriefSummaryProps): string {
  const lines = [
    `DESIGN BRIEF — ${p.brand}`,
    p.themeName ? `Theme: ${p.themeName}` : 'Theme: Custom mix',
    '',
    `Palette: ${p.palette.name}${p.palette.isDark ? ' (dark)' : ''}`,
    ...COLOR_ROLES.map((r) => `  ${r.padEnd(11)} ${p.palette.colors[r]}`),
    '',
    `Typography:`,
    `  Heading  ${p.fonts.heading.family} (${p.fonts.heading.weights.join('/')})`,
    `  Body     ${p.fonts.body.family} (${p.fonts.body.weights.join('/')})`,
    `  Pairing  ${p.fonts.name} — ${p.fonts.personality}`,
    '',
    `Layout:`,
    `  Hero     ${p.config.hero}`,
    `  Cards    ${p.config.cardStyle}`,
    `  Motion   ${p.config.motion}`,
  ];
  if (p.notes?.trim()) {
    lines.push('', 'Notes:', `  ${p.notes.trim()}`);
  }
  return lines.join('\n');
}

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
            <div key={r} className="group relative h-9" style={{ backgroundColor: palette.colors[r] }}>
              <span className="pointer-events-none absolute inset-x-0 -bottom-5 text-center text-[8px] text-shell-mute opacity-0 transition-opacity group-hover:opacity-100">
                {palette.colors[r]}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 text-center text-[8px] capitalize text-shell-mute/80">
          {COLOR_ROLES.map((r) => (
            <span key={r} className="truncate">{r}</span>
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
