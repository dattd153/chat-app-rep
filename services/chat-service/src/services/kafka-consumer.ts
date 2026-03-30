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
          const { chatId, messageId, senderId, content, createdAt } = data;
          
          await Chat.findByIdAndUpdate(chatId, {
            $set: { 
              lastMessageId: messageId,
              lastMessage: {
                content,
                senderId,
                createdAt: new Date(createdAt)
              },
              updatedAt: new Date(createdAt)
            }
          });

          logger.info(`Updated lastMessage for chat ${chatId} with message ${messageId}`);
        }
      } catch (err) {
        logger.error('Failed to update chat metadata in Chat Service', err);
      }
    },
  });
};
