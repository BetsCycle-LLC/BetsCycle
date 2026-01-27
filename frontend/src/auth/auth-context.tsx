import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import type { AuthUser, LoginPayload, RegisterPayload } from 'src/services/auth-api';
import { fetchProfile, login, register } from 'src/services/auth-api';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  authDialog: {
    open: boolean;
    mode: 'sign-in' | 'sign-up';
  };
  loginUser: (payload: LoginPayload) => Promise<void>;
  registerUser: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  openAuthDialog: (mode: 'sign-in' | 'sign-up') => void;
  closeAuthDialog: () => void;
};

type StoredAuth = {
  token: string;
  user: AuthUser;
};

const STORAGE_KEY = 'betscycle.auth';

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

function writeStoredAuth(value: StoredAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [authDialog, setAuthDialog] = useState<AuthContextValue['authDialog']>({
    open: false,
    mode: 'sign-in',
  });

  const setAuth = useCallback((nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    writeStoredAuth({ token: nextToken, user: nextUser });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    clearStoredAuth();
  }, []);

  const openAuthDialog = useCallback((mode: 'sign-in' | 'sign-up') => {
    setAuthDialog({ open: true, mode });
  }, []);

  const closeAuthDialog = useCallback(() => {
    setAuthDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const loginUser = useCallback(async (payload: LoginPayload) => {
    const result = await login(payload);
    setAuth(result.token, result.player);
  }, [setAuth]);

  const registerUser = useCallback(async (payload: RegisterPayload) => {
    const result = await register(payload);
    setAuth(result.token, result.player);
  }, [setAuth]);

  useEffect(() => {
    const stored = readStoredAuth();
    if (!stored) {
      setIsReady(true);
      return;
    }

    setToken(stored.token);
    setUser(stored.user);

    fetchProfile(stored.token)
      .then((response) => {
        setUser(response.player);
        writeStoredAuth({ token: stored.token, user: response.player });
      })
      .catch(() => {
        logout();
      })
      .finally(() => setIsReady(true));
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      authDialog,
      loginUser,
      registerUser,
      logout,
      openAuthDialog,
      closeAuthDialog,
    }),
    [user, token, isReady, authDialog, loginUser, registerUser, logout, openAuthDialog, closeAuthDialog],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

