import { X } from 'lucide-react';
import type { Industry, Mood } from '../../types';
import { INDUSTRIES, MOODS } from '../../data/taxonomy';

interface FilterPanelProps {
  moods: Mood[];
  industries: Industry[];
  onToggleMood: (m: Mood) => void;
  onToggleIndustry: (i: Industry) => void;
  onClear: () => void;
  /** Whether industry chips are meaningful for the active tab. */
  showIndustries?: boolean;
  showMoods?: boolean;
  resultCount: number;
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
        active
          ? 'border-shell-glow/60 bg-shell-glow/15 text-shell-ink'
          : 'border-shell-line text-shell-mute hover:border-shell-glow/40 hover:text-shell-ink'
      }`}
    >
      {label}
    </button>
  );
}

export default function FilterPanel({
  moods,
  industries,
  onToggleMood,
  onToggleIndustry,
  onClear,
  showIndustries = true,
  showMoods = true,
  resultCount,
}: FilterPanelProps) {
  const hasFilters = moods.length > 0 || industries.length > 0;

  return (
    <div className="rounded-2xl border border-shell-line bg-shell-panel/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
          Filter
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-shell-mute">{resultCount} shown</span>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 text-[11px] font-medium text-shell-glow hover:underline"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {showMoods && (
        <div className="mb-2">
          <div className="mb-1.5 text-[10px] uppercase tracking-wide text-shell-mute/70">Mood</div>
          <div className="flex flex-wrap gap-1.5">
            {MOODS.map((m) => (
              <Chip key={m} label={m} active={moods.includes(m)} onClick={() => onToggleMood(m)} />
            ))}
          </div>
        </div>
      )}

      {showIndustries && (
        <div>
          <div className="mb-1.5 text-[10px] uppercase tracking-wide text-shell-mute/70">
            Industry
          </div>
          <div className="flex flex-wrap gap-1.5">
            {INDUSTRIES.map((i) => (
              <Chip
                key={i}
                label={i}
                active={industries.includes(i)}
                onClick={() => onToggleIndustry(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
