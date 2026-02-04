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

export type FaucetEntry = {
  currencyId: string;
  currencyCode: string;
  currencyName: string;
  symbol: string;
  amount: number;
  intervalMinutes: number;
  lastClaimedAt: string | null;
  nextClaimAt: string | null;
  canClaim: boolean;
  timeRemainingMs: number;
};

export type FaucetStatusResponse = {
  level: {
    tiersName: string;
    levelNumber: number;
    faucetInterval: number;
    icon: string;
  } | null;
  faucets: FaucetEntry[];
};

export type FaucetClaimResponse = {
  claimed: {
    currencyId: string;
    currencyCode: string;
    currencyName: string;
    symbol: string;
    amount: number;
  };
  intervalMinutes: number;
  nextClaimAt: string | null;
};

export function fetchFaucetStatus(token: string) {
  return request<FaucetStatusResponse>('/api/faucet/status', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function claimFaucet(token: string, currencyId: string) {
  return request<FaucetClaimResponse>('/api/faucet/claim', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currencyId }),
  });
}


