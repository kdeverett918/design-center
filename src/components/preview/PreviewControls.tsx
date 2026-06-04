import { useState } from 'react';
import type { ReactNode } from 'react';
import { Maximize2, Monitor, RotateCcw, Smartphone, SlidersHorizontal, Tablet } from 'lucide-react';
import type { AnimationIntensity } from '../../types';
import type {
  CardStyle,
  DeviceMode,
  FooterVariant,
  HeroVariant,
  NavVariant,
  PreviewConfig,
} from '../../preview/previewConfig';
import {
  CARD_STYLES,
  FOOTER_VARIANTS,
  HERO_VARIANTS,
  INTENSITIES,
  NAV_VARIANTS,
} from '../../preview/previewConfig';
import { layoutPresets } from '../../data/layouts';
import { buttonClasses } from '../ui/Button';

const SECTION_OPTIONS = layoutPresets
  .filter((l) => l.type === 'section')
  .map((l) => ({ key: l.previewKey, label: l.name }));

interface PreviewControlsProps {
  config: PreviewConfig;
  onConfig: (patch: Partial<PreviewConfig>) => void;
  device: DeviceMode;
  onDevice: (d: DeviceMode) => void;
  onReplay: () => void;
  onFullscreen: () => void;
}

function Seg<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium capitalize transition-colors ${
            value === o.id
              ? 'bg-shell-glow/15 text-shell-ink ring-1 ring-shell-glow/50'
              : 'text-shell-mute hover:text-shell-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const DEVICES: { id: DeviceMode; icon: typeof Monitor; label: string }[] = [
  { id: 'desktop', icon: Monitor, label: 'Desktop' },
  { id: 'tablet', icon: Tablet, label: 'Tablet' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
];

export default function PreviewControls({
  config,
  onConfig,
  device,
  onDevice,
  onReplay,
  onFullscreen,
}: PreviewControlsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-shell-line">
      {/* top row: device + actions */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5">
        <div className="flex items-center gap-0.5 rounded-lg bg-shell-base p-0.5">
          {DEVICES.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-pressed={device === id}
              title={label}
              onClick={() => onDevice(id)}
              className={`grid h-8 w-8 place-items-center rounded-md transition-colors ${
                device === id
                  ? 'bg-shell-glow text-shell-base shadow-sm'
                  : 'text-shell-mute hover:text-shell-ink'
              }`}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="preview-customizer"
            className={
              open
                ? `${buttonClasses('neutral', 'sm')} border-shell-glow bg-shell-glow/15 text-shell-ink`
                : buttonClasses('neutral', 'sm')
            }
          >
            <SlidersHorizontal size={13} /> Advanced — fine-tune
          </button>
          <button
            type="button"
            onClick={onReplay}
            aria-label="Replay animation"
            title="Replay animation"
            className={`${buttonClasses('neutral', 'sm')} h-8 w-8 !px-0`}
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={onFullscreen}
            aria-label="Full-screen preview"
            title="Full-screen preview"
            className={`${buttonClasses('neutral', 'sm')} h-8 w-8 !px-0`}
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* collapsible customizer */}
      {open && (
        <div id="preview-customizer" className="border-t border-shell-line bg-shell-base/40 px-4 py-3">
          <p className="mb-3 text-[11px] leading-snug text-shell-mute">
            Most clients can skip this — pick a ready-made look and you’re done.
          </p>

          <Cluster label="Layout">
            <Row label="Hero">
              <Seg<HeroVariant>
                ariaLabel="Hero layout"
                options={HERO_VARIANTS}
                value={config.hero}
                onChange={(hero) => onConfig({ hero })}
              />
            </Row>
            <Row label="Cards">
              <Seg<CardStyle>
                ariaLabel="Card style"
                options={CARD_STYLES}
                value={config.cardStyle}
                onChange={(cardStyle) => onConfig({ cardStyle })}
              />
            </Row>
            <Row label="Nav">
              <Seg<NavVariant>
                ariaLabel="Navigation"
                options={NAV_VARIANTS}
                value={config.nav}
                onChange={(nav) => onConfig({ nav })}
              />
            </Row>
            <Row label="Footer">
              <Seg<FooterVariant>
                ariaLabel="Footer"
                options={FOOTER_VARIANTS}
                value={config.footer}
                onChange={(footer) => onConfig({ footer })}
              />
            </Row>
          </Cluster>

          <Cluster label="Page">
            <Row label="Sections">
              <div role="group" aria-label="Page sections" className="flex flex-wrap gap-1">
                {SECTION_OPTIONS.map((s) => {
                  const on = config.sections.includes(s.key);
                  return (
                    <button
                      key={s.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        onConfig({
                          sections: on
                            ? config.sections.filter((x) => x !== s.key)
                            : [...config.sections, s.key],
                        })
                      }
                      className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                        on
                          ? 'bg-shell-glow/15 text-shell-ink ring-1 ring-shell-glow/50'
                          : 'text-shell-mute hover:text-shell-ink'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </Row>
            <Row label="Motion">
              <Seg<AnimationIntensity>
                ariaLabel="Animation intensity"
                options={INTENSITIES.map((i) => ({ id: i, label: i }))}
                value={config.motion}
                onChange={(motion) => onConfig({ motion })}
              />
            </Row>
          </Cluster>
        </div>
      )}
    </div>
  );
}

function Cluster({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="mb-3 last:mb-0">
      <div className="mb-2 flex items-center gap-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-shell-mute">
          {label}
        </span>
        <span className="h-px flex-1 bg-shell-line" />
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-12 shrink-0 pt-1 text-[10px] font-semibold uppercase tracking-wide text-shell-mute">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
