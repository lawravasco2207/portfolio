import { create } from 'zustand';

export type AppMode = 'entry' | 'civil' | 'tech';

interface AppState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isTransitioning: boolean;
  setIsTransitioning: (isTransitioning: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'entry',
  setMode: (mode) => set({ mode }),
  isTransitioning: false,
  setIsTransitioning: (isTransitioning) => set({ isTransitioning }),
}));
