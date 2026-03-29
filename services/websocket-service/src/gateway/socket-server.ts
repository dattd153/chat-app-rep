import { Server } from 'socket.io';
import { logger } from '@chat-app/logger';
import jwt from 'jsonwebtoken';

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

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    logger.info(`User connected: ${userId} (${socket.id})`);

    // Join user-specific room for individual notifications
    socket.join(`user:${userId}`);

    // Join chat rooms
    socket.on('join-chat', (chatId: string) => {
      socket.join(`chat:${chatId}`);
      logger.info(`User ${userId} joined chat room: ${chatId}`);
    });

    socket.on('leave-chat', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      logger.info(`User ${userId} left chat room: ${chatId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`);
    });
  });
};
