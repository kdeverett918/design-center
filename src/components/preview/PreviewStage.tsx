import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m as motion } from 'framer-motion';
import { Check, Eye, Link2, Sparkles, X } from 'lucide-react';
import type { FavoriteKind, FontPairing, Palette } from '../../types';
import type { DeviceMode, PreviewConfig } from '../../preview/previewConfig';
import { animationById } from '../../data/animations';
import AnimationDemo from '../cards/AnimationDemo';
import PreviewControls from './PreviewControls';
import PreviewFrame from './PreviewFrame';
import DeviceFrame from './DeviceFrame';
import FavoriteStar from '../cards/FavoriteStar';
import Button, { buttonClasses } from '../ui/Button';

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
  /** When provided, shows a "Share" button that calls this to copy a link. */
  onShare?: () => void | Promise<void>;
  /** Inline preview height in px. */
  height?: number;
  /** Selected animation preset ids — played live beneath the preview. */
  effects?: string[];
  /** Optional AI-generated hero background (themed previews only). */
  heroImage?: string;
  /** Skip first-paint and live-preview fades for routes that must feel instant. */
  instantMount?: boolean;
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
  onShare,
  height = 520,
  effects,
  heroImage,
  instantMount = false,
}: PreviewStageProps) {
  const effectPresets = (effects ?? [])
    .map((id) => animationById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const [shared, setShared] = useState(false);
  // Default to the mobile frame on small screens — a 1280px desktop render
  // scaled into a ~340px column is illegible; mobile sits near 1:1.
  const [device, setDevice] = useState<DeviceMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop',
  );
  const [replay, setReplay] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Modal a11y: move focus in, Escape to close, lock scroll, restore focus out.
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullscreen(false);
        return;
      }
      // Trap Tab inside the dialog so keyboard focus can't escape to the page.
      if (e.key !== 'Tab') return;
      const root = dialogRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      const activeEl = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (activeEl === first || activeEl === root)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, [fullscreen]);

  const frame = (
    <PreviewFrame
      palette={palette}
      fonts={fonts}
      brand={brand}
      config={config}
      selectionKey={selectionKey}
      replayNonce={replay}
      heroImage={heroImage}
      instantUpdates={instantMount}
      effects={effects}
    />
  );

  return (
    <motion.div
      initial={instantMount ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={instantMount ? { duration: 0 } : { duration: 0.3 }}
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
        <div className="flex shrink-0 items-center gap-2">
          {onShare && (
            <Button
              tone="info"
              size="sm"
              onClick={async () => {
                await onShare();
                setShared(true);
                window.setTimeout(() => setShared(false), 1800);
              }}
            >
              {shared ? <Check size={13} /> : <Link2 size={13} />}
              {shared ? 'Copied' : 'Share'}
            </Button>
          )}
          {favorite && (
            <FavoriteStar kind={favorite.kind} id={favorite.id} label={favorite.label} tone="shell" />
          )}
        </div>
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

      {/* selected effects — each plays its real motion so the picks come to life */}
      {effectPresets.length > 0 && (
        <div className="border-t border-shell-line px-4 pb-4 pt-3.5">
          <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
            <Sparkles size={12} className="text-shell-glow" />
            Selected effects, in motion
            <span className="font-normal normal-case tracking-normal text-shell-mute/70">
              ({effectPresets.length})
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {effectPresets.map((preset) => (
              <div key={preset.id} className="space-y-1.5">
                <AnimationDemo preset={preset} />
                <div className="truncate text-center text-[11px] font-medium text-shell-ink" title={preset.effect}>
                  {preset.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* full-screen modal */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            ref={dialogRef}
            tabIndex={-1}
            className="fixed inset-0 z-50 flex flex-col bg-shell-base/95 outline-none backdrop-blur-sm"
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
                  className={`${buttonClasses('neutral', 'sm')} h-9 w-9 !px-0`}
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
