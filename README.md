# Design Center · Tech SLP Studio

A client-facing design gallery. Clients browse **themes, color palettes, font pairings, and
animations** — each rendered as a **live, self-themed, in-motion preview** — and watch a full
sample marketing page **re-theme instantly** when they pick one. The front door of Tech SLP
Studio: it turns "what should my site look like?" into a concrete, visual selection.

## Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS 3.4** — design tokens mapped to CSS variables so utilities re-theme live
- **Framer Motion** — stagger-in, looping animation demos, preview cross-fade
- **Lucide React** — icons
- No backend in this phase. The design library is static, typed data in the repo.

## The core mechanic

Every visual choice maps to CSS custom properties (`--color-primary`, `--font-heading`, …).
`applyTheme()` writes a palette + font pairing onto any container; `loadFonts()` injects the
Google Fonts for it. Components are styled **only** with token utilities (`bg-primary`,
`text-ink`, `font-heading`) plus `tk-*` `color-mix` helpers — so a subtree becomes whatever
theme is scoped to it. `ThemedScope` lets many themes coexist on one screen, each in its own
colors. The big `SamplePage` is token-only and re-themes on selection.

## Architecture — two layers

1. **The Library** (`src/data/*`) — static curated content: 12 palettes, 12 font pairings,
   8 themes, 15 animation presets, layout presets. No database. The single source of truth;
   no color/font literals live outside it.
2. **Client Selections** — favorites/mixes/submissions. Local React state today
   (`FavoritesProvider`); the context boundary lets it swap to a backend later with no UI churn.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build  -> dist/
npm run lint
```

## Deploy

Render static site (see `render.yaml`): build `npm install && npm run build`, publish `dist/`.
Auto-deploys from `main`.

## Project structure

```
src/
  types.ts                 # the full type system (incl. ClientSelection seam)
  data/                    # palettes, fonts, themes, animations, layouts
  theme/                   # applyTheme, loadFonts, ThemedScope
  contexts/                # FavoritesProvider + favorites context/hook
  components/
    cards/                 # ThemeCard, PaletteCard, FontCard, AnimationCard, AnimationDemo
    gallery/               # Gallery (tabbed: Themes / Palettes / Fonts / Animations)
    preview/               # SamplePage, MiniSamplePage, PreviewFrame
  App.tsx                  # neutral showroom shell + gallery + live preview pane
```

## Roadmap (next phases)

- Mood/industry **filtering** + favorites view
- **Firebase** auth + saved client selections + per-client workspace
- **Mood board** a-la-carte builder + animation-intensity toggle in preview
- **Design brief** export (PDF / email)
