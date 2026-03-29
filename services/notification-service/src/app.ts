import express from 'express';
import { Notification } from './models/Notification';
import { successResponse, errorResponse } from '@chat-app/shared';

export const app = express();
app.use(express.json());

// Fetch notifications for current user
app.get('/api/notifications', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json(errorResponse('UNAUTHORIZED', 'No user ID'));
  
  try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json(successResponse(notifications));
  } catch (err) {
    res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch notifications'));
  }
});

// Mark single notification as read
app.patch('/api/notifications/:id/read', async (req, res) => {
  const { id } = req.params;
  const userId = req.headers['x-user-id'] as string;

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) return res.status(404).json(errorResponse('NOT_FOUND', 'Notification not found'));
    res.json(successResponse(notification));
  } catch (err) {
    res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to mark as read'));
  }
});

// Mark all as read
app.patch('/api/notifications/read-all', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;

  try {
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json(successResponse({ success: true }));
  } catch (err) {
    res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to mark all as read'));
  }
});

app.get('/health', (req, res) => res.json({ status: 'notification-service is running' }));
