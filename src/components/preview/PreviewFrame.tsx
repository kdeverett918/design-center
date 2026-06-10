import { useEffect, useMemo } from 'react';
import { AnimatePresence, m as motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import type { FontPairing, Palette } from '../../types';
import type { PreviewConfig } from '../../preview/previewConfig';
import { themeVars } from '../../theme/applyTheme';
import { loadFonts } from '../../theme/loadFonts';
import { resolvePalette } from '../../theme/variant';
import { EffectsProvider, anyCursor, useResolvedEffects } from '../../preview/effectsRuntime';
import { CopyProvider } from '../../preview/copyContext';
import { packForPalette, packById, DEFAULT_PACK } from '../../preview/copyPacks';
import CursorLayer from './effects/CursorLayer';
import SamplePage from './SamplePage';

interface PreviewFrameProps {
  palette: Palette;
  fonts: FontPairing;
  brand: string;
  config: PreviewConfig;
  /** Stable key (theme/palette id) that drives the cross-fade between selections. */
  selectionKey: string;
  /** Bump to force an entrance replay without changing selection. */
  replayNonce?: number;
  /** Optional AI-generated hero background (themed previews only). */
  heroImage?: string;
  /** Render keyed preview changes synchronously instead of cross-fading. */
  instantUpdates?: boolean;
  /** Selected animation preset ids — applied live inside the page. */
  effects?: string[];
}

// Owns the CSS-var scope for the live preview and cross-fades whenever the
// selection or layout changes. SamplePage reads only tokens, so colors + fonts
// swap live; re-keying replays the motion so layout/intensity changes are seen.
// Sizing + scrolling are handled by the enclosing DeviceFrame.
export default function PreviewFrame({
  palette,
  fonts,
  brand,
  config,
  selectionKey,
  replayNonce = 0,
  heroImage,
  instantUpdates = false,
  effects,
}: PreviewFrameProps) {
  useEffect(() => {
    loadFonts(fonts);
  }, [fonts]);

  const fx = useResolvedEffects(effects);

  // The client's scheme choice resolves to the designed palette or its
  // derived light/dark counterpart — everything downstream just reads tokens.
  const effective = useMemo(() => resolvePalette(palette, config.scheme), [palette, config.scheme]);
  const vars = useMemo(() => themeVars(effective, fonts), [effective, fonts]);
  const key = [
    selectionKey,
    config.hero,
    config.cardStyle,
    config.nav,
    config.footer,
    config.sections.join('+'),
    config.motion,
    config.scheme,
    (effects ?? []).join(','),
    replayNonce,
  ].join(':');

  // The voice (copy pack) follows the DESIGNED palette's moods unless pinned.
  const pack =
    config.voice === 'auto'
      ? packForPalette(palette)
      : (packById(config.voice) ?? DEFAULT_PACK);

  // Selecting page-fade makes even "instant" boards cross-fade their changes.
  const crossFade = !instantUpdates || fx.pageFade;
  const page = (
    <CopyProvider pack={pack}>
      <EffectsProvider value={fx}>
        <div className="relative">
          {anyCursor(fx) && <CursorLayer />}
          <SamplePage brand={brand} config={config} heroImage={heroImage} />
        </div>
      </EffectsProvider>
    </CopyProvider>
  );

  return (
    <div data-dark={effective.isDark ? 'true' : 'false'} style={vars as CSSProperties}>
      {crossFade ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fx.pageFade ? 0.32 : 0.28, ease: 'easeInOut' }}
          >
            {page}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div key={key}>{page}</div>
      )}
    </div>
  );
}
