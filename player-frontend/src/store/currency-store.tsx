import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type CurrencyStoreValue = {
  selectedCurrencyId: string | null;
  setSelectedCurrencyId: (id: string | null) => void;
};

const CurrencyStoreContext = createContext<CurrencyStoreValue | undefined>(undefined);

const STORAGE_KEY = 'betscycle.selectedCurrencyId';

export function CurrencyStoreProvider({ children }: { children: React.ReactNode }) {
  const [selectedCurrencyId, setSelectedCurrencyIdState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(STORAGE_KEY);
  });

  const setSelectedCurrencyId = useCallback((id: string | null) => {
    setSelectedCurrencyIdState(id);
    if (typeof window === 'undefined') return;
    if (id) {
      window.localStorage.setItem(STORAGE_KEY, id);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo(
    () => ({
      selectedCurrencyId,
      setSelectedCurrencyId,
    }),
    [selectedCurrencyId, setSelectedCurrencyId]
  );

  return <CurrencyStoreContext.Provider value={value}>{children}</CurrencyStoreContext.Provider>;
}

export function useCurrencyStore() {
  const context = useContext(CurrencyStoreContext);
  if (!context) {
    throw new Error('useCurrencyStore must be used within CurrencyStoreProvider');
  }
  return context;
}

