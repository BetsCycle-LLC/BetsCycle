export type CasinoCategory = {
  id: string;
  name: string;
};

export type CasinoGame = {
  id: string;
  name: string;
  provider: string;
  category?: string;
  thumbnailUrl?: string;
};

const CASINO_BASE_URL = import.meta.env.VITE_CASINO_API_BASE_URL ?? '';
const CASINO_API_KEY = import.meta.env.VITE_CASINO_API_KEY ?? '';

type FetchParams = Record<string, string | number | boolean | undefined>;

async function casinoRequest<T>(path: string, params?: FetchParams): Promise<T> {
  if (!CASINO_BASE_URL) {
    throw new Error('Casino API base URL is not configured.');
  }

  const url = new URL(path, CASINO_BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url, {
    headers: {
      ...(CASINO_API_KEY ? { Authorization: `Bearer ${CASINO_API_KEY}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Casino API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function fetchCasinoCategories(): Promise<CasinoCategory[]> {
  return casinoRequest('/categories');
}

export function fetchCasinoGames(params?: {
  categoryId?: string;
  providerId?: string;
  search?: string;
}): Promise<CasinoGame[]> {
  return casinoRequest('/games', params);
}

