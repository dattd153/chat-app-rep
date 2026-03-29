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

// Proxy for Auth Service
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    // Contract: /api/auth/register -> Auth Service: /api/auth/register
    // My Auth service already has /api/auth prefix in app.ts
    '^/api/auth': '/api/auth', 
  },
}));

// Proxy for User Service
app.use('/api/users', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users',
  },
  onError: (err, req, res) => {
    logger.error('Proxy Error (User Service):', { error: err.message, url: req.url });
    res.status(502).send({ success: false, error: { code: 'PROXY_ERROR', message: err.message } });
  }
}));

// Proxy for Chat Service
app.use('/api/chats', createProxyMiddleware({
  target: process.env.CHAT_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/chats': '/api/chats',
  },
}));

// Proxy for Message Service
app.use('/api/messages', createProxyMiddleware({
  target: process.env.MESSAGE_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: {
    '^/api/messages': '/api/messages',
  },
}));

// Proxy for Notification Service
app.use('/api/notifications', createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006',
  changeOrigin: true,
  pathRewrite: {
    '^/api/notifications': '/api/notifications',
  },
}));

app.get('/health', (req, res) => res.json({ status: 'gateway is running' }));
