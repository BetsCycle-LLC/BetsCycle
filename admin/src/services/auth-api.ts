export type AuthUser = {
  id: string;
  username: string;
  email: string;
  status?: string;
};

export type AuthResponse = {
  token: string;
  admin: AuthUser;
};

export type LoginPayload = {
  email?: string;
  username?: string;
  password: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured.');
  }

  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(new URL(path, API_BASE_URL), {
    ...options,
    headers,
  });

  const data = (await response.json()) as T | { message?: string };

  if (!response.ok) {
    const message = typeof data === 'object' && data && 'message' in data ? data.message : 'Request failed';
    throw new Error(message || 'Request failed');
  }

  return data as T;
}

export function login(payload: LoginPayload) {
  return request<AuthResponse>('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchProfile(token: string) {
  return request<{ admin: AuthUser }>('/api/admin/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

