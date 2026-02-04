import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

type ThemeStoreValue = {
  mode: ThemeMode | null;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeStoreContext = createContext<ThemeStoreValue | undefined>(undefined);

const STORAGE_KEY = 'betcycle-mode';

export function ThemeStoreProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  });

  const setThemeMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, nextMode);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setThemeMode,
    }),
    [mode, setThemeMode]
  );

  return <ThemeStoreContext.Provider value={value}>{children}</ThemeStoreContext.Provider>;
}

export function useThemeStore() {
  const context = useContext(ThemeStoreContext);
  if (!context) {
    throw new Error('useThemeStore must be used within ThemeStoreProvider');
  }
  return context;
}

