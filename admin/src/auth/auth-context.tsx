import { useMemo, useState, useEffect, useCallback, createContext } from 'react';

import type { AuthUser, AuthResponse, LoginPayload } from 'src/services/auth-api';
import { login, fetchProfile } from 'src/services/auth-api';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  loginUser: (payload: LoginPayload) => Promise<AuthResponse>;
  logout: () => void;
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

  const loginUser = useCallback(
    async (payload: LoginPayload) => {
      const result = await login(payload);
      setAuth(result.token, result.admin);
      return result;
    },
    [setAuth],
  );

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
        setUser(response.admin);
        writeStoredAuth({ token: stored.token, user: response.admin });
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
      loginUser,
      logout,
    }),
    [user, token, isReady, loginUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

