import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cache.get<T>(key);
    } catch {
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    try {
      await this.cache.set(key, value, ttlMs);
    } catch {
      // A cache outage should not turn a non-critical cache operation into an API failure.
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.cache.del(key);
    } catch {
      // The next read can repopulate the cache.
    }
  }

  async reset(): Promise<void> {
    try {
      await this.cache.clear();
    } catch {
      // Cache reset is best-effort.
    }
  }
}
