import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Palette as PaletteIcon, Search, SearchX, Sparkles, Type, Wand2, X } from 'lucide-react';
import type { AnimationCategory, Industry, LayoutPreset, Mood } from '../../types';
import type { PreviewConfig } from '../../preview/previewConfig';
import { themeById, themes } from '../../data/themes';
import { paletteById, palettes } from '../../data/palettes';
import { fontPairingById, fontPairings } from '../../data/fonts';
import { animationPresets } from '../../data/animations';
import { layoutPresets } from '../../data/layouts';
import { collectionById, collections } from '../../data/collections';
import { INDUSTRIES, MOODS } from '../../data/taxonomy';
import { matchesQuery } from '../../lib/searchFilter';
import ThemeCard from '../cards/ThemeCard';
import PaletteCard from '../cards/PaletteCard';
import FontCard from '../cards/FontCard';
import AnimationCard from '../cards/AnimationCard';
import LayoutCard from '../cards/LayoutCard';
import { buttonClasses } from '../ui/Button';

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

const GUIDE_KEY = 'dc:guide-dismissed';

interface GalleryProps {
  activeThemeId: string;
  onSelectTheme: (themeId: string) => void;
  config: PreviewConfig;
  onApplyLayout: (previewKey: string) => void;
}

export default function Gallery({ activeThemeId, onSelectTheme, config, onApplyLayout }: GalleryProps) {
  const [tab, setTab] = useState<Tab>('themes');
  // Curated collection on the Themes tab — null means "All".
  const [collection, setCollection] = useState<string | null>(null);
  // Cross-tab refinements: free-text search plus single-select mood/industry chips.
  const [query, setQuery] = useState('');
  const [mood, setMood] = useState<Mood | null>(null);
  const [industry, setIndustry] = useState<Industry | null>(null);
  // One-line orientation banner — dismissed state persists across visits.
  const [guideOpen, setGuideOpen] = useState(() => {
    try {
      return localStorage.getItem(GUIDE_KEY) !== '1';
    } catch {
      return true;
    }
  });
  const dismissGuide = () => {
    setGuideOpen(false);
    try {
      localStorage.setItem(GUIDE_KEY, '1');
    } catch {
      /* storage unavailable — dismissal just won't persist */
    }
  };

  // Resolve the active theme so layout thumbnails render in the live theme.
  const activeTheme = themeById(activeThemeId) ?? themes[0]!;
  const activePalette = paletteById(activeTheme.paletteId)!;
  const activeFonts = fontPairingById(activeTheme.fontPairingId)!;

  const layoutApplied = (l: LayoutPreset) =>
    (l.type === 'hero' && config.hero === l.previewKey.slice(5)) ||
    (l.type === 'card' && config.cardStyle === l.previewKey.slice(5)) ||
    (l.type === 'nav' && config.nav === l.previewKey) ||
    (l.type === 'footer' && config.footer === l.previewKey) ||
    (l.type === 'section' && config.sections.includes(l.previewKey));

  // Themes shown on the Themes tab — all of them, or the active collection's set.
  const activeCollection = collection ? collectionById(collection) : undefined;
  const collectionThemes = activeCollection
    ? activeCollection.themeIds.map((id) => themeById(id)).filter((t): t is NonNullable<typeof t> => Boolean(t))
    : themes;

  // Layered refinement: collection → mood chip → industry chip → search tokens.
  const shownThemes = useMemo(
    () =>
      collectionThemes.filter(
        (t) =>
          (!mood || t.moods.includes(mood)) &&
          (!industry || t.industries.includes(industry)) &&
          matchesQuery([t.name, t.tagline, t.moods.join(' '), t.industries.join(' ')], query),
      ),
    [collectionThemes, mood, industry, query],
  );
  const shownPalettes = useMemo(
    () =>
      palettes.filter(
        (p) => (!mood || p.moods.includes(mood)) && matchesQuery([p.name, p.moods.join(' ')], query),
      ),
    [mood, query],
  );
  const shownFonts = useMemo(
    () =>
      fontPairings.filter(
        (f) =>
          (!industry || f.goodFor.includes(industry)) &&
          matchesQuery(
            [f.name, f.personality, f.heading.family, f.body.family, f.goodFor.join(' ')],
            query,
          ),
      ),
    [industry, query],
  );
  const shownLayouts = useMemo(
    () => layoutPresets.filter((l) => matchesQuery([l.name, l.description, l.type], query)),
    [query],
  );
  const shownAnimations = useMemo(
    () =>
      animationPresets.filter((a) =>
        matchesQuery([a.name, a.effect, a.category, a.intensity], query),
      ),
    [query],
  );

  const counts: Record<Tab, number> = {
    themes: themes.length,
    palettes: palettes.length,
    fonts: fontPairings.length,
    layouts: layoutPresets.length,
    animations: animationPresets.length,
  };
  const shownCounts: Record<Tab, number> = {
    themes: shownThemes.length,
    palettes: shownPalettes.length,
    fonts: shownFonts.length,
    layouts: shownLayouts.length,
    animations: shownAnimations.length,
  };

  // Which chip rails make sense per tab (layouts/animations are search-only).
  const moodChipsVisible = tab === 'themes' || tab === 'palettes';
  const industryChipsVisible = tab === 'themes' || tab === 'fonts';
  const refinementsActive = Boolean(query.trim()) || mood !== null || industry !== null;
  const clearRefinements = () => {
    setQuery('');
    setMood(null);
    setIndustry(null);
  };

  return (
    <div className="flex h-full flex-col">
      {/* friendly one-line orientation guide — dismissible, above the tabs */}
      {guideOpen && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-shell-line bg-shell-panel/60 px-4 py-2.5">
          <Sparkles size={15} className="shrink-0 text-shell-glow" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-[13px] leading-snug text-shell-mute">
            <span className="font-medium text-shell-ink">Browse a style on the left</span>, watch it
            come alive on the right — then “Mix your own” or send your picks.
          </p>
          <button
            type="button"
            onClick={dismissGuide}
            aria-label="Dismiss guide"
            className={`${buttonClasses('neutral', 'sm')} h-7 w-7 shrink-0 !px-0`}
          >
            <X size={14} />
          </button>
        </div>
      )}

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
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'border-transparent bg-shell-glow text-shell-base shadow-sm shadow-shell-glow/30'
                  : 'border-shell-line bg-shell-panel text-shell-mute hover:border-shell-glow/50 hover:text-shell-ink'
              }`}
            >
              <Icon size={15} className={active ? 'text-shell-base' : ''} />
              {label}
              <span
                className={`rounded-full px-1.5 text-[11px] ${
                  active ? 'bg-shell-base/20 text-shell-base' : 'bg-shell-base text-shell-mute'
                }`}
              >
                {counts[id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* search + refinement chips — instant, client-side */}
      <div className="px-1 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-shell-mute"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search names, vibes, tags…"
              aria-label="Search the library"
              className="w-full rounded-full border border-shell-line bg-shell-panel py-2 pl-9 pr-3 text-sm text-shell-ink outline-none placeholder:text-shell-mute focus:border-shell-glow/60"
            />
          </div>
          {refinementsActive && (
            <span className="text-xs text-shell-mute" data-testid="result-count">
              {shownCounts[tab]} of {counts[tab]} shown
            </span>
          )}
          {refinementsActive && (
            <button
              type="button"
              onClick={clearRefinements}
              className="flex items-center gap-1 rounded-full border border-shell-line px-3 py-1.5 text-xs font-semibold text-shell-mute transition-colors hover:border-shell-glow/50 hover:text-shell-ink"
            >
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        {(moodChipsVisible || industryChipsVisible) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {moodChipsVisible &&
              MOODS.map((m) => (
                <FilterChip
                  key={m}
                  label={m}
                  active={mood === m}
                  onClick={() => setMood((cur) => (cur === m ? null : m))}
                />
              ))}
            {moodChipsVisible && industryChipsVisible && (
              <span aria-hidden="true" className="mx-1 h-4 w-px bg-shell-line" />
            )}
            {industryChipsVisible &&
              INDUSTRIES.map((i) => (
                <FilterChip
                  key={i}
                  label={i}
                  active={industry === i}
                  onClick={() => setIndustry((cur) => (cur === i ? null : i))}
                />
              ))}
          </div>
        )}
      </div>

      {/* curated collection rail — themes tab only */}
      {tab === 'themes' && (
        <div className="px-1 pb-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCollection(null)}
              aria-pressed={collection === null}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                collection === null
                  ? 'border-transparent bg-shell-glow text-shell-base shadow-sm shadow-shell-glow/30'
                  : 'border-shell-line bg-shell-panel text-shell-mute hover:border-shell-glow/50 hover:text-shell-ink'
              }`}
            >
              All
            </button>
            {collections.map((c) => {
              const active = collection === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCollection(c.id)}
                  aria-pressed={active}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-transparent bg-shell-glow text-shell-base shadow-sm shadow-shell-glow/30'
                      : 'border-shell-line bg-shell-panel text-shell-mute hover:border-shell-glow/50 hover:text-shell-ink'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
          {activeCollection && (
            <p className="mt-2.5 px-1 text-xs text-shell-mute">{activeCollection.description}</p>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin px-1 pb-8">
        {/* zero results across any tab → designed empty state, never a blank grid */}
        {shownCounts[tab] === 0 ? (
          <EmptyResults onClear={clearRefinements} />
        ) : (
          <>
            {/* simple grids (themes / palettes / fonts) */}
            {tab === 'themes' && (
              <motion.div
                key={`themes:${collection ?? 'all'}:${mood ?? ''}:${industry ?? ''}:${query}`}
                variants={gridVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-5 sm:grid-cols-2"
              >
                {shownThemes.map((t) => (
                  <ThemeCard key={t.id} theme={t} active={t.id === activeThemeId} onSelect={onSelectTheme} />
                ))}
              </motion.div>
            )}

            {tab === 'palettes' && (
              <motion.div
                key={`palettes:${mood ?? ''}:${query}`}
                variants={gridVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
              >
                {shownPalettes.map((p) => (
                  <PaletteCard key={p.id} palette={p} />
                ))}
              </motion.div>
            )}

            {tab === 'fonts' && (
              <motion.div
                key={`fonts:${industry ?? ''}:${query}`}
                variants={gridVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
              >
                {shownFonts.map((f) => (
                  <FontCard key={f.id} pairing={f} />
                ))}
              </motion.div>
            )}

            {/* Layouts — grouped by type */}
            {tab === 'layouts' &&
              LAYOUT_TYPES.map(({ id, label }) => {
                const items = shownLayouts.filter((l) => l.type === id);
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
                const items = shownAnimations.filter((a) => a.category === id);
                if (!items.length) return null;
                return (
                  <GroupedSection key={id} title={label} count={items.length}>
                    {items.map((a) => (
                      <AnimationCard key={a.id} preset={a} />
                    ))}
                  </GroupedSection>
                );
              })}
          </>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize transition-all ${
        active
          ? 'border-transparent bg-shell-glow text-shell-base shadow-sm shadow-shell-glow/30'
          : 'border-shell-line bg-shell-panel text-shell-mute hover:border-shell-glow/50 hover:text-shell-ink'
      }`}
    >
      {label}
    </button>
  );
}

function EmptyResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="grid min-h-[280px] place-items-center rounded-3xl border border-dashed border-shell-line px-6 py-12 text-center">
      <div>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-shell-glow/10 text-shell-glow">
          <SearchX size={22} aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-display text-lg font-semibold text-shell-ink">
          Nothing matches that mix.
        </h3>
        <p className="mt-1.5 text-sm text-shell-mute">
          Great taste is specific — but try fewer filters and the library opens back up.
        </p>
        <button
          type="button"
          onClick={onClear}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-shell-glow px-4 py-2 text-sm font-semibold text-shell-base"
        >
          <X size={14} /> Clear filters
        </button>
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
