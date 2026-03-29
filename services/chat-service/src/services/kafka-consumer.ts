import { Kafka } from 'kafkajs';
import { Chat } from '../models/Chat';
import { logger } from '@chat-app/logger';

export const startKafkaConsumer = async () => {
  const kafka = new Kafka({
    clientId: 'chat-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  });

  const consumer = kafka.consumer({ groupId: 'chat-group' });

  await consumer.connect();
  await consumer.subscribe({ topic: 'chat-events', fromBeginning: false });

  logger.info('Chat Service: Kafka consumer connected');

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      try {
        const event = JSON.parse(message.value.toString());
        const { type, data } = event;

        if (type === 'MESSAGE_CREATED') {
          const { chatId, messageId } = data;
          
          await Chat.findByIdAndUpdate(chatId, {
            $set: { lastMessageId: messageId }
          });

          logger.info(`Updated lastMessageId for chat ${chatId} to ${messageId}`);
        }
      } catch (err) {
        logger.error('Failed to update chat metadata in Chat Service', err);
      }
    },
  });
};
