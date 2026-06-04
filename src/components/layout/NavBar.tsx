import { NavLink } from 'react-router-dom';
import { Columns2, LayoutGrid, Moon, Shuffle, Star, Sun } from 'lucide-react';
import { useFavorites } from '../../contexts/favoritesContext';
import { useColorMode } from '../../hooks/useColorMode';
import Logo from './Logo';

const links = [
  { to: '/', label: 'Gallery', end: true, icon: LayoutGrid },
  { to: '/moodboard', label: 'Mood board', end: false, icon: Shuffle },
  { to: '/compare', label: 'Compare', end: false, icon: Columns2 },
];

export default function NavBar() {
  const { count } = useFavorites();
  const [mode, toggleMode] = useColorMode();

  return (
    <header className="sticky top-0 z-30 bg-shell-base/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <div className="flex items-center gap-4 sm:gap-5">
          <NavLink
            to="/"
            className="group flex items-center gap-3"
            aria-label="Design Center — home"
          >
            <Logo className="h-10 w-10 shrink-0 transition-transform duration-500 ease-premium motion-safe:group-hover:scale-105" />
            <div className="hidden leading-tight min-[400px]:block">
              <div className="whitespace-nowrap font-display text-[15px] font-semibold tracking-tight text-shell-ink">
                Design Center
              </div>
              <div className="hidden whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.22em] text-shell-mute sm:block">
                Tech SLP Studio
              </div>
            </div>
          </NavLink>

          <span className="hidden h-7 w-px bg-shell-line sm:block" aria-hidden="true" />

          {/* Primary nav lives in an inset pill rail for a more deliberate, designed feel. */}
          <nav className="flex items-center gap-0.5 rounded-full border border-shell-line bg-shell-panel/50 p-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                aria-label={l.label}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition-all duration-300 ease-premium sm:px-3.5 ${
                    isActive
                      ? 'bg-shell-glow/15 text-shell-ink shadow-[inset_0_0_0_1px_var(--shell-line)]'
                      : 'text-shell-mute hover:bg-shell-ink/5 hover:text-shell-ink'
                  }`
                }
              >
                <l.icon size={15} className="shrink-0" />
                <span className="hidden sm:inline">{l.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Clear 2-option mode switch — the active mode is highlighted. */}
          <div
            role="group"
            aria-label="Color mode"
            className="flex items-center gap-0.5 rounded-full border border-shell-line bg-shell-panel/60 p-0.5 shadow-sm"
          >
            <button
              type="button"
              aria-pressed={mode === 'light'}
              aria-label="Light mode"
              onClick={() => mode !== 'light' && toggleMode()}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-300 ease-premium ${
                mode === 'light'
                  ? 'bg-shell-glow/20 text-shell-ink shadow-[inset_0_0_0_1px_var(--shell-line)]'
                  : 'text-shell-mute hover:text-shell-ink'
              }`}
            >
              <Sun size={14} />
              <span className="hidden sm:inline">Light</span>
            </button>
            <button
              type="button"
              aria-pressed={mode === 'dark'}
              aria-label="Dark mode"
              onClick={() => mode !== 'dark' && toggleMode()}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-300 ease-premium ${
                mode === 'dark'
                  ? 'bg-shell-glow/20 text-shell-ink shadow-[inset_0_0_0_1px_var(--shell-line)]'
                  : 'text-shell-mute hover:text-shell-ink'
              }`}
            >
              <Moon size={14} />
              <span className="hidden sm:inline">Dark</span>
            </button>
          </div>

          <NavLink
            to="/favorites"
            aria-label={`Shortlist — ${count} ${count === 1 ? 'item' : 'items'} favorited`}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm shadow-sm transition-all duration-300 ease-premium will-change-transform motion-safe:hover:scale-[1.03] ${
                isActive
                  ? 'border-shell-glow/60 bg-shell-glow/10 text-shell-ink'
                  : 'border-shell-line bg-shell-panel/60 text-shell-mute motion-safe:hover:-translate-y-px hover:border-shell-glow/40 hover:text-shell-ink'
              }`
            }
          >
            <Star size={14} className="text-amber-400" aria-hidden="true" />
            <span className="font-medium text-shell-ink">{count}</span>
            <span className="hidden sm:inline">shortlist</span>
          </NavLink>
        </div>
      </div>

      {/* Layered gradient hairline — a soft glow seam under the chrome. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-shell-line to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-shell-glow/40 to-transparent" />
    </header>
  );
}
