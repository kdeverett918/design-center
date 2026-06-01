import { motion } from 'framer-motion';
import type { AnimationPreset } from '../../types';
import AnimationDemo from './AnimationDemo';
import FavoriteStar from './FavoriteStar';

const intensityTone: Record<AnimationPreset['intensity'], string> = {
  subtle: 'text-emerald-300/90 border-emerald-400/30',
  standard: 'text-sky-300/90 border-sky-400/30',
  expressive: 'text-fuchsia-300/90 border-fuchsia-400/30',
};

function fmtDuration(ms: number): string {
  if (ms === 0) return 'scroll-driven';
  if (ms >= 1000) return `${(ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)}s`;
  return `${ms}ms`;
}

// Clean layout, real motion: the effect plays live on the left, the spec reads
// out on the right (duration · easing · intensity · library).
export default function AnimationCard({ preset }: { preset: AnimationPreset }) {
  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0 },
      }}
      className="group relative overflow-hidden rounded-3xl border border-shell-line bg-shell-panel p-5"
    >
      <div className="absolute right-4 top-4 z-10">
        <FavoriteStar kind="animation" id={preset.id} label={preset.name} tone="shell" />
      </div>

      {/* live demo */}
      <AnimationDemo preset={preset} />

      {/* heading */}
      <div className="mt-4 flex items-center gap-2">
        <h3 className="font-display text-base font-semibold text-shell-ink">{preset.name}</h3>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] capitalize ${intensityTone[preset.intensity]}`}
        >
          {preset.intensity}
        </span>
      </div>
      <p className="mt-1 text-xs text-shell-mute">{preset.effect}</p>

      {/* spec readout */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-shell-line pt-4 text-[11px]">
        <SpecRow label="Category" value={preset.category} />
        <SpecRow label="Duration" value={fmtDuration(preset.durationMs)} />
        <SpecRow label="Easing" value={preset.easing} />
        <SpecRow label="Library" value={preset.library} />
      </dl>
    </motion.article>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-shell-mute">{label}</dt>
      <dd className="truncate font-mono text-shell-ink/90" title={value}>
        {value}
      </dd>
    </div>
  );
}
