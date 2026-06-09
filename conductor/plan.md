# Design Center v2.0 — Implementation Plan (adapted from handoff doc)

Legend: [ ] todo · [~] in progress · [x] done · [-] dropped (see audit.md deviations)

## Phase 0 — Audit
- [x] Full audit → `conductor/audit.md`
- [x] Checkpoint commit of inherited in-flight work (008a2ba)

## Phase 1 — Shell DNA & landing (gaps only) — commit 6b6262d
- [x] Dark canvas, accent, noise, easing signature — already shipped (kept)
- [x] Shell body font Inter → Instrument Sans (display stays Space Grotesk)
- [x] Landing hero: "Stop describing your dream website. Point at it."
- [x] How-it-works strip (Start → Make it yours → Star → Send), scroll-revealed
- [x] Credibility strip + footer CTA → thetechslp.com
- [x] Skip-to-content link

## Phase 2 — Cards & gallery — commit 52e65e1
- [x] Live themed cards + palette hex copy w/ confirmation — already shipped (kept)
- [x] Gallery: mood + industry filter chips, result count, clear-all
- [x] Token search across names/tags/personalities (all five tabs)
- [x] Designed empty state for zero results
- [x] FontCard: unique specimen per pairing (see Phase 3 data)

## Phase 3 — Content & guided mode — commit e4a7fe1
- [x] Palette blurbs (all 50), rendered on cards
- [x] Font specimen sentences (all 43), pangram banned + tested
- [x] Theme "who this is for" stories (all 46), rendered on cards
- [x] Taxonomy: +hospitality +fitness (8 → 10 industries), 12 themes tagged
- [x] /start guided quiz: 5 questions → top-3 themes with reasoning + seed links
- [x] Completeness/uniqueness enforced in data tests (6 quiz personas tested)

## Phase 4 — Favorites & brief pipeline (no sign-ins — user decision) — commit b757d97
- [x] Web3Forms send + mailto fallback + PDF print copy — shipped (kept)
- [x] Favorites v2: ordered entries + per-favorite notes (v1 migrated)
- [x] Reorder within groups (touch-friendly up/down)
- [x] Shortlist share link (/favorites?s=) with consent-based import banner
- [x] Notes travel into the emailed brief text
- [-] Firebase auth / magic link / Firestore / server `/brief/:id` — dropped (no sign-ins)

## Phase 5 — Library expansion
- [x] Counts already exceed all targets (50/43/46/39/29) — no bulk additions needed
- [x] Hospitality/fitness/luxury/finance personas reachable via tags + quiz
- [x] Automated AA contrast tests over all palettes — shipped (kept)

## Phase 6 — Quality gates → v2.0
- [x] Per-route document titles
- [x] OG image (1200×630 shell-aesthetic JPEG) + og/twitter image tags
- [x] sitemap.xml + robots.txt
- [x] framer-motion → LazyMotion/m everywhere (domAnimation, strict)
- [x] Font loading: featured-only on home; full picker on disclosure; FontCard in-view loading
- [x] Clipboard failure feedback (share buttons)
- [x] render.yaml: index/theme-image cache policy + security headers
- [x] e2e: quiz, filters, favorites v2, titles (61 passed / 9 viewport-skipped)
- [x] Tag v2.0, push, Render deploy live & smoke-checked (555d4db)

## Notes
- Main bundle 772 KB min / 222 KB gz: this is the home mood-board experience
  itself (preview engine + library data); route-level splitting already in
  place for gallery/favorites/quiz. LazyMotion guards future motion bloat.
- Live contrast warnings in the mixer: N/A — palettes are fixed, pre-validated
  AA in unit tests; no composable failing combination exists.

## Post-v2.0 — Creative flair pass (commit 11de0a2, deployed)
- [x] Quiz: live narrowing rail + front-runner preview, typeface-dressed vibe
      chips, palette-token light/dark mocks, looping motion demos, density
      anatomy mocks, ghost numerals, expo-ease staggers, asymmetric results
      (Best-match spotlight + match meters)
- [x] Shell: theme ticker rail (hover-pause, reduced-motion static), drifting
      hero glows, designed 404, hover lift/glow on palette & font cards

## Post-v2.0 — UI/UX readability & compactness pass (commit 523eac6)
- [x] Dark-mode contrast: --shell-mute brightened (#9a9aa6 → #b1b0bd); smallest
      caption sizes bumped
- [x] Palette & type pickers → compact dropdown listboxes (featured groups,
      Light/Dark badges, own-face font names, outside-click/Esc); panel now
      fits ~1 viewport
- [x] Active-pairing-only font loading; library faces fetch on menu open
- [x] Fixed "m as motion" sed casualty in send-form copy
- [x] Verified 1440px + 375px, dark + light; 117 unit / 68 e2e green
