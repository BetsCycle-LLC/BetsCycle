const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export type LoyaltyTierLevel = {
  levelNumber: number;
  xp: number;
  faucetInterval: number;
  weeklyRakeback: number;
  monthlyRakeback: number;
  levelUpBonus: Array<{
    currencyId: string;
    amount: number;
  }>;
};

export type LoyaltyTier = {
  id: string;
  tiersName: string;
  icon: string;
  order: number;
  levels: LoyaltyTierLevel[];
  createdAt: string;
  updatedAt: string;
};

export type LoyaltyTiersResponse = {
  tiers: LoyaltyTier[];
};

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

export function fetchLoyaltyTiers() {
  return request<LoyaltyTiersResponse>('/api/loyalty/tiers');
}

