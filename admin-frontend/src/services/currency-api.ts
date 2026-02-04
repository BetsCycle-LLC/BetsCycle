export type AdminCurrency = {
  id: string;
  currencyCode: string;
  currencyName: string;
  currencyType: 'crypto' | 'fiat' | 'token';
  symbol: string;
  withdrawalFee: number;
  depositFee: number;
  minDeposit: number;
  maxWithdrawal: number;
  minWithdrawal: number;
  status: 'active' | 'inactive';
  lastUpdated: string;
};

export type CreateAdminCurrencyPayload = Omit<AdminCurrency, 'id' | 'lastUpdated'>;

export type UpdateAdminCurrencyPayload = Partial<CreateAdminCurrencyPayload>;

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

export function fetchAdminCurrencies(token: string) {
  return request<{ currencies: AdminCurrency[] }>('/api/admin/currencies', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createAdminCurrency(token: string, payload: CreateAdminCurrencyPayload) {
  return request<{ currency: AdminCurrency }>('/api/admin/currencies', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateAdminCurrency(
  token: string,
  currencyId: string,
  payload: UpdateAdminCurrencyPayload
) {
  return request<{ currency: AdminCurrency }>(`/api/admin/currencies/${currencyId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function deleteAdminCurrency(token: string, currencyId: string) {
  return request<{ success: boolean }>(`/api/admin/currencies/${currencyId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

