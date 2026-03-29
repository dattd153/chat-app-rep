import { Outbox } from '../models/Outbox';
import { logger } from '@chat-app/logger';
import { producer } from './kafka';

export const startOutboxWorker = async () => {
  logger.info('User Service: Outbox Worker started');

  // Simple polling worker
  setInterval(async () => {
    try {
      const pendingEvents = await Outbox.find({ status: 'pending' })
        .limit(10)
        .sort({ createdAt: 1 });

      for (const rawEvent of pendingEvents) {
        const event = rawEvent as any;
        try {
          await producer.send({
            topic: 'user-events',
            messages: [
              {
                key: event.payload.requesterId || event.payload.senderId,
                value: JSON.stringify({
                  type: event.eventType,
                  data: event.payload
                })
              }
            ]
          });

          event.status = 'sent';
          await event.save();
          logger.info(`User Service Outbox: Sent event ${event.eventType}`);
        } catch (err) {
          logger.error('User Service Outbox: Failed to send event', err);
          event.status = 'failed';
          event.retryCount += 1;
          await event.save();
        }
      }
    } catch (err) {
      logger.error('User Service Outbox: Polling failed', err);
    }
  }, 2000); // Poll every 2 seconds
};
