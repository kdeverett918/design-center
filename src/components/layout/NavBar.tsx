import { NavLink } from 'react-router-dom';
import { Activity, Moon, Star, Sun } from 'lucide-react';
import { useFavorites } from '../../contexts/favoritesContext';
import { useColorMode } from '../../hooks/useColorMode';

const links = [
  { to: '/', label: 'Gallery', end: true },
  { to: '/moodboard', label: 'Mood board', end: false },
];

export default function NavBar() {
  const { count } = useFavorites();
  const [mode, toggleMode] = useColorMode();

  return (
    <header className="sticky top-0 z-30 border-b border-shell-line bg-shell-base/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3.5 sm:px-8">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-shell-glow to-[#7c9eff]">
              <Activity size={18} className="text-shell-base" />
            </span>
            <div className="leading-tight">
              <div className="font-display text-[15px] font-semibold text-shell-ink">
                Design Center
              </div>
              <div className="text-[11px] text-shell-mute">Tech SLP Studio</div>
            </div>
          </NavLink>

          <nav className="flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-shell-glow/15 text-shell-ink'
                      : 'text-shell-mute hover:text-shell-ink'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMode}
            aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
            className="grid h-9 w-9 place-items-center rounded-full border border-shell-line bg-shell-panel text-shell-mute transition-colors hover:text-shell-ink"
          >
            {mode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <NavLink
            to="/favorites"
            aria-label={`Shortlist — ${count} ${count === 1 ? 'item' : 'items'} favorited`}
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              isActive
                ? 'border-shell-glow/60 bg-shell-glow/10 text-shell-ink'
                : 'border-shell-line bg-shell-panel text-shell-mute hover:text-shell-ink'
            }`
          }
        >
            <Star size={14} className="text-amber-400" aria-hidden="true" />
            <span className="font-medium text-shell-ink">{count}</span>
            <span className="hidden sm:inline">shortlist</span>
          </NavLink>
        </div>
      </div>
    </header>
  );
}
