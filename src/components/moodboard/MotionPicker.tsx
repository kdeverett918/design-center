import { useMemo, useState } from 'react';
import { Play, X } from 'lucide-react';
import { animationPresets, animationById } from '../../data/animations';
import { CATEGORY_META } from '../../preview/categoryMeta';
import type { AnimationCategory } from '../../types';
import Button from '../ui/Button';

// Order the tabs present the categories in (most clients start with entrances).
const CATEGORIES: AnimationCategory[] = [
  'entrance',
  'scroll',
  'hover',
  'cursor',
  'continuous',
  'transition',
];

interface MotionPickerProps {
  selected: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
  /** Re-runs the live preview's entrance so one-shot effects can be seen again. */
  onReplay: () => void;
}

// The motion section, rebuilt around the question clients actually had:
// "I picked an effect — why isn't anything moving?" Each category is a
// color-coded tab whose hint explains HOW its effects show up (hover, scroll,
// cursor, replay…), selected picks live in a colored summary row, and Replay
// sits right here next to the chips instead of hiding in the preview toolbar.
export default function MotionPicker({ selected, onToggle, onClear, onReplay }: MotionPickerProps) {
  const [tab, setTab] = useState<AnimationCategory>('entrance');

  const byCategory = useMemo(() => {
    const m = new Map<AnimationCategory, typeof animationPresets>();
    for (const c of CATEGORIES) m.set(c, animationPresets.filter((a) => a.category === c));
    return m;
  }, []);

  const selectedCount = (c: AnimationCategory) =>
    selected.filter((id) => animationById(id)?.category === c).length;

  const meta = CATEGORY_META[tab];
  const items = byCategory.get(tab) ?? [];

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
          Motion &amp; effects
          {selected.length > 0 && (
            <span className="rounded-full bg-shell-glow/15 px-1.5 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-shell-glow">
              {selected.length}
            </span>
          )}
          <span className="font-normal normal-case tracking-normal text-shell-mute/70">
            optional
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-[11px] font-semibold text-shell-mute transition-colors hover:text-shell-ink"
            >
              Clear
            </button>
          )}
          <Button tone="primary" size="sm" onClick={onReplay} className="!px-3 !py-1 !text-[11px]">
            <Play size={11} /> Replay
          </Button>
        </div>
      </div>

      {/* category tabs — the color follows each category everywhere */}
      <div role="tablist" aria-label="Effect categories" className="mb-2 flex flex-wrap gap-1">
        {CATEGORIES.map((c) => {
          const m = CATEGORY_META[c];
          const count = selectedCount(c);
          const active = tab === c;
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="motion-tabpanel"
              onClick={() => setTab(c)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                active ? m.tabOn : 'border-shell-line text-shell-mute hover:text-shell-ink'
              }`}
            >
              <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
              {m.label}
              {count > 0 && <span className={`text-[10px] font-semibold ${m.text}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* how-to-see-it coaching for the active category */}
      <p id="motion-hint" className="mb-2 text-[11px] leading-snug text-shell-mute">
        <span aria-hidden="true" className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${meta.dot}`} />
        {meta.verb}
      </p>

      <div
        id="motion-tabpanel"
        role="tabpanel"
        aria-describedby="motion-hint"
        className="flex flex-wrap gap-1.5"
      >
        {items.map((a) => {
          const on = selected.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              aria-pressed={on}
              title={a.effect}
              onClick={() => onToggle(a.id)}
              className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                on ? meta.chipOn : 'border-shell-line text-shell-mute hover:text-shell-ink'
              }`}
            >
              {a.name}
            </button>
          );
        })}
      </div>

      {/* everything selected, across categories — one glance, one tap to remove */}
      {selected.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-shell-line pt-2.5">
          {selected.map((id) => {
            const preset = animationById(id);
            if (!preset) return null;
            const m = CATEGORY_META[preset.category];
            return (
              <button
                key={id}
                type="button"
                onClick={() => onToggle(id)}
                title={`${preset.name} — ${m.action}. Click to remove.`}
                aria-label={`Remove ${preset.name}`}
                className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${m.chipOn}`}
              >
                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
                {preset.name}
                <X size={9} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
