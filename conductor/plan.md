# Design Center v2.0 — Implementation Plan (adapted from handoff doc)

Legend: [ ] todo · [~] in progress · [x] done · [-] dropped (see audit.md deviations)

## Phase 0 — Audit
- [x] Full audit → `conductor/audit.md`
- [x] Checkpoint commit of inherited in-flight work (008a2ba)

## Phase 1 — Shell DNA & landing (gaps only)
- [x] Dark canvas, accent, noise, easing signature — already shipped (kept)
- [ ] Swap shell body font Inter → characterful quiet sans (display stays Space Grotesk)
- [ ] Landing hero: bolder statement copy ("Stop describing your dream website. Point at it.")
- [ ] How-it-works strip (Browse → Star → Mix → Send), scroll-revealed
- [ ] Credibility strip + footer CTA → thetechslp.com
- [ ] Skip-to-content link

## Phase 2 — Cards & gallery
- [x] Live themed cards (themes/palettes/fonts/layouts/animations) — shipped (kept)
- [ ] PaletteCard: hex + role reveal, one-click copy w/ confirmation
- [ ] Gallery: mood + industry filter chips, animated reflow, result count, clear-all
- [ ] Fuzzy search across names/tags
- [ ] Designed empty state for zero results
- [ ] FontCard: unique specimen sentence per pairing (banned: "quick brown fox")

## Phase 3 — Content & guided mode
- [ ] Palette blurbs + usage notes (all 50)
- [ ] Font specimen sentences (all 43)
- [ ] Theme "who this is for" narratives (all 46)
- [ ] Taxonomy: add `hospitality`, `fitness` industries (8 → 10) + tag items
- [ ] `/start` guided quiz: 5 questions → 2–3 recommended themes with reasoning
- [ ] Microcopy/educational pass

## Phase 4 — Favorites & brief pipeline (no sign-ins — by user decision)
- [x] Web3Forms send + mailto fallback + PDF print copy — shipped (kept)
- [x] Mood-board share links (`?b=` token) — shipped (kept)
- [ ] Favorites v2: ordered list + per-favorite notes (migrate `dc:favorites:v1` → v2)
- [ ] Reorder favorites (move up/down — touch-friendly)
- [ ] Shortlist share link (`/favorites?s=` token)
- [-] Firebase auth / magic link / Firestore / server `/brief/:id` — dropped (no sign-ins)

## Phase 5 — Library expansion
- [x] Counts exceed all targets (50/43/46/39/29) — no new bulk items
- [x] Automated AA contrast tests over all palettes — shipped (kept)
- [ ] Industry coverage tags for hospitality/fitness/luxury/finance personas

## Phase 6 — Quality gates → v2.0
- [ ] Per-route document titles + meta
- [ ] OG image (1200×630, shell aesthetic) + tags
- [ ] sitemap.xml + robots.txt
- [ ] Bundle: LazyMotion/`m` migration or manualChunks (target < 600 KB main)
- [ ] Clipboard failure feedback
- [ ] render.yaml: index.html cache policy + security headers
- [ ] Quiz + filters + favorites-v2 unit & e2e tests; full suite green
- [ ] Tag v2.0, push, verify Render deploy
