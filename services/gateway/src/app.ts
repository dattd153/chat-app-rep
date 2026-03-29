import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';
import { logger } from '@chat-app/logger';

export const app = express();

app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'access_secret';

// Auth Middleware for Gateway
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      // Inject user ID into headers for downstream services
      req.headers['x-user-id'] = payload.userId;
    } catch (err) {
      // Invalid token - we don't block here, let downstream handle if needed
      // or we could block depending on the route.
      // For /api/auth/register or login, we shouldn't block.
    }
  }
  next();
};

app.use(authMiddleware);

// Helper for consistent proxy configuration
const proxyOptions = (target: string) => ({
  target,
  changeOrigin: true,
  onProxyReq: (proxyReq: any, req: any) => {
    if (req.headers['x-user-id']) {
      proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
    }
  }
});

// Proxy for Auth Service
app.use('/api/auth', createProxyMiddleware(proxyOptions(process.env.AUTH_SERVICE_URL || 'http://localhost:3001')));

// Proxy for User Service
app.use('/api/users', createProxyMiddleware(proxyOptions(process.env.USER_SERVICE_URL || 'http://localhost:3002')));

// Proxy for Chat Service
app.use('/api/chats', createProxyMiddleware(proxyOptions(process.env.CHAT_SERVICE_URL || 'http://localhost:3003')));

// Proxy for Message Service
app.use('/api/messages', createProxyMiddleware(proxyOptions(process.env.MESSAGE_SERVICE_URL || 'http://localhost:3004')));

// Proxy for Notification Service
app.use('/api/notifications', createProxyMiddleware(proxyOptions(process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006')));

// Proxy for WebSocket Service (Socket.io)
app.use('/socket.io', createProxyMiddleware({
  target: process.env.WEBSOCKET_SERVICE_URL || 'http://websocket-service:3000',
  ws: true,
  changeOrigin: true,
  logLevel: 'debug'
}));

app.get('/health', (req, res) => res.json({ status: 'gateway is running' }));
