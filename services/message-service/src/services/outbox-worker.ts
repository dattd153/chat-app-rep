import { Kafka } from 'kafkajs';
import { Outbox } from '../models/Outbox';
import { logger } from '@chat-app/logger';

const kafka = new Kafka({
  clientId: 'message-service-worker',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const producer = kafka.producer();

export const startOutboxWorker = async () => {
  await producer.connect();
  logger.info('Outbox Worker: Kafka producer connected');

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
            topic: 'chat-events',
            messages: [
              {
                key: event.payload.chatId,
                value: JSON.stringify({
                  type: event.eventType,
                  data: event.payload
                })
              }
            ]
          });

          event.status = 'sent';
          await event.save();
          logger.info(`Outbox Worker: Sent event ${event.eventType} for chatId ${event.payload.chatId}`);
        } catch (err) {
          logger.error('Outbox Worker: Failed to send event', err);
          event.status = 'failed';
          event.retryCount += 1;
          await event.save();
        }
      }
    } catch (err) {
      logger.error('Outbox Worker: Polling failed', err);
    }
  }, 2000); // Poll every 2 seconds
};
