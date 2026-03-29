import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { register, login, refresh, logout, logoutAll, verifyToken } from './controllers/auth.controller';
import { logger } from '@chat-app/logger';

export const app = express();

app.use(cors());
app.use(json());

// Auth Routes (Prefix /api/auth as per contract)
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/refresh', refresh);
app.post('/api/auth/logout', logout);
app.post('/api/auth/logout-all', logoutAll);
app.get('/api/auth/verify', verifyToken);

// Health Check
app.get('/health', (req, res) => res.json({ status: 'auth-service is running' }));

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled Auth Error', { error: err });
  res.status(500).send({ 
    success: false, 
    error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' } 
  });
});
