import { useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, ClipboardCopy, Code2, Download, Mail, Printer } from 'lucide-react';
import { buildBriefText, COLOR_ROLES } from './buildBrief';
import type { BriefInput } from './buildBrief';
import { buttonClasses } from '../ui/Button';
import { toCssVars, toJson, toTailwind } from '../../lib/designTokens';
import { animationById } from '../../data/animations';

const animationName = (id: string): string => animationById(id)?.name ?? id;

type BriefSummaryProps = BriefInput;

export default function BriefSummary(props: BriefSummaryProps) {
  const { brand, themeName, palette, fonts, config, notes, animationIds } = props;
  const animations = animationIds ?? [];
  const [copied, setCopied] = useState(false);
  // Developer-oriented exports (CSS vars / JSON / Tailwind) stay tucked away so
  // the panel reads calmly for non-technical clients.
  const [devOpen, setDevOpen] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildBriefText(props));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  const slug = brand.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'brief';

  const downloadBrief = () => {
    try {
      const blob = new Blob([buildBriefText(props)], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `design-brief-${slug}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* download unavailable */
    }
  };

  const emailBrief = () => {
    const subject = encodeURIComponent(`Design brief: ${brand}`);
    const body = encodeURIComponent(buildBriefText(props));
    window.location.href = `mailto:kristine@thetechslp.com?subject=${subject}&body=${body}`;
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
        <Row label="Nav" value={config.nav.replace('nav-', '').replace('-', ' ')} />
        <Row label="Footer" value={config.footer.replace('footer-', '').replace('-', ' ')} />
        <Row label="Sections" value={config.sections.length ? `${config.sections.length} chosen` : 'none'} />
        <Row label="Motion" value={config.motion} />
      </dl>

      {/* motion & effects */}
      <div className="mt-4 border-t border-shell-line pt-4">
        <div className="mb-1.5 text-[10px] uppercase tracking-wide text-shell-mute">
          Motion &amp; effects · {animations.length ? `${animations.length} chosen` : 'none'}
        </div>
        {animations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {animations.map((id) => (
              <span
                key={id}
                className="rounded-md border border-shell-glow/40 bg-shell-glow/10 px-2 py-1 text-[11px] text-shell-ink"
              >
                {animationName(id)}
              </span>
            ))}
          </div>
        )}
      </div>

      {notes?.trim() && (
        <p className="mt-4 border-t border-shell-line pt-3 text-xs leading-relaxed text-shell-mute">
          “{notes.trim()}”
        </p>
      )}

      {/* export & handoff — calm primary actions, dev exports tucked away */}
      <div className="mt-4 border-t border-shell-line pt-4">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={downloadBrief}
            className={buttonClasses('info', 'sm')}
          >
            <Download size={12} /> Download brief
          </button>
          <button
            type="button"
            onClick={emailBrief}
            className={buttonClasses('neutral', 'sm')}
          >
            <Mail size={12} /> Email
          </button>
        </div>

        <button
          type="button"
          onClick={() => setDevOpen((o) => !o)}
          aria-expanded={devOpen}
          aria-controls="brief-dev-handoff"
          className="mt-2.5 flex w-full items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-shell-mute transition-colors hover:text-shell-ink"
        >
          <span className="flex items-center gap-1.5">
            <Code2 size={12} /> For your developer
          </span>
          <ChevronDown
            size={13}
            className={`shrink-0 transition-transform motion-reduce:transition-none ${
              devOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {devOpen && (
          <div id="brief-dev-handoff" className="mt-2 flex flex-wrap gap-1.5">
            <CopyChip label="CSS vars" getText={() => toCssVars(palette, fonts)} />
            <CopyChip label="JSON" getText={() => toJson(palette, fonts, config, animations)} />
            <CopyChip label="Tailwind" getText={() => toTailwind(palette, fonts)} />
          </div>
        )}
      </div>

      {typeof document !== 'undefined' &&
        createPortal(<PrintBrief {...props} />, document.body)}
    </div>
  );
}

// Copies generated text (CSS vars / JSON / Tailwind) with transient feedback.
function CopyChip({ label, getText }: { label: string; getText: () => string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(getText());
          setDone(true);
          window.setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="flex items-center gap-1 rounded-lg border border-shell-line px-2.5 py-1.5 text-[11px] font-medium text-shell-ink hover:border-shell-glow/50"
    >
      {done ? (
        <Check size={12} className="text-emerald-400" />
      ) : (
        <ClipboardCopy size={12} className="text-shell-mute" />
      )}
      {done ? 'Copied' : label}
    </button>
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

const niceLabel = (key: string) =>
  key.replace(/^(nav|footer|sec|hero|card)-/, '').replace(/-/g, ' ');

// Clean, monochrome, paper-friendly brief. Hidden on screen; shown only in print
// (portaled to <body> so the rest of the app can be display:none in @media print).
function PrintBrief({ brand, themeName, palette, fonts, config, notes, animationIds }: BriefSummaryProps) {
  const animations = animationIds ?? [];
  return (
    <div className="print-only" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111' }}>
      <div style={{ borderBottom: '2px solid #111', paddingBottom: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#666' }}>
          Tech SLP Studio · Design Brief
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{brand}</div>
        <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>
          {themeName ? `Based on the ${themeName} theme` : 'Custom mix'}
        </div>
      </div>

      <PrintSection title={`Color palette — ${palette.name}${palette.isDark ? ' (dark)' : ''}`}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COLOR_ROLES.map((r) => (
            <div key={r} style={{ width: 92 }}>
              <div
                style={{
                  height: 44,
                  borderRadius: 6,
                  border: '1px solid #ddd',
                  background: palette.colors[r],
                }}
              />
              <div style={{ fontSize: 10, marginTop: 4, textTransform: 'capitalize' }}>{r}</div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#444' }}>
                {palette.colors[r]}
              </div>
            </div>
          ))}
        </div>
      </PrintSection>

      <PrintSection title="Typography">
        <PrintRow k="Heading" v={`${fonts.heading.family} (${fonts.heading.weights.join('/')})`} />
        <PrintRow k="Body" v={`${fonts.body.family} (${fonts.body.weights.join('/')})`} />
        <PrintRow k="Pairing" v={`${fonts.name} — ${fonts.personality}`} />
      </PrintSection>

      <PrintSection title="Layout & composition">
        <PrintRow k="Hero" v={niceLabel(config.hero)} />
        <PrintRow k="Cards" v={niceLabel(config.cardStyle)} />
        <PrintRow k="Navigation" v={niceLabel(config.nav)} />
        <PrintRow k="Footer" v={niceLabel(config.footer)} />
        <PrintRow
          k="Sections"
          v={config.sections.length ? config.sections.map(niceLabel).join(', ') : 'none'}
        />
        <PrintRow k="Motion" v={config.motion} />
      </PrintSection>

      <PrintSection title="Motion & effects">
        {animations.length ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {animations.map((id) => (
              <span
                key={id}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  padding: '3px 8px',
                }}
              >
                {animationName(id)}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#666' }}>none</div>
        )}
      </PrintSection>

      {notes?.trim() && (
        <PrintSection title="Notes">
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>{notes.trim()}</div>
        </PrintSection>
      )}
    </div>
  );
}

function PrintSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#888',
          borderBottom: '1px solid #eee',
          paddingBottom: 6,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function PrintRow({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
      <span style={{ color: '#666' }}>{k}</span>
      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{v}</span>
    </div>
  );
}
