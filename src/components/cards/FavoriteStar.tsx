import { Star } from 'lucide-react';
import { m as motion, useReducedMotion } from 'framer-motion';
import type { FavoriteKind } from '../../types';
import { useFavorites } from '../../contexts/favoritesContext';

interface FavoriteStarProps {
  kind: FavoriteKind;
  id: string;
  label: string;
  /** 'shell' renders for the dark gallery chrome; 'onLight' for inside light cards. */
  tone?: 'shell' | 'onLight';
}

// Star toggle used across every card. Stops propagation so starring never
// triggers the card's open/select handler.
export default function FavoriteStar({ kind, id, label, tone = 'shell' }: FavoriteStarProps) {
  const { has, toggle } = useFavorites();
  const active = has(kind, id);
  const reduced = useReducedMotion();

  const ring =
    tone === 'shell'
      ? 'border-shell-line bg-shell-panel/70 hover:border-shell-glow/60'
      : 'border-black/10 bg-white/70 hover:border-black/20';

  return (
    <motion.button
      type="button"
      whileTap={reduced ? undefined : { scale: 0.85 }}
      onClick={(e) => {
        e.stopPropagation();
        toggle(kind, id);
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
      title={active ? 'Favorited' : 'Add to favorites'}
      className={`grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition-colors ${ring}`}
    >
      <Star
        size={16}
        className={
          active
            ? 'fill-amber-400 text-amber-400'
            : tone === 'shell'
              ? 'text-shell-mute'
              : 'text-black/40'
        }
      />
    </motion.button>
  );
}
