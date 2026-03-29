import express from 'express';
import { Notification } from './models/Notification';
import { successResponse } from '@chat-app/shared';

export const app = express();

app.get('/api/notifications', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(successResponse(notifications));
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'notification-service is running' }));
