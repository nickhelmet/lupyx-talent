/**
 * Simple SWR (stale-while-revalidate) cache for admin API calls.
 * Shows cached data immediately, revalidates in background.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const STALE_TIME = 30_000; // 30 seconds — show cached data if fresher than this

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.timestamp > STALE_TIME) return null;
  return entry.data;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * Fetch with SWR: returns cached data immediately if available,
 * then revalidates in background and calls onUpdate with fresh data.
 */
export async function swrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  onUpdate: (data: T) => void,
): Promise<T> {
  const cached = getCached<T>(key);

  if (cached) {
    // Return cached immediately, revalidate in background
    fetcher().then((fresh) => {
      setCache(key, fresh);
      onUpdate(fresh);
    }).catch(() => {});
    return cached;
  }

  // No cache — fetch and cache
  const data = await fetcher();
  setCache(key, data);
  return data;
}
