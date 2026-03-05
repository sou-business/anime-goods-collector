import { createClient, RedisJSON } from 'redis';
import { logger } from '@/utils/logger.js';

const client = createClient({
  socket: {
    host: process.env.CACHE_HOST || 'localhost',
    port: Number(process.env.CACHE_PORT) || 6379
  }
});

async function getClient() {
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = 3600 * 14
): Promise<void> {
  try {
    const redis = await getClient();
    await redis.json.set(key, '$', value as RedisJSON);
    await redis.expire(key, ttlSeconds);
    logger.info(`Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    logger.error('Cache SET error:', error);
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = await getClient();
    const cached = await redis.json.get(key);
    if (cached) {
      logger.info(`Cache HIT: ${key}`);
      return cached as T;
    }
    logger.info(`Cache MISS: ${key}`);
    return null;
  } catch (error) {
    logger.error('Cache GET error:', error);
    return null;
  }
}

export async function cacheMerge<T extends object>(
  key: string,
  value: Partial<T>,
  ttlSeconds: number = 3600 * 14
): Promise<void> {
  try {
    const redis = await getClient();
    await redis.json.merge(key, '$', value as RedisJSON);
    await redis.expire(key, ttlSeconds);
    logger.info(`Cache MERGE: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    logger.error('Cache MERGE error:', error);
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    const redis = await getClient();
    await redis.del(key);
    logger.info(`Cache DELETE: ${key}`);
  } catch (error) {
    logger.error('Cache DELETE error:', error);
  }
}