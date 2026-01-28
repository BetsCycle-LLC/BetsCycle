export type AdminPlayer = {
  id: string;
  username: string;
  email: string;
  status: string;
  avatar?: string;
  playerType: string;
  registrationDate: string;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    country?: string;
    countryCode?: string;
  };
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
  };
};

export type UpdateAdminPlayerPayload = {
  email?: string;
  avatar?: string;
  status?: string;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    country?: string;
    countryCode?: string;
  };
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

export function fetchAdminPlayers(token: string, status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return request<{ players: AdminPlayer[] }>(`/api/admin/players${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateAdminPlayer(token: string, playerId: string, payload: UpdateAdminPlayerPayload) {
  return request<{ player: AdminPlayer }>(`/api/admin/players/${playerId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

