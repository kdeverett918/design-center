import { Suspense, lazy } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import './App.css';
import FavoritesProvider from './contexts/FavoritesProvider';
import NavBar from './components/layout/NavBar';
import ErrorBoundary from './components/layout/ErrorBoundary';

// Code-split the two views so the initial bundle stays lean.
const GalleryView = lazy(() => import('./views/GalleryView'));
const MoodBoardView = lazy(() => import('./views/MoodBoardView'));

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
        <p className="mt-2 text-sm text-shell-mute">That route doesn’t exist in the Design Center.</p>
        <Link
          to="/"
          className="mt-5 inline-block rounded-full bg-shell-glow px-5 py-2 text-sm font-semibold text-shell-base"
        >
          Back to the gallery
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <FavoritesProvider>
      <div className="min-h-screen">
        <NavBar />
        <ErrorBoundary>
          <Suspense fallback={<ViewFallback />}>
            <Routes>
              <Route path="/" element={<GalleryView />} />
              <Route path="/moodboard" element={<MoodBoardView />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>

        <footer className="border-t border-shell-line px-5 py-6 text-center text-xs text-shell-mute sm:px-8">
          Tech SLP Studio · Design Center — a living style gallery. Build a brief in the mood board.
        </footer>
      </div>
    </FavoritesProvider>
  );
}
