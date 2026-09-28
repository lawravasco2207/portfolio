'use client';

import { useSyncExternalStore } from 'react';

interface AppState {
  ready: boolean;
  setReady: (ready: boolean) => void;
}

const listeners = new Set<() => void>();

function setReady(ready: boolean) {
  if (state.ready === ready) return;
  state = { ...state, ready };
  listeners.forEach((listener) => listener());
}

const initialState: AppState = { ready: false, setReady };
let state = initialState;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

const getSnapshot = () => state;
const getServerSnapshot = () => initialState;

export function useAppStore(): AppState;
export function useAppStore<T>(selector: (state: AppState) => T): T;
export function useAppStore<T>(selector?: (state: AppState) => T): AppState | T {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return selector ? selector(snapshot) : snapshot;
}
