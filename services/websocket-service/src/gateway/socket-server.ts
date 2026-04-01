import { Server } from 'socket.io';
import { logger } from '@chat-app/logger';
import jwt from 'jsonwebtoken';
import { SocketEvents, MessageStatus } from '@chat-app/shared';
import { redisClient, setUserOnline, setUserOffline, getUserStatus } from '../redis/client';
import { kafkaProducer } from '../services/kafka-producer';

export const initSocketServer = (io: Server) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'access_secret';

  // Middleware for Authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      socket.data.userId = payload.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.data.userId;
    logger.info(`User connected: ${userId} (${socket.id})`);

    // 1. Presence: Set user as online
    await setUserOnline(userId);
    // Notify others that user is online (e.g., in a public room or specific friends room)
    io.emit(SocketEvents.USER_ONLINE, { userId });

    // Join user-specific room for individual notifications
    socket.join(`user:${userId}`);

    // JOIN/LEAVE CHAT
    socket.on(SocketEvents.JOIN_CHAT, (chatId: string) => {
      socket.join(`chat:${chatId}`);
      logger.info(`User ${userId} joined chat room: ${chatId}`);
    });

    socket.on(SocketEvents.LEAVE_CHAT, (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      logger.info(`User ${userId} left chat room: ${chatId}`);
    });

    // TYPING INDICATORS
    socket.on(SocketEvents.TYPING_START, (chatId: string) => {
      socket.to(`chat:${chatId}`).emit(SocketEvents.TYPING_START, {
        chatId,
        userId
      });
    });

    socket.on(SocketEvents.TYPING_STOP, (chatId: string) => {
      socket.to(`chat:${chatId}`).emit(SocketEvents.TYPING_STOP, {
        chatId,
        userId
      });
    });

    // MESSAGE STATUS (SEEN/DELIVERED)
    socket.on(SocketEvents.MESSAGE_SEEN, async (payload: { chatId: string, messageId: string }) => {
      logger.info(`Message ${payload.messageId} seen by ${userId}`);
      
      // Emit Kafka event for Message Service to update DB
      await kafkaProducer.sendEvent('chat-events', 'MESSAGE_SEEN', {
        chatId: payload.chatId,
        messageId: payload.messageId,
        userId: userId
      });
    });

    // Return current presence for a list of user IDs (used for initial load)
    socket.on('GET_PRESENCE', async (userIds: string[], callback: (statuses: Record<string, string>) => void) => {
      if (!Array.isArray(userIds) || typeof callback !== 'function') return;
      const statuses: Record<string, string> = {};
      await Promise.all(userIds.map(async (id) => {
        statuses[id] = await getUserStatus(id);
      }));
      callback(statuses);
    });

    // Heartbeat: refresh Redis TTL every 30s so presence doesn't expire while connected
    const heartbeat = setInterval(() => setUserOnline(userId), 30000);

    socket.on('disconnect', async () => {
      clearInterval(heartbeat);
      logger.info(`User disconnected: ${userId}`);
      // 2. Presence: Remove online status
      await setUserOffline(userId);
      io.emit(SocketEvents.USER_OFFLINE, { userId });
    });
  });
};
