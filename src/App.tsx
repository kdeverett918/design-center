import { Suspense, lazy, useEffect } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LazyMotion, domAnimation, m as motion, useReducedMotion } from 'framer-motion';
import './App.css';
import FavoritesProvider from './contexts/FavoritesProvider';
import NavBar from './components/layout/NavBar';
import ErrorBoundary from './components/layout/ErrorBoundary';
import MoodBoardView from './views/MoodBoardView';

// Code-split the views so the initial bundle stays lean.
const GalleryView = lazy(() => import('./views/GalleryView'));
const FavoritesView = lazy(() => import('./views/FavoritesView'));
const QuizView = lazy(() => import('./views/QuizView'));

function ViewFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-shell-line border-t-shell-glow" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="relative grid min-h-[60vh] place-items-center overflow-hidden px-6 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[11rem] font-semibold leading-none text-shell-ink/[0.045] sm:text-[18rem]"
      >
        404
      </div>
      <div className="relative">
        {/* a swatch row with one missing — the joke does the wayfinding */}
        <div aria-hidden="true" className="mx-auto mb-6 flex items-end justify-center gap-2">
          <span className="h-9 w-9 -rotate-6 rounded-xl bg-shell-glow/80 ring-1 ring-black/20" />
          <span className="h-9 w-9 rotate-3 rounded-xl bg-amber-400/70 ring-1 ring-black/20" />
          <span className="grid h-9 w-9 rotate-12 place-items-center rounded-xl border-2 border-dashed border-shell-line text-base text-shell-mute">
            ?
          </span>
          <span className="h-9 w-9 -rotate-3 rounded-xl bg-rose-400/70 ring-1 ring-black/20" />
        </div>
        <h2 className="font-display text-3xl font-semibold text-shell-ink sm:text-4xl">
          That swatch isn&rsquo;t in the library.
        </h2>
        <p className="mt-2 text-sm text-shell-mute">
          The page you wanted doesn&rsquo;t exist — but 46 good-looking ones do.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            to="/"
            className="inline-block rounded-full bg-shell-glow px-5 py-2 text-sm font-semibold text-shell-base"
          >
            Back to the mood board
          </Link>
          <Link
            to="/gallery"
            className="inline-block rounded-full border border-shell-line px-5 py-2 text-sm font-semibold text-shell-mute transition-colors hover:text-shell-ink"
          >
            Browse the gallery
          </Link>
        </div>
      </div>
    </div>
  );
}

// Per-route document titles so tabs, history, and screen readers can tell the
// views apart (the SPA otherwise keeps one title forever).
const ROUTE_TITLES: Record<string, string> = {
  '/': 'Design Center · Tech SLP Studio',
  '/gallery': 'Theme Gallery · Design Center · Tech SLP Studio',
  '/start': 'Find Your Style · Design Center · Tech SLP Studio',
  '/favorites': 'Your Shortlist · Design Center · Tech SLP Studio',
};

function useRouteTitle(pathname: string) {
  useEffect(() => {
    document.title = ROUTE_TITLES[pathname] ?? 'Design Center · Tech SLP Studio';
  }, [pathname]);
}

// Subtle per-route entrance so navigating feels deliberate, not a hard cut.
// Keyed on pathname; reduced-motion users get a plain mount (no offset/fade).
function RouteTransition() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  useRouteTitle(pathname);
  const instantRoute = pathname === '/' || pathname === '/moodboard';
  return (
    <motion.div
      key={pathname}
      initial={reduce || instantRoute ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        instantRoute ? { duration: 0 } : { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
      }
    >
      <Routes>
        <Route path="/" element={<MoodBoardView />} />
        <Route path="/moodboard" element={<Navigate to="/" replace />} />
        <Route path="/gallery" element={<GalleryView />} />
        <Route path="/start" element={<QuizView />} />
        <Route path="/favorites" element={<FavoritesView />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </motion.div>
  );
}

export default function App() {
  return (
    // LazyMotion + m (aliased to `motion` everywhere) keeps framer-motion's
    // full feature bundle out of the initial chunk; domAnimation covers every
    // feature in use (enter/exit, hover, in-view). `strict` guards regressions.
    <LazyMotion features={domAnimation} strict>
      <FavoritesProvider>
      <div className="min-h-screen">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-shell-glow px-4 py-2 text-sm font-semibold text-shell-base focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <NavBar />
        <ErrorBoundary>
          <Suspense fallback={<ViewFallback />}>
            <main id="main">
              <RouteTransition />
            </main>
          </Suspense>
        </ErrorBoundary>

        <footer className="border-t border-shell-line px-5 py-8 text-center sm:px-8">
          <p className="text-xs text-shell-mute">
            Tech SLP Studio · Design Center. Build a direction, shortlist ideas, and send a brief.
          </p>
          <p className="mt-2 text-xs text-shell-mute">
            Every theme here is built and maintained by the studio — want a site like the ones
            you&rsquo;re previewing?{' '}
            <a
              href="https://thetechslp.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-shell-glow underline decoration-shell-glow/40 underline-offset-2 hover:decoration-shell-glow"
            >
              Visit thetechslp.com
            </a>
          </p>
        </footer>
      </div>
      </FavoritesProvider>
    </LazyMotion>
  );
}
