/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Design tokens map to CSS variables so utilities re-theme live.
      // applyTheme() rewrites these vars on any scoped container.
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        surface: 'var(--color-surface)',
        bg: 'var(--color-bg)',
        onPrimary: 'var(--color-on-primary)',
        onAccent: 'var(--color-on-accent)',
        // Studio showroom shell chrome — switchable light/dark via CSS vars.
        shell: {
          base: 'var(--shell-base)',
          panel: 'var(--shell-panel)',
          line: 'var(--shell-line)',
          ink: 'var(--shell-ink)',
          mute: 'var(--shell-mute)',
          glow: 'var(--shell-glow)',
        },
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
        // The studio's own brand face — Space Grotesk display + Inter UI.
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(-6px)' },
          '50%': { transform: 'translateY(6px)' },
        },
        'gradient-drift': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'cta-pulse': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
          '50%': { boxShadow: '0 0 0 8px rgba(0,0,0,0.08)' },
        },
        // Brand mark: satellites tracing a slow orbit around the hub.
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        // Brand mark: hub breathes; halo glows in counterpoint.
        'logo-pulse': {
          '0%,100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'logo-glow': {
          '0%,100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        // Brand mark: energy flowing along the hub→satellite spokes.
        'logo-flow': {
          '0%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '-14' },
        },
        // Brand mark: satellites twinkle as they orbit.
        'logo-twinkle': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        float: 'float 4s ease-in-out infinite',
        'gradient-drift': 'gradient-drift 8s ease-in-out infinite',
        'cta-pulse': 'cta-pulse 2s ease-in-out infinite',
        orbit: 'orbit 26s linear infinite',
        'orbit-reverse': 'orbit 38s linear infinite reverse',
        'logo-pulse': 'logo-pulse 4.5s ease-in-out infinite',
        'logo-glow': 'logo-glow 4.5s ease-in-out infinite',
        'logo-flow': 'logo-flow 3s linear infinite',
        'logo-twinkle': 'logo-twinkle 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
