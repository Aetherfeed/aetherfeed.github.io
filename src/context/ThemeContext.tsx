import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';
type ThemeOverride = Theme | null;

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'color-scheme';
const LEGACY_STORAGE_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const readInitialOverride = (): ThemeOverride => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy === 'light' || legacy === 'dark') {
      const sys: Theme = window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      if (legacy !== sys) {
        localStorage.setItem(STORAGE_KEY, legacy);
        return legacy;
      }
    }
  } catch {
    // Ignore storage access errors
  }
  return null;
};

const getSystemDark = (): boolean => {
  if (typeof window === 'undefined') return true;
  return window.matchMedia(DARK_QUERY).matches;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [override, setOverride] = useState<ThemeOverride>(readInitialOverride);
  const [systemDark, setSystemDark] = useState<boolean>(getSystemDark);

  const theme: Theme = override ?? (systemDark ? 'dark' : 'light');

  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemDark(event.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      if (event.newValue === 'light' || event.newValue === 'dark') {
        setOverride(event.newValue);
      } else {
        setOverride(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');

    let meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'color-scheme';
      document.head.appendChild(meta);
    }
    meta.content = override ?? 'light dark';
  }, [theme, override]);

  const toggleTheme = useCallback(() => {
    const target: Theme = theme === 'dark' ? 'light' : 'dark';
    const currentSystem: Theme = window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
    if (target === currentSystem) {
      setOverride(null);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    } else {
      setOverride(target);
      try {
        localStorage.setItem(STORAGE_KEY, target);
      } catch {
        // Ignore storage errors
      }
    }
  }, [theme]);

  const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
