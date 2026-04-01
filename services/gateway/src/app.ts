import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';
import { logger } from '@chat-app/logger';

export const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8080,http://localhost:5173').split(',');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));

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
      next();
    } catch (err) {
      logger.warn('Invalid token provided', { error: err });
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' }
      });
    }
  } else {
    next();
  }
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
  },
  onProxyRes: (proxyRes: any, req: any) => {
    // Override upstream CORS headers so the browser sees the correct values.
    // Upstream services use cors() with wildcard (*), which browsers reject
    // when credentials are included. The gateway is the only CORS boundary.
    const origin = (req as any).headers?.origin;
    proxyRes.headers['access-control-allow-origin'] = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    proxyRes.headers['access-control-allow-credentials'] = 'true';
    proxyRes.headers['vary'] = 'Origin';
  },
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
