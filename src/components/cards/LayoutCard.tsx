import { motion } from 'framer-motion';
import type { LayoutPreset } from '../../types';
import FavoriteStar from './FavoriteStar';

// A small monochrome wireframe per layout, so clients grasp the structure at a
// glance. Pure shell colors (this is studio chrome, not a themed preview).
function Schematic({ preset }: { preset: LayoutPreset }) {
  const bar = 'rounded bg-shell-line';
  const fill = 'rounded bg-shell-glow/30';
  const k = preset.previewKey;

  let body: React.ReactNode;
  switch (preset.type) {
    case 'hero':
      if (k === 'hero-split') {
        body = (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5 py-2">
              <div className={`h-2 w-3/4 ${bar}`} />
              <div className={`h-2 w-full ${bar}`} />
              <div className={`mt-2 h-3 w-1/2 ${fill}`} />
            </div>
            <div className={`h-full min-h-[3rem] ${fill}`} />
          </div>
        );
      } else if (k === 'hero-centered' || k === 'hero-typeonly') {
        body = (
          <div className="flex flex-col items-center gap-1.5 py-2">
            <div className={`h-3 w-2/3 ${bar}`} />
            <div className={`h-2 w-1/2 ${bar}`} />
            <div className={`mt-1 h-3 w-1/3 ${fill}`} />
          </div>
        );
      } else {
        body = (
          <div className={`relative grid min-h-[3.5rem] place-items-center ${fill}`}>
            <div className="w-2/3 space-y-1.5">
              <div className="h-2 w-3/4 rounded bg-shell-base/50" />
              <div className="h-2 w-full rounded bg-shell-base/40" />
            </div>
          </div>
        );
      }
      break;
    case 'nav':
      body = (
        <div className="flex items-center justify-between rounded bg-shell-line/60 px-2 py-2">
          <div className={`h-2 w-8 ${fill}`} />
          <div className="flex gap-1">
            <div className="h-2 w-4 rounded bg-shell-base/50" />
            <div className="h-2 w-4 rounded bg-shell-base/50" />
            <div className={`h-2 w-5 ${fill}`} />
          </div>
        </div>
      );
      break;
    case 'card':
      body = (
        <div className="mx-auto w-2/3 space-y-1.5 rounded-lg bg-shell-line/50 p-2.5">
          <div className={`h-3 w-3 ${fill}`} />
          <div className={`h-2 w-full ${bar}`} />
          <div className={`h-2 w-2/3 ${bar}`} />
        </div>
      );
      break;
    case 'footer':
      body = (
        <div className="space-y-2 pt-2">
          <div className="flex justify-between">
            <div className={`h-2 w-10 ${bar}`} />
            <div className="flex gap-1">
              <div className="h-2 w-4 rounded bg-shell-line" />
              <div className="h-2 w-4 rounded bg-shell-line" />
            </div>
          </div>
          <div className="h-px w-full bg-shell-line" />
        </div>
      );
      break;
    default: // section
      body = (
        <div className="grid grid-cols-3 gap-1.5 py-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1 rounded bg-shell-line/40 p-1.5">
              <div className={`h-2 w-2 ${fill}`} />
              <div className={`h-1.5 w-full ${bar}`} />
            </div>
          ))}
        </div>
      );
  }

  return <div className="grid h-24 content-center rounded-xl border border-shell-line bg-shell-base p-3">{body}</div>;
}

export default function LayoutCard({ preset }: { preset: LayoutPreset }) {
  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="group relative overflow-hidden rounded-3xl border border-shell-line bg-shell-panel p-4"
    >
      <div className="absolute right-3 top-3 z-10">
        <FavoriteStar kind="layout" id={preset.id} label={preset.name} tone="shell" />
      </div>
      <Schematic preset={preset} />
      <div className="mt-3">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-sm font-semibold text-shell-ink">{preset.name}</h3>
          <span className="rounded-full border border-shell-line px-1.5 py-0.5 text-[10px] capitalize text-shell-mute">
            {preset.type}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-shell-mute">{preset.description}</p>
      </div>
    </motion.article>
  );
}
