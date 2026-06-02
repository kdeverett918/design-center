/**
 * Design Center brand mark — an animated "design-system nucleus".
 *
 * A glassy, beveled hub sits at the center with a focusing aperture glyph. Four
 * luminous satellites — one per gallery axis (themes / palettes / fonts /
 * motion) — orbit on the outer ring, each tethered to the hub by a thin spoke
 * with energy flowing along it. A second micro-orbit counter-rotates inside for
 * parallax depth, and a soft halo breathes behind everything.
 *
 * Pure SVG + Tailwind keyframes — no JS animation loop — so the global
 * `prefers-reduced-motion` rule in index.css freezes every loop for free. The
 * hub gradient and accents track `--shell-glow`, so the mark re-tints between
 * the light and dark showroom shells.
 */

const SATELLITES = [
  { x: 24, y: 7, r: 2.2, color: 'var(--shell-glow)' }, // themes
  { x: 41, y: 24, r: 1.9, color: '#7c9eff' }, // motion
  { x: 24, y: 41, r: 2.2, color: '#4fd1c5' }, // fonts
  { x: 7, y: 24, r: 1.9, color: '#f6ad55' }, // palettes
];

// Spokes run from just outside the hub face to each satellite, so they read as
// connectors rather than crossing through the hub.
const SPOKES = [
  { x1: 24, y1: 14.6, x2: 24, y2: 8.4 },
  { x1: 33.4, y1: 24, x2: 39.6, y2: 24 },
  { x1: 24, y1: 33.4, x2: 24, y2: 39.6 },
  { x1: 14.6, y1: 24, x2: 8.4, y2: 24 },
];

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`relative inline-grid place-items-center ${className}`}>
      <svg
        viewBox="0 0 48 48"
        width="100%"
        height="100%"
        role="img"
        aria-label="Design Center"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="dc-hub" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="var(--shell-glow)" />
            <stop offset="55%" stopColor="#8a8cff" />
            <stop offset="100%" stopColor="#6f8cff" />
          </linearGradient>
          {/* Glassy top sheen for the hub bevel. */}
          <linearGradient id="dc-sheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="dc-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--shell-glow)" stopOpacity="0.45" />
            <stop offset="65%" stopColor="var(--shell-glow)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--shell-glow)" stopOpacity="0" />
          </radialGradient>
          {/* Soft bloom that makes satellites read as luminous. */}
          <filter id="dc-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        {/* Breathing halo. */}
        <circle
          cx="24"
          cy="24"
          r="24"
          fill="url(#dc-halo)"
          className="origin-center animate-logo-glow [transform-box:fill-box]"
        />

        {/* Outer orbit guide. */}
        <circle
          cx="24"
          cy="24"
          r="17"
          fill="none"
          stroke="var(--shell-glow)"
          strokeOpacity="0.22"
          strokeWidth="0.7"
          strokeDasharray="0.5 3.4"
          strokeLinecap="round"
        />

        {/* Counter-rotating inner micro-orbit for parallax depth. */}
        <g className="origin-center animate-orbit-reverse [transform-box:fill-box]">
          <circle cx="32.5" cy="15.5" r="1" fill="var(--shell-glow)" fillOpacity="0.6" />
          <circle cx="15.5" cy="32.5" r="1" fill="var(--shell-glow)" fillOpacity="0.6" />
        </g>

        {/* Spokes + satellites orbit together, drawn beneath the hub. */}
        <g className="origin-center animate-orbit [transform-box:fill-box]">
          <g
            className="animate-logo-flow"
            stroke="var(--shell-glow)"
            strokeOpacity="0.4"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeDasharray="0.5 2.6"
          >
            {SPOKES.map((s, i) => (
              <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
            ))}
          </g>
          <g className="animate-logo-twinkle">
            {SATELLITES.map((s, i) => (
              <g key={i}>
                <circle cx={s.x} cy={s.y} r={s.r + 1.1} fill={s.color} opacity="0.5" filter="url(#dc-glow)" />
                <circle cx={s.x} cy={s.y} r={s.r} fill={s.color} />
              </g>
            ))}
          </g>
        </g>

        {/* Glassy hub. */}
        <g className="origin-center animate-logo-pulse [transform-box:fill-box]">
          <rect x="14.5" y="14.5" width="19" height="19" rx="6.5" fill="url(#dc-hub)" />
          <rect x="14.5" y="14.5" width="19" height="19" rx="6.5" fill="url(#dc-sheen)" />
          {/* Bevel highlight. */}
          <rect
            x="15.25"
            y="15.25"
            width="17.5"
            height="17.5"
            rx="5.9"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.35"
            strokeWidth="0.6"
          />
          {/* Focusing aperture glyph. */}
          <circle
            cx="24"
            cy="24"
            r="3.4"
            fill="none"
            stroke="var(--shell-base)"
            strokeOpacity="0.85"
            strokeWidth="1.1"
          />
          <circle cx="24" cy="24" r="1.15" fill="var(--shell-base)" fillOpacity="0.9" />
        </g>
      </svg>
    </span>
  );
}
