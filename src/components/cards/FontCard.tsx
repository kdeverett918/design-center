import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { FontPairing } from '../../types';
import { loadFonts } from '../../theme/loadFonts';
import FavoriteStar from './FavoriteStar';

// Renders the pairing using its ACTUAL fonts (loaded on mount), with the font
// names labeled for heading vs body.
export default function FontCard({ pairing }: { pairing: FontPairing }) {
  useEffect(() => {
    loadFonts(pairing);
  }, [pairing]);

  const headingFont = `"${pairing.heading.family}", system-ui, sans-serif`;
  const bodyFont = `"${pairing.body.family}", system-ui, sans-serif`;

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0 },
      }}
      className="group relative overflow-hidden rounded-3xl border border-shell-line bg-shell-panel p-6"
    >
      <div className="absolute right-4 top-4">
        <FavoriteStar kind="font" id={pairing.id} label={pairing.name} tone="shell" />
      </div>

      <div className="flex items-center gap-2 text-xs font-medium text-shell-mute">
        <span>{pairing.name}</span>
        <span className="text-shell-line">/</span>
        <span className="italic">{pairing.personality}</span>
      </div>

      {/* Heading specimen — actual heading font */}
      <p
        className="mt-4 text-3xl font-semibold leading-tight text-shell-ink"
        style={{ fontFamily: headingFont }}
      >
        Aa Bb Cc
      </p>
      <p
        className="text-[15px] leading-snug text-shell-ink/90"
        style={{ fontFamily: headingFont }}
      >
        Care that listens.
      </p>

      {/* Body specimen — actual body font */}
      <p
        className="mt-4 text-sm leading-relaxed text-shell-mute"
        style={{ fontFamily: bodyFont }}
      >
        The quick brown fox jumps over the lazy dog — evidence-based, compassionate
        support from a team that treats you like a person.
      </p>

      {/* Font name labels */}
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-shell-line pt-4 text-xs">
        <div>
          <div className="text-shell-mute">Heading</div>
          <div className="font-medium text-shell-ink" style={{ fontFamily: headingFont }}>
            {pairing.heading.family}
          </div>
        </div>
        <div>
          <div className="text-shell-mute">Body</div>
          <div className="font-medium text-shell-ink" style={{ fontFamily: bodyFont }}>
            {pairing.body.family}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
