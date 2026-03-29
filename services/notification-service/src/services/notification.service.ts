import { Notification } from '../models/Notification';
import { logger } from '@chat-app/logger';

export class NotificationService {
  static async createMessageNotification(data: {
    messageId: string;
    chatId: string;
    senderId: string;
    content: string;
    recipientIds: string[]; // We assume these are passed or fetched
  }) {
    const { messageId, chatId, senderId, content, recipientIds } = data;

    const notifications = recipientIds.map(userId => ({
      userId,
      type: 'message',
      refId: messageId,
      content: `New message from ${senderId}: ${content.substring(0, 20)}...`,
    }));

    try {
      await Notification.insertMany(notifications);
      logger.info(`Notifications created for ${recipientIds.length} users for message ${messageId}`);
      
      // Simulate sending push
      recipientIds.forEach(id => {
        logger.info(`[MOCK PUSH] Sending notification to user ${id}`);
      });
    } catch (err) {
      logger.error('Failed to create message notifications', err);
    }
  }

  static async createFriendRequestNotification(data: {
    requesterId: string;
    recipientId: string;
  }) {
    const { requesterId, recipientId } = data;

    try {
      await Notification.create({
        userId: recipientId,
        type: 'friend_request',
        refId: requesterId,
        content: `User ${requesterId} sent you a friend request.`,
      });
      logger.info(`Friend request notification created for ${recipientId}`);
      logger.info(`[MOCK PUSH] Sending friend request notification to user ${recipientId}`);
    } catch (err) {
      logger.error('Failed to create friend request notification', err);
    }
  }

  static async createFriendAcceptedNotification(data: {
    requesterId: string;
    recipientId: string;
  }) {
    const { requesterId, recipientId } = data;

    try {
      await Notification.create({
        userId: requesterId,
        type: 'friend_accepted',
        refId: recipientId,
        content: `User ${recipientId} accepted your friend request.`,
      });
      logger.info(`Friend accepted notification created for ${requesterId}`);
      logger.info(`[MOCK PUSH] Sending friend accepted notification to user ${requesterId}`);
    } catch (err) {
      logger.error('Failed to create friend accepted notification', err);
    }
  }
}
