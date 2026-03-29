import Redis from 'ioredis';
import { logger } from '@chat-app/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = new Redis(REDIS_URL);

redisClient.on('error', (err) => {
  logger.error('Redis KV Client Error', err);
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis for KV (Presence)');
});

/**
 * Presence Helpers
 */
export const setUserOnline = async (userId: string) => {
  // Set status with 60s TTL
  await redisClient.set(`user:status:${userId}`, 'online', 'EX', 60);
};

export const setUserOffline = async (userId: string) => {
  await redisClient.del(`user:status:${userId}`);
};

export const getUserStatus = async (userId: string): Promise<string> => {
  return (await redisClient.get(`user:status:${userId}`)) || 'offline';
};
