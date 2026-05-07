interface CacheEntry {
  data: any;
  timestamp: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry>();

  async getWithCache(
    fetchFn: () => Promise<any>,
    key: string,
    ttl = 30000
  ): Promise<any> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cacheService = new CacheService();
