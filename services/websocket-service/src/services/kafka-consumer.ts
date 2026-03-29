import { Kafka } from 'kafkajs';
import { Server } from 'socket.io';
import { logger } from '@chat-app/logger';

export const startKafkaConsumer = async (io: Server) => {
  const kafka = new Kafka({
    clientId: 'websocket-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  });

  const consumer = kafka.consumer({ groupId: 'websocket-group' });

  await consumer.connect();
  await consumer.subscribe({ topic: 'chat-events', fromBeginning: false });

  logger.info('WebSocket Service: Kafka consumer connected');

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      try {
        const event = JSON.parse(message.value.toString());
        const { type, data } = event;

        if (type === 'MESSAGE_CREATED') {
          const { chatId, messageId, senderId, content, createdAt } = data;
          
          // Emit to all users in the chat room
          io.to(`chat:${chatId}`).emit('new-message', {
            id: messageId,
            chatId,
            senderId,
            content,
            createdAt
          });

          logger.info(`Broadcasted message ${messageId} to chat ${chatId}`);
        }
      } catch (err) {
        logger.error('Failed to process Kafka event in WebSocket Service', err);
      }
    },
  });
};
