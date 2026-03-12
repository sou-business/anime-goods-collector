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
  const redis = await getClient();
  await redis.json.set(key, '$', value as RedisJSON);
  await redis.expire(key, ttlSeconds);
  logger.debug(`Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = await getClient();
  const cached = await redis.json.get(key);
  if (cached) {
    logger.debug(`Cache HIT: ${key}`);
    return cached as T;
  }
  logger.debug(`Cache MISS: ${key}`);
  return null;
}

export async function cacheMerge<T extends object>(
  key: string,
  value: Partial<T>,
  ttlSeconds: number = 3600 * 14
): Promise<void> {
  const redis = await getClient();
  await redis.json.merge(key, '$', value as RedisJSON);
  await redis.expire(key, ttlSeconds);
  logger.debug(`Cache MERGE: ${key} (TTL: ${ttlSeconds}s)`);
}

export async function cacheDelete(key: string): Promise<void> {
  const redis = await getClient();
  await redis.del(key);
  logger.debug(`Cache DELETE: ${key}`);
}