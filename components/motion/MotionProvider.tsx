'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};

  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function getReducedMotionSnapshot() {
  return typeof window === 'undefined' || !window.matchMedia
    ? true
    : window.matchMedia(reducedMotionQuery).matches;
}

// Hydration starts without motion; the browser preference enables it afterward.
function getServerSnapshot() {
  return true;
}

type MotionPreference = {
  enabled: boolean;
  reducedMotion: boolean;
  paused: boolean;
  toggleMotion: () => void;
};

const MotionContext = createContext<MotionPreference | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerSnapshot,
  );
  const [paused, setPaused] = useState(false);
  const toggleMotion = useCallback(() => setPaused((value) => !value), []);
  const enabled = !reducedMotion && !paused;
  const preference = useMemo(
    () => ({ enabled, reducedMotion, paused, toggleMotion }),
    [enabled, reducedMotion, paused, toggleMotion],
  );

  return (
    <MotionContext.Provider value={preference}>
      <div data-motion-enabled={enabled ? 'true' : 'false'} data-reduced-motion={reducedMotion ? 'true' : 'false'}>
        {children}
      </div>
    </MotionContext.Provider>
  );
}

export function useMotionPreference(): MotionPreference {
  const preference = useContext(MotionContext);
  if (!preference) throw new Error('useMotionPreference must be used inside MotionProvider.');
  return preference;
}

export function MotionToggle({ className = '' }: { className?: string }) {
  const { enabled, reducedMotion, toggleMotion } = useMotionPreference();

  return (
    <button
      type="button"
      data-motion-toggle=""
      aria-pressed={enabled}
      disabled={reducedMotion}
      onClick={toggleMotion}
      title={reducedMotion ? 'Animations are off because your device requests reduced motion.' : 'Toggle page animations'}
      className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-current px-3 py-2 text-xs leading-none focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-default ${className}`}
    >
      {reducedMotion ? 'Reduced motion' : enabled ? 'Motion on' : 'Motion off'}
    </button>
  );
}
