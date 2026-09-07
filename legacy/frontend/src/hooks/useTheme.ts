import { useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY: string = 'theme';
export const LEGACY_THEME_STORAGE_KEY: string = 'bis-theme';
export const DEFAULT_THEME: Theme = 'dark';

export interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export function getInitialTheme(): Theme {
  try {
    if (typeof window === 'undefined') {
      return DEFAULT_THEME;
    }
    const stored =
      window.localStorage.getItem(THEME_STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return DEFAULT_THEME;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.warn('Failed to read theme from localStorage:', error.message);
    }
    return DEFAULT_THEME;
  }
}

export function applyTheme(theme: Theme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      window.localStorage.setItem(LEGACY_THEME_STORAGE_KEY, theme);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.warn('Failed to persist theme to localStorage:', error.message);
    }
  }
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback((): void => {
    setThemeState((prev: Theme) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newTheme: Theme): void => {
    setThemeState(newTheme);
  }, []);

  return { theme, toggleTheme, setTheme };
}
