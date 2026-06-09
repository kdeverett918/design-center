import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, Link2, Star, Trash2 } from 'lucide-react';
import { m as motion } from 'framer-motion';
import Button, { buttonClasses } from '../components/ui/Button';
import { useFavorites } from '../contexts/favoritesContext';
import type { FavoriteKind } from '../types';
import { themeById, themes } from '../data/themes';
import { paletteById } from '../data/palettes';
import { fontPairingById } from '../data/fonts';
import { animationById } from '../data/animations';
import { layoutById } from '../data/layouts';
import { decodeShortlist, encodeShortlist } from './shareShortlist';
import ThemeCard from '../components/cards/ThemeCard';
import PaletteCard from '../components/cards/PaletteCard';
import FontCard from '../components/cards/FontCard';
import AnimationCard from '../components/cards/AnimationCard';
import LayoutCard from '../components/cards/LayoutCard';
import SendShortlist from '../components/client/SendShortlist';

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.03 } },
};

function present<T>(value: T | undefined): value is T {
  return Boolean(value);
}

type CopyState = 'idle' | 'copied' | 'unavailable';

export default function FavoritesView() {
  const { ids, count, clear, entries, note, setNote, move, addMany } = useFavorites();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [copyState, setCopyState] = useState<CopyState>('idle');

  // A shared shortlist arrives as ?s=<token>; offer to merge it, never auto-add.
  const shared = useMemo(() => decodeShortlist(params.get('s')), [params]);
  const sharedNewCount = shared
    ? shared.keys.filter((k) => !entries.some((e) => e.key === k)).length
    : 0;
  const importShared = () => {
    if (shared) addMany(shared.keys, shared.notes);
    setParams({}, { replace: true });
  };
  const dismissShared = () => setParams({}, { replace: true });

  const copyShareLink = async () => {
    const url = `${window.location.origin}/favorites?s=${encodeShortlist(entries)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyState('copied');
    } catch {
      setCopyState('unavailable');
    }
    window.setTimeout(() => setCopyState('idle'), 2200);
  };

  // Favorited layouts are browse-only here; render them in a neutral default theme.
  const defaultTheme = themes[0]!;
  const defaultPalette = paletteById(defaultTheme.paletteId)!;
  const defaultFonts = fontPairingById(defaultTheme.fontPairingId)!;

  const groups = useMemo(
    () => ({
      themes: ids('theme').map(themeById).filter(present),
      palettes: ids('palette').map(paletteById).filter(present),
      fonts: ids('font').map(fontPairingById).filter(present),
      layouts: ids('layout').map(layoutById).filter(present),
      animations: ids('animation').map(animationById).filter(present),
    }),
    [ids],
  );

  const notesByKey = useMemo(() => {
    const map: Record<string, string> = {};
    for (const e of entries) if (e.note) map[e.key] = e.note;
    return map;
  }, [entries]);

  const slot = (kind: FavoriteKind, id: string, index: number, total: number) => ({
    kind,
    id,
    note: note(kind, id),
    onNote: (v: string) => setNote(kind, id, v),
    onMove: (delta: -1 | 1) => move(kind, id, delta),
    first: index === 0,
    last: index === total - 1,
  });

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8">
      {shared && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-shell-glow/40 bg-shell-glow/10 px-4 py-3">
          <Star size={16} className="shrink-0 text-shell-glow" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm text-shell-ink">
            Someone shared a shortlist of {shared.keys.length} item
            {shared.keys.length === 1 ? '' : 's'}
            {sharedNewCount > 0 && sharedNewCount !== shared.keys.length
              ? ` (${sharedNewCount} new to you)`
              : ''}
            .
          </p>
          <Button tone="primary" size="sm" onClick={importShared} disabled={sharedNewCount === 0}>
            {sharedNewCount === 0 ? 'Already saved' : 'Add to my shortlist'}
          </Button>
          <Button tone="neutral" size="sm" onClick={dismissShared}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-shell-ink sm:text-4xl">
            Your shortlist.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-shell-mute sm:text-base">
            Everything you’ve starred, in one place. {count} item{count === 1 ? '' : 's'} saved.
          </p>
        </div>
        {count > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Button tone="info" onClick={copyShareLink}>
              {copyState === 'copied' ? <Check size={15} /> : <Link2 size={15} />}
              {copyState === 'copied'
                ? 'Link copied'
                : copyState === 'unavailable'
                  ? 'Clipboard blocked'
                  : 'Share shortlist'}
            </Button>
            <Button tone="danger" onClick={clear}>
              <Trash2 size={15} /> Clear shortlist
            </Button>
          </div>
        )}
      </div>

      {count === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-dashed border-shell-line py-24 text-center">
          <Star size={26} className="text-shell-mute" />
          <p className="mt-4 text-base text-shell-ink">Nothing starred yet.</p>
          <p className="mt-1 text-sm text-shell-mute">
            Tap the ★ on any theme, palette, font, layout, or animation to save it here.
          </p>
          <Link to="/" className={`mt-5 ${buttonClasses('primary', 'md')}`}>
            Browse the gallery
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start">
          <div className="space-y-8">
            <Group title="Themes" count={groups.themes.length}>
              {groups.themes.map((t, i) => (
                <FavoriteSlot key={t.id} {...slot('theme', t.id, i, groups.themes.length)}>
                  <ThemeCard
                    theme={t}
                    active={false}
                    onSelect={(id) => navigate(`/gallery?theme=${id}`)}
                  />
                </FavoriteSlot>
              ))}
            </Group>
            <Group title="Palettes" count={groups.palettes.length}>
              {groups.palettes.map((p, i) => (
                <FavoriteSlot key={p.id} {...slot('palette', p.id, i, groups.palettes.length)}>
                  <PaletteCard palette={p} />
                </FavoriteSlot>
              ))}
            </Group>
            <Group title="Fonts" count={groups.fonts.length}>
              {groups.fonts.map((f, i) => (
                <FavoriteSlot key={f.id} {...slot('font', f.id, i, groups.fonts.length)}>
                  <FontCard pairing={f} />
                </FavoriteSlot>
              ))}
            </Group>
            <Group title="Layouts" count={groups.layouts.length}>
              {groups.layouts.map((l, i) => (
                <FavoriteSlot key={l.id} {...slot('layout', l.id, i, groups.layouts.length)}>
                  <LayoutCard preset={l} palette={defaultPalette} fonts={defaultFonts} />
                </FavoriteSlot>
              ))}
            </Group>
            <Group title="Animations" count={groups.animations.length}>
              {groups.animations.map((a, i) => (
                <FavoriteSlot key={a.id} {...slot('animation', a.id, i, groups.animations.length)}>
                  <AnimationCard preset={a} />
                </FavoriteSlot>
              ))}
            </Group>
          </div>

          <aside className="order-first xl:order-last xl:sticky xl:top-24">
            <SendShortlist groups={groups} count={count} notes={notesByKey} />
          </aside>
        </div>
      )}
    </div>
  );
}

// Wraps each favorited card with the client's working tools: a one-line note
// ("I like this but warmer") and up/down ordering within its group. The note
// travels with the shortlist into the emailed brief and share links.
function FavoriteSlot({
  kind,
  id,
  note,
  onNote,
  onMove,
  first,
  last,
  children,
}: {
  kind: FavoriteKind;
  id: string;
  note: string;
  onNote: (value: string) => void;
  onMove: (delta: -1 | 1) => void;
  first: boolean;
  last: boolean;
  children: React.ReactNode;
}) {
  const noteId = `fav-note-${kind}-${id}`;
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      className="flex flex-col gap-2"
    >
      {children}
      <div className="flex items-center gap-1.5">
        <label htmlFor={noteId} className="sr-only">
          Note for this favorite
        </label>
        <input
          id={noteId}
          value={note}
          onChange={(e) => onNote(e.target.value)}
          placeholder="Add a note — “love this, but warmer”…"
          className="min-w-0 flex-1 rounded-lg border border-shell-line bg-shell-panel/60 px-2.5 py-1.5 text-xs text-shell-ink outline-none placeholder:text-shell-mute/70 focus:border-shell-glow/60"
        />
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={first}
          aria-label="Move up"
          className="grid h-7 w-7 place-items-center rounded-lg border border-shell-line text-shell-mute transition-colors enabled:hover:text-shell-ink disabled:opacity-35"
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={last}
          aria-label="Move down"
          className="grid h-7 w-7 place-items-center rounded-lg border border-shell-line text-shell-mute transition-colors enabled:hover:text-shell-ink disabled:opacity-35"
        >
          <ChevronDown size={14} />
        </button>
      </div>
      {note && (
        <p className="sr-only" aria-live="polite">
          Note saved
        </p>
      )}
    </motion.div>
  );
}

function Group({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <section>
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
