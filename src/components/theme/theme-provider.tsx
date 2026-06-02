'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light';
type ResolvedTheme = 'light';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(): ResolvedTheme {
  document.documentElement.classList.remove('dark');
  return 'light';
}

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'theme',
}: ThemeProviderProps) {
  const [theme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    localStorage.setItem(storageKey, 'light');
    setResolvedTheme(applyTheme());
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(storageKey, 'light');
    setResolvedTheme(applyTheme());
  }, [mounted, storageKey]);

  const setTheme = useCallback((_next: Theme) => {
    localStorage.setItem(storageKey, 'light');
    setResolvedTheme(applyTheme());
  }, [storageKey]);

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
