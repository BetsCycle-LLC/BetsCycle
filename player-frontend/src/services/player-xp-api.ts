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

export type LoyaltyLevelInfo = {
  tiersName: string;
  icon: string;
  order: number;
  levelNumber: number;
  xp: number;
  faucetInterval: number;
  faucetRewards?: Array<{
    currencyId: string;
    amount: number;
  }>;
  weeklyRakeback: number;
  monthlyRakeback: number;
  levelUpBonus: Array<{
    currencyId: string;
    amount: number;
  }>;
} | null;

export type PlayerXPResponse = {
  userId: string;
  xp: number;
  loyalty: {
    currentLevel: LoyaltyLevelInfo;
    nextLevel: LoyaltyLevelInfo;
    progressPercentage: number;
    xpToNextLevel: number;
  };
};

export type AddXPResponse = {
  userId: string;
  xp: number;
  xpAdded: number;
  oldXP: number;
  leveledUp: boolean;
  loyalty: {
    currentLevel: LoyaltyLevelInfo;
    nextLevel: LoyaltyLevelInfo;
    progressPercentage: number;
    xpToNextLevel: number;
  };
};

export type LeaderboardEntry = {
  userId: {
    _id: string;
    email: string;
    username?: string;
  };
  xp: number;
  currentLevel: LoyaltyLevelInfo;
};

export type LeaderboardResponse = {
  leaderboard: LeaderboardEntry[];
  total: number;
  limit: number;
  skip: number;
};

/**
 * Get player's XP and loyalty level
 */
export function fetchPlayerXP(userId: string, token: string) {
  return request<PlayerXPResponse>(`/api/player/xp/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Add XP to a player
 */
export function addPlayerXP(userId: string, amount: number, token: string) {
  return request<AddXPResponse>(`/api/player/xp/${userId}/add`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });
}

/**
 * Get XP leaderboard
 */
export function fetchXPLeaderboard(limit = 10, skip = 0) {
  return request<LeaderboardResponse>(`/api/player/xp/leaderboard?limit=${limit}&skip=${skip}`);
}

