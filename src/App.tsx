import { Suspense, lazy } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import './App.css';
import FavoritesProvider from './contexts/FavoritesProvider';
import NavBar from './components/layout/NavBar';
import ErrorBoundary from './components/layout/ErrorBoundary';
import MoodBoardView from './views/MoodBoardView';

// Code-split the views so the initial bundle stays lean.
const GalleryView = lazy(() => import('./views/GalleryView'));
const FavoritesView = lazy(() => import('./views/FavoritesView'));

function ViewFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-shell-line border-t-shell-glow" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6 text-center">
      <div>
        <h2 className="font-display text-3xl font-semibold text-shell-ink">Page not found</h2>
        <p className="mt-2 text-sm text-shell-mute">That route does not exist in the Design Center.</p>
        <Link
          to="/"
          className="mt-5 inline-block rounded-full bg-shell-glow px-5 py-2 text-sm font-semibold text-shell-base"
        >
          Back to the mood board
        </Link>
      </div>
    </div>
  );
}

// Subtle per-route entrance so navigating feels deliberate, not a hard cut.
// Keyed on pathname; reduced-motion users get a plain mount (no offset/fade).
function RouteTransition() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
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
        <Route path="/favorites" element={<FavoritesView />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </motion.div>
  );
}

export default function App() {
  return (
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
  );
}
