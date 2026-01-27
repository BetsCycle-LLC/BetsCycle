export type SportEvent = {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
};

export type SportsMarket = {
  id: string;
  name: string;
  selections: Array<{
    id: string;
    name: string;
    odds: number;
  }>;
};

const SPORTSBOOK_BASE_URL = import.meta.env.VITE_SPORTSBOOK_API_BASE_URL ?? '';
const SPORTSBOOK_API_KEY = import.meta.env.VITE_SPORTSBOOK_API_KEY ?? '';

type FetchParams = Record<string, string | number | boolean | undefined>;

async function sportsbookRequest<T>(path: string, params?: FetchParams): Promise<T> {
  if (!SPORTSBOOK_BASE_URL) {
    throw new Error('Sportsbook API base URL is not configured.');
  }

  const url = new URL(path, SPORTSBOOK_BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url, {
    headers: {
      ...(SPORTSBOOK_API_KEY ? { Authorization: `Bearer ${SPORTSBOOK_API_KEY}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Sportsbook API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function fetchSportEvents(params?: {
  sport?: string;
  league?: string;
  live?: boolean;
}): Promise<SportEvent[]> {
  return sportsbookRequest('/events', params);
}

export function fetchSportMarkets(eventId: string): Promise<SportsMarket[]> {
  return sportsbookRequest(`/events/${eventId}/markets`);
}

