import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { 
  getMyProfile, 
  updateProfile, 
  getUserById, 
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  getFriendList 
} from './controllers/user.controller';
import { logger } from '@chat-app/logger';

export const app = express();

app.use(cors());
app.use(json());

// Auth Middleware Mock (Wait for Gateway implementation)
// For now, let's assume userId is passed in headers or skip for dev-sync
// In a real monorepo, we'd have a shared @chat-app/auth-middleware
const authMock = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  (req as any).user = { userId };
  next();
};

// USER ROUTES (Prefix /api/users)
app.get('/api/users/me', authMock, getMyProfile);
app.patch('/api/users/me', authMock, updateProfile);
app.get('/api/users/search', authMock, searchUsers);
app.get('/api/users/friends', authMock, getFriendList);
app.post('/api/users/friends/request', authMock, sendFriendRequest);
app.post('/api/users/friends/accept', authMock, acceptFriendRequest);
app.get('/api/users/:id', authMock, getUserById);

// Health Check
app.get('/health', (req, res) => res.json({ status: 'user-service is running' }));

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled User Error', { error: err });
  res.status(500).send({ 
    success: false, 
    error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' } 
  });
});
