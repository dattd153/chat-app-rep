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
  getFriendList,
  getPendingRequests
} from './controllers/user.controller';
import { logger } from '@chat-app/logger';
import { errorResponse } from '@chat-app/shared';

export const app = express();

app.use(cors());
app.use(json());

// Auth Middleware (Wait for Gateway implementation)
const authMock = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userId = req.headers['x-user-id'] as string;

  if (!userId && !req.path.includes('/health')) {
    logger.warn('Missing x-user-id header on protected route', { path: req.path });
    return res.status(401).send(errorResponse('UNAUTHORIZED', 'Missing user identification'));
  }

  (req as any).user = { userId };
  next();
};

// USER ROUTES
const userRouter = express.Router();

userRouter.get('/me', getMyProfile);
userRouter.patch('/me', updateProfile);
userRouter.get('/search', searchUsers);
userRouter.get('/friends/pending', getPendingRequests);
userRouter.get('/friends', getFriendList);
userRouter.post('/friends/request', sendFriendRequest);
userRouter.post('/friends/accept', acceptFriendRequest);
userRouter.get('/:id', getUserById);

app.use('/api/users', authMock, userRouter);

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
