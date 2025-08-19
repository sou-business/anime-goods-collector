import { Redis } from 'ioredis';
import { logger } from '@/utils/logger.js';

const redis = new Redis({
  host: process.env.CACHE_HOST || 'localhost',
  port: Number(process.env.CACHE_PORT) || 6379
});

export async function cacheSet<T>(
  key: string, 
  value: T, 
  ttlSeconds: number = 3600 * 14 // デフォルトで14時間のTTL
): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
    logger.info(`Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    logger.error('Cache SET error:', error);
    throw error;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      logger.info(`Cache HIT: ${key}`);
      return JSON.parse(cached);
    }
    logger.error(`Cache MISS: ${key}`);
    return null;
  } catch (error) {
    logger.error('Cache GET error:', error);
    return null;
  }
}

export async function cacheDelete(key: string): Promise<void> {
  await redis.del(key);
  logger.info(`Cache DEL: ${key}`);
}

export async function cacheExists(key: string): Promise<boolean> {
  return (await redis.exists(key)) === 1;
}
