import { Message } from '../models/Message';
import { logger } from '@chat-app/logger';
import { MessageStatus } from '@chat-app/shared';
import { createConsumer, producer } from './kafka';

export const startKafkaConsumer = async () => {
  const consumer = createConsumer('message-service-group');

  await consumer.connect();
  await consumer.subscribe({ topic: 'chat-events', fromBeginning: false });

  logger.info('Message Service: Kafka Consumer connected');

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      try {
        const event = JSON.parse(message.value.toString());
        const { type, data } = event;

        if (type === 'MESSAGE_SEEN') {
          const { messageId, chatId, userId } = data;

          // 1. Update Message Status in DB
          const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { 
              status: MessageStatus.SEEN,
              seenAt: new Date()
            },
            { new: true }
          );

          if (updatedMessage) {
            logger.info(`Message Service: Updated message ${messageId} to SEEN`);

            // 2. Notify other services (WebSocket) that status has changed
            await producer.send({
              topic: 'chat-events',
              messages: [
                {
                  key: chatId,
                  value: JSON.stringify({
                    type: 'MESSAGE_STATUS_UPDATED',
                    data: {
                      chatId,
                      messageId,
                      status: MessageStatus.SEEN,
                      userId // The user who saw the message
                    }
                  })
                }
              ]
            });
          }
        }
      } catch (err) {
        logger.error('Message Service: Failed to process Kafka event', err);
      }
    },
  });
};
