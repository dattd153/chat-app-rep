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
  await consumer.subscribe({ topic: 'user-events', fromBeginning: false });

  logger.info('WebSocket Service: Kafka consumer connected and topics subscribed');

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) return;

      try {
        const event = JSON.parse(message.value.toString());
        const { type, data } = event;

        logger.info(`WebSocket Service: Received event ${type} from topic ${topic}`);

        switch (type) {
          case 'MESSAGE_CREATED': {
            const { chatId, messageId, senderId, content, createdAt } = data;
            
            const payload = {
              id: messageId,
              chatId,
              senderId,
              content,
              createdAt,
              status: 'sent'
            };

            // 1. Emit to chat room (for currently active participants)
            io.to(`chat:${chatId}`).emit(SocketEvents.NEW_MESSAGE, payload);

            // 2. Emit directly to each participant's user room (for offline or unjoined participants)
            try {
              const res = await fetch(`http://chat-service:3000/api/chats/${chatId}/members`);
              if (res.ok) {
                const membersData = await res.json();
                const participantIds = membersData.data || [];
                
                participantIds.forEach((pId: string) => {
                  io.to(`user:${pId}`).emit(SocketEvents.NEW_MESSAGE, payload);
                });
                logger.info(`Routed MESSAGE_CREATED to ${participantIds.length} members of chat ${chatId}`);
              }
            } catch (err) {
              logger.error(`Failed to route MESSAGE_CREATED over members for chat ${chatId}`, err);
            }

            break;
          }

          case 'FRIEND_REQUEST_CREATED': {
            const { recipientId } = data;
            // Emit to the specific user room
            io.to(`user:${recipientId}`).emit('NOTIFICATION_RECEIVED', {
              type: 'friend_request',
              data
            });
            break;
          }

          case 'FRIEND_REQUEST_ACCEPTED': {
            const { requesterId } = data;
            io.to(`user:${requesterId}`).emit('NOTIFICATION_RECEIVED', {
              type: 'friend_accepted',
              data
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
