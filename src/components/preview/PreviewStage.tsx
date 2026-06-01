import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, X } from 'lucide-react';
import type { FavoriteKind, FontPairing, Palette } from '../../types';
import type { DeviceMode, PreviewConfig } from '../../preview/previewConfig';
import PreviewControls from './PreviewControls';
import PreviewFrame from './PreviewFrame';
import DeviceFrame from './DeviceFrame';
import FavoriteStar from '../cards/FavoriteStar';

interface PreviewStageProps {
  palette: Palette;
  fonts: FontPairing;
  brand: string;
  selectionKey: string;
  config: PreviewConfig;
  onConfig: (patch: Partial<PreviewConfig>) => void;
  title: string;
  subtitle: string;
  favorite?: { kind: FavoriteKind; id: string; label: string };
  /** Inline preview height in px. */
  height?: number;
}

export default function PreviewStage({
  palette,
  fonts,
  brand,
  selectionKey,
  config,
  onConfig,
  title,
  subtitle,
  favorite,
  height = 520,
}: PreviewStageProps) {
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [replay, setReplay] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const frame = (
    <PreviewFrame
      palette={palette}
      fonts={fonts}
      brand={brand}
      config={config}
      selectionKey={selectionKey}
      replayNonce={replay}
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-3xl border border-shell-line bg-shell-panel"
    >
      {/* selection bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-shell-glow" />
            <span className="font-display text-sm font-semibold text-shell-ink">{title}</span>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-shell-mute">{subtitle}</p>
        </div>
        {favorite && (
          <FavoriteStar kind={favorite.kind} id={favorite.id} label={favorite.label} tone="shell" />
        )}
      </div>

      <PreviewControls
        config={config}
        onConfig={onConfig}
        device={device}
        onDevice={setDevice}
        onReplay={() => setReplay((n) => n + 1)}
        onFullscreen={() => setFullscreen(true)}
      />

      {/* inline preview */}
      <div className="bg-shell-base p-3">
        <div className="overflow-hidden rounded-2xl border border-shell-line">
          <DeviceFrame mode={device} height={height}>
            {frame}
          </DeviceFrame>
        </div>
      </div>

      {/* full-screen modal */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-shell-base/95 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={`${title} full-screen preview`}
          >
            <div className="flex items-center justify-between border-b border-shell-line px-5 py-3">
              <div className="min-w-0">
                <div className="font-display text-sm font-semibold text-shell-ink">{title}</div>
                <div className="truncate text-[11px] text-shell-mute">{subtitle}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5 rounded-lg bg-shell-panel p-0.5">
                  {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDevice(d)}
                      aria-pressed={device === d}
                      className={`rounded-md px-3 py-1 text-xs capitalize ${
                        device === d ? 'bg-shell-base text-shell-glow' : 'text-shell-mute hover:text-shell-ink'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFullscreen(false)}
                  aria-label="Close full-screen preview"
                  className="grid h-9 w-9 place-items-center rounded-full border border-shell-line text-shell-mute hover:text-shell-ink"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 p-4 sm:p-8">
              <div className="mx-auto h-full max-w-[1400px] overflow-hidden rounded-2xl border border-shell-line">
                <DeviceFrame mode={device} height="fill">
                  {frame}
                </DeviceFrame>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
