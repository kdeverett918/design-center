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
        // Neutral showroom shell chrome (fixed, not themed).
        shell: {
          base: '#0b0b0f',
          panel: '#15151c',
          line: '#26262f',
          ink: '#f5f5f4',
          mute: '#9a9aa6',
          glow: '#c9b8ff',
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
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
        float: 'float 4s ease-in-out infinite',
        'gradient-drift': 'gradient-drift 8s ease-in-out infinite',
        'cta-pulse': 'cta-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
