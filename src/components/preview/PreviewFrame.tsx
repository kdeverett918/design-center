import { useEffect, useMemo } from 'react';
import { AnimatePresence, m as motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import type { FontPairing, Palette } from '../../types';
import type { PreviewConfig } from '../../preview/previewConfig';
import { themeVars } from '../../theme/applyTheme';
import { loadFonts } from '../../theme/loadFonts';
import { resolvePalette } from '../../theme/variant';
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
}: PreviewFrameProps) {
  useEffect(() => {
    loadFonts(fonts);
  }, [fonts]);

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
    replayNonce,
  ].join(':');

  return (
    <div data-dark={effective.isDark ? 'true' : 'false'} style={vars as CSSProperties}>
      {instantUpdates ? (
        <div key={key}>
          <SamplePage brand={brand} config={config} heroImage={heroImage} />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            <SamplePage brand={brand} config={config} heroImage={heroImage} />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
