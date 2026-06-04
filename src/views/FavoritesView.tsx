import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Button, { buttonClasses } from '../components/ui/Button';
import { useFavorites } from '../contexts/favoritesContext';
import { themeById, themes } from '../data/themes';
import { paletteById } from '../data/palettes';
import { fontPairingById } from '../data/fonts';
import { animationById } from '../data/animations';
import { layoutById } from '../data/layouts';
import ThemeCard from '../components/cards/ThemeCard';
import PaletteCard from '../components/cards/PaletteCard';
import FontCard from '../components/cards/FontCard';
import AnimationCard from '../components/cards/AnimationCard';
import LayoutCard from '../components/cards/LayoutCard';

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.03 } },
};

export default function FavoritesView() {
  const { ids, count, clear } = useFavorites();
  const navigate = useNavigate();

  // Favorited layouts are browse-only here; render them in a neutral default theme.
  const defaultTheme = themes[0]!;
  const defaultPalette = paletteById(defaultTheme.paletteId)!;
  const defaultFonts = fontPairingById(defaultTheme.fontPairingId)!;

  const groups = useMemo(
    () => ({
      themes: ids('theme').map(themeById).filter(Boolean),
      palettes: ids('palette').map(paletteById).filter(Boolean),
      fonts: ids('font').map(fontPairingById).filter(Boolean),
      layouts: ids('layout').map(layoutById).filter(Boolean),
      animations: ids('animation').map(animationById).filter(Boolean),
    }),
    [ids],
  );

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8">
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
          <Button tone="danger" onClick={clear}>
            <Trash2 size={15} /> Clear shortlist
          </Button>
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
        <div className="space-y-8">
          <Group title="Themes" count={groups.themes.length}>
            {groups.themes.map((t) => (
              <ThemeCard
                key={t!.id}
                theme={t!}
                active={false}
                onSelect={(id) => navigate(`/?theme=${id}`)}
              />
            ))}
          </Group>
          <Group title="Palettes" count={groups.palettes.length}>
            {groups.palettes.map((p) => (
              <PaletteCard key={p!.id} palette={p!} />
            ))}
          </Group>
          <Group title="Fonts" count={groups.fonts.length}>
            {groups.fonts.map((f) => (
              <FontCard key={f!.id} pairing={f!} />
            ))}
          </Group>
          <Group title="Layouts" count={groups.layouts.length}>
            {groups.layouts.map((l) => (
              <LayoutCard
                key={l!.id}
                preset={l!}
                palette={defaultPalette}
                fonts={defaultFonts}
              />
            ))}
          </Group>
          <Group title="Animations" count={groups.animations.length}>
            {groups.animations.map((a) => (
              <AnimationCard key={a!.id} preset={a!} />
            ))}
          </Group>
        </div>
      )}
    </div>
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
