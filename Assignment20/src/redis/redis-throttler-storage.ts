import type { ThrottlerStorage } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service.js';

const SCRIPT = `
local blocked = redis.call('PTTL', KEYS[2])
if blocked > 0 then
  return { redis.call('GET', KEYS[1]) or '0', redis.call('PTTL', KEYS[1]), 1, blocked }
end
local hits = redis.call('INCR', KEYS[1])
if hits == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
local window_ttl = redis.call('PTTL', KEYS[1])
local block_ttl = 0
local is_blocked = 0
if hits > tonumber(ARGV[2]) then
  redis.call('SET', KEYS[2], '1', 'PX', ARGV[3])
  is_blocked = 1
  block_ttl = tonumber(ARGV[3])
end
return { hits, window_ttl, is_blocked, block_ttl }
`;

interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redis: RedisService) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const base = `throttle:${throttlerName}:${key}`;
    const result = (await this.redis.client.eval(SCRIPT, {
      keys: [`${base}:hits`, `${base}:blocked`],
      arguments: [String(ttl), String(limit), String(blockDuration)],
    })) as [number | string, number | string, number | string, number | string];
    return {
      totalHits: Number(result[0]),
      timeToExpire: Math.max(0, Number(result[1])),
      isBlocked: Number(result[2]) === 1,
      timeToBlockExpire: Math.max(0, Number(result[3])),
    };
  }
}
