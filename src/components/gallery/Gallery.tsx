import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette as PaletteIcon, Sparkles, Type, Wand2 } from 'lucide-react';
import { themes } from '../../data/themes';
import { palettes } from '../../data/palettes';
import { fontPairings } from '../../data/fonts';
import { animationPresets } from '../../data/animations';
import ThemeCard from '../cards/ThemeCard';
import PaletteCard from '../cards/PaletteCard';
import FontCard from '../cards/FontCard';
import AnimationCard from '../cards/AnimationCard';

type Tab = 'themes' | 'palettes' | 'fonts' | 'animations';

const TABS: { id: Tab; label: string; icon: typeof Sparkles; count: number }[] = [
  { id: 'themes', label: 'Themes', icon: Sparkles, count: themes.length },
  { id: 'palettes', label: 'Palettes', icon: PaletteIcon, count: palettes.length },
  { id: 'fonts', label: 'Fonts', icon: Type, count: fontPairings.length },
  { id: 'animations', label: 'Animations', icon: Wand2, count: animationPresets.length },
];

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

interface GalleryProps {
  activeThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

export default function Gallery({ activeThemeId, onSelectTheme }: GalleryProps) {
  const [tab, setTab] = useState<Tab>('themes');

  return (
    <div className="flex h-full flex-col">
      {/* tab bar */}
      <div className="flex flex-wrap gap-2 px-1 pb-4">
        {TABS.map(({ id, label, icon: Icon, count }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'border-shell-glow/60 bg-shell-glow/10 text-shell-ink'
                  : 'border-shell-line bg-shell-panel text-shell-mute hover:text-shell-ink'
              }`}
            >
              <Icon size={15} className={active ? 'text-shell-glow' : ''} />
              {label}
              <span className="rounded-full bg-shell-base px-1.5 text-[11px] text-shell-mute">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* grid — re-keyed per tab so the stagger replays on switch */}
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin px-1 pb-8">
        <motion.div
          key={tab}
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className={
            tab === 'themes'
              ? 'grid grid-cols-1 gap-5 sm:grid-cols-2'
              : 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'
          }
        >
          {tab === 'themes' &&
            themes.map((t) => (
              <ThemeCard
                key={t.id}
                theme={t}
                active={t.id === activeThemeId}
                onSelect={onSelectTheme}
              />
            ))}
          {tab === 'palettes' &&
            palettes.map((p) => <PaletteCard key={p.id} palette={p} />)}
          {tab === 'fonts' &&
            fontPairings.map((f) => <FontCard key={f.id} pairing={f} />)}
          {tab === 'animations' &&
            animationPresets.map((a) => <AnimationCard key={a.id} preset={a} />)}
        </motion.div>
      </div>
    </div>
  );
}
