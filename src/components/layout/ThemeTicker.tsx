import { Link } from 'react-router-dom';
import { themes } from '../../data/themes';
import { paletteById } from '../../data/palettes';

// A slow editorial rail of every theme in the library — each name carries its
// own palette dot, and each is a real link into the gallery. The list is
// rendered twice so the -50% keyframe loops seamlessly; reduced-motion users
// get a static, scrollable rail instead.
export default function ThemeTicker() {
  const items = themes.map((t) => ({
    id: t.id,
    name: t.name,
    color: paletteById(t.paletteId)?.colors.primary ?? '#888888',
  }));

  const rail = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex w-max shrink-0 items-center gap-7 pr-7"
    >
      {items.map((t) => (
        <li key={t.id} className="shrink-0">
          <Link
            to={`/gallery?theme=${t.id}`}
            tabIndex={hidden ? -1 : undefined}
            className="group flex items-center gap-2 text-[13px] font-medium text-shell-mute transition-colors hover:text-shell-ink"
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full ring-1 ring-black/20 transition-transform group-hover:scale-150"
              style={{ backgroundColor: t.color }}
            />
            <span className="whitespace-nowrap font-display">{t.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      aria-label={`All ${items.length} themes — tap any to preview it`}
      className="relative overflow-x-auto border-b border-shell-line py-3 [scrollbar-width:none] motion-safe:overflow-hidden [&::-webkit-scrollbar]:hidden"
    >
      {/* edge fades so the rail dissolves instead of clipping */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-shell-base to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-shell-base to-transparent"
      />
      <div className="flex w-max motion-safe:animate-ticker motion-safe:hover:[animation-play-state:paused]">
        {rail(false)}
        {rail(true)}
      </div>
    </div>
  );
}
