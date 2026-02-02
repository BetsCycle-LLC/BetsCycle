export type TierLevel = {
  levelNumber: number;
  xp: number;
  faucetInterval: number;
  weeklyRakeback: number;
  monthlyRakeback: number;
  levelUpBonus: Array<{
    currencyId: string;
    currencyCode?: string;
    amount: number;
  }>;
};

export type LoyaltyTier = {
  id: string;
  tiersName: string;
  icon: string;
  order: number;
  levels: TierLevel[];
  createdAt: string;
  updatedAt: string;
};

export type CreateLoyaltyTierPayload = Omit<LoyaltyTier, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateLoyaltyTierPayload = Partial<CreateLoyaltyTierPayload>;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured.');
  }

  const headers = new Headers(options?.headers);
  
  // Don't set Content-Type if we're sending FormData
  if (!(options?.body instanceof FormData) && !headers.has('Content-Type')) {
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

export function fetchAdminLoyaltyTiers(token: string) {
  return request<{ tiers: LoyaltyTier[] }>('/api/admin/loyalty-tiers', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createAdminLoyaltyTier(token: string, payload: CreateLoyaltyTierPayload, iconFile?: File) {
  const formData = new FormData();
  formData.append('tiersName', payload.tiersName);
  formData.append('order', String(payload.order));
  formData.append('levels', JSON.stringify(payload.levels));
  
  if (iconFile) {
    formData.append('icon', iconFile);
  } else if (payload.icon) {
    formData.append('iconPath', payload.icon);
  }

  return request<{ tier: LoyaltyTier }>('/api/admin/loyalty-tiers', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

export function updateAdminLoyaltyTier(
  token: string,
  tierId: string,
  payload: UpdateLoyaltyTierPayload,
  iconFile?: File
) {
  const formData = new FormData();
  
  if (payload.tiersName !== undefined) formData.append('tiersName', payload.tiersName);
  if (payload.order !== undefined) formData.append('order', String(payload.order));
  if (payload.levels !== undefined) formData.append('levels', JSON.stringify(payload.levels));
  
  if (iconFile) {
    formData.append('icon', iconFile);
  } else if (payload.icon !== undefined) {
    formData.append('iconPath', payload.icon);
  }

  return request<{ tier: LoyaltyTier }>(`/api/admin/loyalty-tiers/${tierId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

export function deleteAdminLoyaltyTier(token: string, tierId: string) {
  return request<{ success: boolean }>(`/api/admin/loyalty-tiers/${tierId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

