import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Server } from 'socket.io';
import { logger } from '@chat-app/logger';

export const setupRedisAdapter = async (io: Server) => {
  const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
  
  const pubClient = new Redis(REDIS_URL);
  const subClient = pubClient.duplicate();

  pubClient.on('error', (err) => logger.error('Redis Pub Client Error', err));
  subClient.on('error', (err) => logger.error('Redis Sub Client Error', err));

  io.adapter(createAdapter(pubClient, subClient));
  logger.info('Socket.IO Redis Adapter configured');
};
