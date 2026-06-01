import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Palette as PaletteIcon, SearchX, Sparkles, Type, Wand2 } from 'lucide-react';
import type { AnimationCategory, Industry, LayoutPreset, Mood } from '../../types';
import type { PreviewConfig } from '../../preview/previewConfig';
import { themeById, themes } from '../../data/themes';
import { paletteById, palettes } from '../../data/palettes';
import { fontPairingById, fontPairings } from '../../data/fonts';
import { animationPresets } from '../../data/animations';
import { layoutPresets } from '../../data/layouts';
import { matchIndustries, matchMoods } from '../../data/taxonomy';
import ThemeCard from '../cards/ThemeCard';
import PaletteCard from '../cards/PaletteCard';
import FontCard from '../cards/FontCard';
import AnimationCard from '../cards/AnimationCard';
import LayoutCard from '../cards/LayoutCard';
import FilterPanel from './FilterPanel';

type Tab = 'themes' | 'palettes' | 'fonts' | 'layouts' | 'animations';

const TABS: { id: Tab; label: string; icon: typeof Sparkles }[] = [
  { id: 'themes', label: 'Themes', icon: Sparkles },
  { id: 'palettes', label: 'Palettes', icon: PaletteIcon },
  { id: 'fonts', label: 'Fonts', icon: Type },
  { id: 'layouts', label: 'Layouts', icon: LayoutGrid },
  { id: 'animations', label: 'Animations', icon: Wand2 },
];

// Display order + labels for the grouped sections.
const ANIM_CATEGORIES: { id: AnimationCategory; label: string }[] = [
  { id: 'entrance', label: 'Entrance' },
  { id: 'scroll', label: 'Scroll' },
  { id: 'hover', label: 'Hover' },
  { id: 'cursor', label: 'Cursor' },
  { id: 'continuous', label: 'Continuous' },
  { id: 'transition', label: 'Transition' },
];

const LAYOUT_TYPES: { id: LayoutPreset['type']; label: string }[] = [
  { id: 'hero', label: 'Heroes' },
  { id: 'nav', label: 'Navigation' },
  { id: 'section', label: 'Sections' },
  { id: 'card', label: 'Cards' },
  { id: 'footer', label: 'Footers' },
];

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.03 } },
};

interface GalleryProps {
  activeThemeId: string;
  onSelectTheme: (themeId: string) => void;
  config: PreviewConfig;
  onApplyLayout: (previewKey: string) => void;
}

export default function Gallery({ activeThemeId, onSelectTheme, config, onApplyLayout }: GalleryProps) {
  const [tab, setTab] = useState<Tab>('themes');

  // Resolve the active theme so layout thumbnails render in the live theme.
  const activeTheme = themeById(activeThemeId) ?? themes[0]!;
  const activePalette = paletteById(activeTheme.paletteId)!;
  const activeFonts = fontPairingById(activeTheme.fontPairingId)!;

  const layoutApplied = (l: LayoutPreset) =>
    (l.type === 'hero' && config.hero === l.previewKey.slice(5)) ||
    (l.type === 'card' && config.cardStyle === l.previewKey.slice(5));
  const [moods, setMoods] = useState<Mood[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);

  const toggle = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, val: T) =>
    setter((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]));

  const filteredThemes = useMemo(
    () => themes.filter((t) => matchMoods(t.moods, moods) && matchIndustries(t.industries, industries)),
    [moods, industries],
  );
  const filteredPalettes = useMemo(() => palettes.filter((p) => matchMoods(p.moods, moods)), [moods]);
  const filteredFonts = useMemo(
    () => fontPairings.filter((f) => matchIndustries(f.goodFor, industries)),
    [industries],
  );

  const counts: Record<Tab, number> = {
    themes: filteredThemes.length,
    palettes: filteredPalettes.length,
    fonts: filteredFonts.length,
    layouts: layoutPresets.length,
    animations: animationPresets.length,
  };

  const showFilters = tab === 'themes' || tab === 'palettes' || tab === 'fonts';
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

      {showFilters && (
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

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin px-1 pb-8">
        {/* simple grids (themes / palettes / fonts) */}
        {showFilters && (
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
          </motion.div>
        )}

        {showFilters && counts[tab] === 0 && (
          <div className="grid place-items-center rounded-2xl border border-dashed border-shell-line py-16 text-center">
            <SearchX size={22} className="text-shell-mute" />
            <p className="mt-3 text-sm text-shell-ink">Nothing matches those filters.</p>
            <button type="button" onClick={clear} className="mt-2 text-xs font-medium text-shell-glow hover:underline">
              Clear filters
            </button>
          </div>
        )}

        {/* Layouts — grouped by type */}
        {tab === 'layouts' &&
          LAYOUT_TYPES.map(({ id, label }) => {
            const items = layoutPresets.filter((l) => l.type === id);
            if (!items.length) return null;
            return (
              <GroupedSection key={id} title={label} count={items.length}>
                {items.map((l) => (
                  <LayoutCard
                    key={l.id}
                    preset={l}
                    palette={activePalette}
                    fonts={activeFonts}
                    applied={layoutApplied(l)}
                    onApply={onApplyLayout}
                    brand={activeTheme.name}
                  />
                ))}
              </GroupedSection>
            );
          })}

        {/* Animations — grouped by category */}
        {tab === 'animations' &&
          ANIM_CATEGORIES.map(({ id, label }) => {
            const items = animationPresets.filter((a) => a.category === id);
            if (!items.length) return null;
            return (
              <GroupedSection key={id} title={label} count={items.length}>
                {items.map((a) => (
                  <AnimationCard key={a.id} preset={a} />
                ))}
              </GroupedSection>
            );
          })}
      </div>
    </div>
  );
}

function GroupedSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 last:mb-0">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-shell-ink">{title}</h2>
        <span className="rounded-full bg-shell-panel px-2 py-0.5 text-[11px] text-shell-mute">{count}</span>
        <span className="h-px flex-1 bg-shell-line" />
      </div>
      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
      >
        {children}
      </motion.div>
    </section>
  );
}
