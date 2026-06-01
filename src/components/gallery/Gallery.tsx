import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Palette as PaletteIcon, SearchX, Sparkles, Type, Wand2 } from 'lucide-react';
import type { Industry, Mood } from '../../types';
import { themes } from '../../data/themes';
import { palettes } from '../../data/palettes';
import { fontPairings } from '../../data/fonts';
import { animationPresets } from '../../data/animations';
import { matchIndustries, matchMoods } from '../../data/taxonomy';
import ThemeCard from '../cards/ThemeCard';
import PaletteCard from '../cards/PaletteCard';
import FontCard from '../cards/FontCard';
import AnimationCard from '../cards/AnimationCard';
import FilterPanel from './FilterPanel';

type Tab = 'themes' | 'palettes' | 'fonts' | 'animations';

const TABS: { id: Tab; label: string; icon: typeof Sparkles }[] = [
  { id: 'themes', label: 'Themes', icon: Sparkles },
  { id: 'palettes', label: 'Palettes', icon: PaletteIcon },
  { id: 'fonts', label: 'Fonts', icon: Type },
  { id: 'animations', label: 'Animations', icon: Wand2 },
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
  const [moods, setMoods] = useState<Mood[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);

  const toggle = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, val: T) =>
    setter((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]));

  const filteredThemes = useMemo(
    () => themes.filter((t) => matchMoods(t.moods, moods) && matchIndustries(t.industries, industries)),
    [moods, industries],
  );
  const filteredPalettes = useMemo(
    () => palettes.filter((p) => matchMoods(p.moods, moods)),
    [moods],
  );
  const filteredFonts = useMemo(
    () => fontPairings.filter((f) => matchIndustries(f.goodFor, industries)),
    [industries],
  );

  const counts: Record<Tab, number> = {
    themes: filteredThemes.length,
    palettes: filteredPalettes.length,
    fonts: filteredFonts.length,
    animations: animationPresets.length,
  };

  const clear = () => {
    setMoods([]);
    setIndustries([]);
  };

  return (
    <div className="flex h-full flex-col">
      {/* tab bar */}
      <div className="flex flex-wrap gap-2 px-1 pb-4">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-pressed={active}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'border-shell-glow/60 bg-shell-glow/10 text-shell-ink'
                  : 'border-shell-line bg-shell-panel text-shell-mute hover:text-shell-ink'
              }`}
            >
              <Icon size={15} className={active ? 'text-shell-glow' : ''} />
              {label}
              <span className="rounded-full bg-shell-base px-1.5 text-[11px] text-shell-mute">
                {counts[id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* filters (not shown for animations — no mood/industry taxonomy) */}
      {tab !== 'animations' && (
        <div className="px-1 pb-4">
          <FilterPanel
            moods={moods}
            industries={industries}
            onToggleMood={(m) => toggle(setMoods, m)}
            onToggleIndustry={(i) => toggle(setIndustries, i)}
            onClear={clear}
            showMoods={tab === 'themes' || tab === 'palettes'}
            showIndustries={tab === 'themes' || tab === 'fonts'}
            resultCount={counts[tab]}
          />
        </div>
      )}

      {/* grid — re-keyed per tab+filter so the stagger replays */}
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin px-1 pb-8">
        <motion.div
          key={`${tab}:${moods.join(',')}:${industries.join(',')}`}
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
            filteredThemes.map((t) => (
              <ThemeCard key={t.id} theme={t} active={t.id === activeThemeId} onSelect={onSelectTheme} />
            ))}
          {tab === 'palettes' && filteredPalettes.map((p) => <PaletteCard key={p.id} palette={p} />)}
          {tab === 'fonts' && filteredFonts.map((f) => <FontCard key={f.id} pairing={f} />)}
          {tab === 'animations' && animationPresets.map((a) => <AnimationCard key={a.id} preset={a} />)}
        </motion.div>

        {/* empty state */}
        {tab !== 'animations' && counts[tab] === 0 && (
          <div className="grid place-items-center rounded-2xl border border-dashed border-shell-line py-16 text-center">
            <SearchX size={22} className="text-shell-mute" />
            <p className="mt-3 text-sm text-shell-ink">Nothing matches those filters.</p>
            <button
              type="button"
              onClick={clear}
              className="mt-2 text-xs font-medium text-shell-glow hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
