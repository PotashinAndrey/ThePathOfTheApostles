import { create } from 'zustand';
import { ThemeMode, Theme, getTheme } from '../constants/theme';

interface ThemeState {
  mode: ThemeMode;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light',
  theme: getTheme('light'),
  toggleTheme: () =>
    set((state) => {
      const newMode = state.mode === 'light' ? 'dark' : 'light';
      return {
        mode: newMode,
        theme: getTheme(newMode),
      };
    }),
  setTheme: (mode: ThemeMode) =>
    set(() => ({
      mode,
      theme: getTheme(mode),
    })),
})); 