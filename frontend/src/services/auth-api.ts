export type AuthUser = {
  id: string;
  username: string;
  email: string;
  registrationDate?: string;
  status?: string;
  avatar?: string;
  playerType?: 'normal' | 'staking';
};

export type AuthResponse = {
  token: string;
  player: AuthUser;
};

export type RegisterResponse = {
  player: AuthUser;
};

export type LoginPayload = {
  email?: string;
  username?: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured.');
  }

  const response = await fetch(new URL(path, API_BASE_URL), {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  const data = (await response.json()) as T | { message?: string };

  if (!response.ok) {
    const message = typeof data === 'object' && data && 'message' in data ? data.message : 'Request failed';
    throw new Error(message || 'Request failed');
  }

  return data as T;
}

export function login(payload: LoginPayload) {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload) {
  return request<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchProfile(token: string) {
  return request<{ player: AuthUser }>('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function verifyEmail(payload: { email: string; code: string }) {
  return request<{ player: AuthUser }>('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

