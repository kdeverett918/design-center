# Design Center — Phase 0 Audit (2026-06-09)

Audit of the live codebase against the "E2E Improvement Plan" handoff doc.
**Headline:** the app has evolved far past the plan's assumed baseline. Most of
Phase 1 (shell DNA), Phase 2 (live cards), Phase 4 (send pipeline), and Phase 5
(library size) already exist and work. This audit records what exists, what's
missing, and where the plan is superseded.

## 1. Route inventory

| Route | Renders | Status |
|---|---|---|
| `/` | MoodBoardView (builder is the home page) | ✅ works |
| `/moodboard` | redirect → `/` | ✅ |
| `/gallery` | GalleryView (5 tabs: Themes/Palettes/Fonts/Layouts/Animations) | ✅ lazy-loaded |
| `/favorites` | FavoritesView ("Your shortlist") + SendShortlist | ✅ lazy-loaded |
| `*` | designed 404 | ✅ |

No dead links. No quiz/guided route. No about/credibility section. Footer has
no link to thetechslp.com.

## 2. Data completeness

| Entity | Count | Plan target | Gaps |
|---|---|---|---|
| Palettes | 50 | ≥18 ✅ | **no blurb/usage note** (name + moods + 7 colors only) |
| Font pairings | 43 | ≥18 ✅ | personality ✅; **no specimen sentence field** |
| Themes | 46 | ≥12 ✅ | tagline ✅, heroImage ✅; **no "who this is for" narrative** |
| Animations | 39 | ✅ | full spec (duration/easing/intensity) ✅ |
| Layouts | 29 | ✅ | live themed previews ✅ |
| Collections | 10 | — | ✅ |

Taxonomy (`src/data/taxonomy.ts`): 11 moods, 8 industries — validated by tests.
**Missing industries vs plan targets:** hospitality/food, fitness (luxury &
finance map acceptably onto `premium/elegant` moods + `professional`).

## 3. Theme engine — healthy

- CSS custom properties scoped per-container (`ThemedScope`, `PreviewFrame`) — no iframes.
- `bestOn()` computes WCAG-safe on-primary/on-accent text. All 50 palettes pass
  automated AA contrast tests (`contrast.test.ts`).
- Fonts load on demand per pairing id with `display=swap` + preconnect; deduped.
  Off-screen previews lazy-mount via IntersectionObserver (`LazyMount`, 300px margin).

## 4. Favorites / selection state

- localStorage `dc:favorites:v1` (Set of `kind:id`) — survives refresh ✅, grouped by type ✅.
- Mood board state persists at `dc:moodboard:v1`; share links via `?b=<token>` ✅.
- **Missing:** per-favorite notes, ordering/reorder, shortlist share link.
- **No auth anywhere — confirmed, and per Kristine this stays (no sign-ins).**

## 5. Mobile

e2e/mobile.spec.ts covers 375px: no horizontal overflow on all 3 routes, nav
rail, tabs, send button, deep links — all passing. No known breaks.

## 6. Performance baseline

- Build: main chunk **778 KB min / 227 KB gz** (heavy), CSS 43 KB. GalleryView/
  FavoritesView/LayoutCard split out.
- Contributors: full `framer-motion` import (18 files), `lucide-react` (25 files),
  all data in main chunk, MoodBoardView eager (it's home — intentional).
- Theme images: 46 webp, 2.19 MB total, lazy-loaded ✅.

## 7. SEO / meta

- Title + description + OG/twitter text tags ✅, theme-color ✅, no-flash dark
  mode script ✅, font preconnect ✅.
- **Missing:** og:image (none exists), per-route document titles, sitemap.xml,
  robots.txt. render.yaml has SPA rewrite + immutable asset caching ✅.

## 8. Accessibility

- Strong: useReducedMotion in 10 components + global CSS reduce, focus-visible
  ring, modal focus trap + restore, aria labels/pressed on stars & tabs.
- **Missing:** skip-to-content link; clipboard-failure feedback; no axe pass.

## Plan deviations (working features kept, per plan's own rule)

1. **Shell DNA (Phase 1) largely exists** — `#0b0b0f` canvas, `shell-glow`
   accent, SVG noise overlay @0.04, premium easing `cubic-bezier(0.25,0.46,0.45,0.94)`,
   Space Grotesk display. Remaining: body font is **Inter** (anti-pattern radar),
   landing hero copy, how-it-works strip, credibility/footer CTA.
2. **Phase 4 pipeline redesigned around no-auth** — Web3Forms email (live, with
   mailto fallback), print-stylesheet PDF, board share links. Firebase magic-link,
   Firestore docs, `/brief/:id` server pages are **dropped by user decision**
   ("no sign ins required"). Shareable URL tokens replace `/brief/:id`.
3. **Phase 5 counts already exceeded** — expansion = taxonomy additions + copy
   depth, not new items.
4. **Live contrast warnings in builder: N/A** — palettes are fixed tokens,
   pre-validated AA in unit tests; users can't compose failing combinations.
5. **CompareView removed** in prior session (superseded by gallery preview + shortlist).
