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

// Auth Middleware (Wait for Gateway implementation)
const authMock = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  
  if (!userId && !req.path.includes('/health')) {
    logger.warn('Missing x-user-id header', { path: req.path });
    // In many cases we want 401, but some internal calls might bypass
    // For now, let's keep it informative but strict for user routes
  }

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
