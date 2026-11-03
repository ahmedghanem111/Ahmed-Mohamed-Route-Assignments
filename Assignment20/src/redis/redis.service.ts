import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@keyv/redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client;

  constructor(config: ConfigService) {
    this.client = createClient({
      url: config.getOrThrow<string>('REDIS_URL'),
      socket: { reconnectStrategy: (retries) => Math.min(retries * 250, 5000) },
    });
    this.client.on('error', () => this.logger.error('Redis connection error'));
  }

  async onModuleInit(): Promise<void> {
    if (!this.client.isOpen) await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) await this.client.quit();
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client.set(key, value, { EX: ttlSeconds });
  }

  get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  consume(key: string): Promise<string | null> {
    return this.client.getDel(key);
  }

  async allow(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const count = await this.client.eval(
      'local count = redis.call("INCR", KEYS[1]); if count == 1 then redis.call("EXPIRE", KEYS[1], ARGV[1]) end; return count',
      { keys: [key], arguments: [String(windowSeconds)] },
    );
    return Number(count) <= limit;
  }

  async deleteIfValueMatches(key: string, expected: string): Promise<boolean> {
    const result = await this.client.eval(
      'if redis.call("GET", KEYS[1]) == ARGV[1] then return redis.call("DEL", KEYS[1]) else return 0 end',
      { keys: [key], arguments: [expected] },
    );
    return result === 1;
  }

}
