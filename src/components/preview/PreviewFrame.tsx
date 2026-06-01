import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import type { FontPairing, Palette } from '../../types';
import { themeVars } from '../../theme/applyTheme';
import { loadFonts } from '../../theme/loadFonts';
import SamplePage from './SamplePage';

interface PreviewFrameProps {
  palette: Palette;
  fonts: FontPairing;
  brand: string;
  /** Stable key (theme/palette id) that drives the cross-fade between selections. */
  selectionKey: string;
}

// Owns the CSS-var scope for the big live preview and cross-fades whenever the
// selection changes. SamplePage reads only tokens, so colors + fonts swap live.
export default function PreviewFrame({
  palette,
  fonts,
  brand,
  selectionKey,
}: PreviewFrameProps) {
  useEffect(() => {
    loadFonts(fonts);
  }, [fonts]);

  const vars = useMemo(() => themeVars(palette, fonts), [palette, fonts]);

  return (
    <div
      data-dark={palette.isDark ? 'true' : 'false'}
      className="relative h-full overflow-y-auto scrollbar-thin rounded-2xl"
      style={vars as CSSProperties}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={selectionKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: 'easeInOut' }}
        >
          <SamplePage brand={brand} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
