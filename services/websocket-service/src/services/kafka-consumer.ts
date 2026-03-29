import { Kafka } from 'kafkajs';
import { Server } from 'socket.io';
import { logger } from '@chat-app/logger';
import { SocketEvents } from '@chat-app/shared';

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

        switch (type) {
          case 'MESSAGE_CREATED': {
            const { chatId, messageId, senderId, content, createdAt } = data;
            io.to(`chat:${chatId}`).emit(SocketEvents.NEW_MESSAGE, {
              id: messageId,
              chatId,
              senderId,
              content,
              createdAt,
              status: 'sent'
            });
            break;
          }

          case 'MESSAGE_STATUS_UPDATED': {
            const { chatId, messageId, status, userId } = data;
            // Emit status update to the room
            // If status is SEEN, we emit MESSAGE_SEEN
            const eventType = status === 'seen' ? SocketEvents.MESSAGE_SEEN : SocketEvents.MESSAGE_DELIVERED;
            io.to(`chat:${chatId}`).emit(eventType, {
              messageId,
              chatId,
              status,
              userId
            });
            break;
          }

          case 'USER_STATUS_CHANGED': {
            const { userId, status } = data;
            const eventType = status === 'online' ? SocketEvents.USER_ONLINE : SocketEvents.USER_OFFLINE;
            io.emit(eventType, { userId, status });
            break;
          }
        }
      } catch (err) {
        logger.error('Failed to process Kafka event in WebSocket Service', err);
      }
    },
  });
};
