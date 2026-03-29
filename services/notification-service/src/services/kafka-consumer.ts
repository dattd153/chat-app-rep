import { Kafka } from 'kafkajs';
import axios from 'axios';
import { logger } from '@chat-app/logger';
import { NotificationService } from './notification.service';

export class KafkaConsumer {
  private kafka: Kafka;
  private consumer: any;
  private chatServiceUrl: string;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'notification-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });
    this.consumer = this.kafka.consumer({ groupId: 'notification-group' });
    this.chatServiceUrl = process.env.CHAT_SERVICE_URL || 'http://chat-service:3000';
  }

  async connect() {
    await this.consumer.connect();
    // Subscribe to both chat and user events
    await this.consumer.subscribe({ topic: 'chat-events', fromBeginning: true });
    await this.consumer.subscribe({ topic: 'user-events', fromBeginning: true });

    logger.info('Notification Service: Kafka connected and subscribed');

    await this.consumer.run({
      eachMessage: async ({ topic, message }: any) => {
        if (!message.value) return;
        
        try {
          const event = JSON.parse(message.value.toString());
          const { type, data } = event;

          logger.info(`Notification Service: Processing event ${type} from topic ${topic}`);

          switch (type) {
            case 'MESSAGE_CREATED': {
              let { recipientIds, chatId, senderId } = data;
              
              // If recipients are missing, fetch from chat-service
              if (!recipientIds || recipientIds.length === 0) {
                try {
                  const response = await axios.get(`${this.chatServiceUrl}/api/chats/${chatId}/members`);
                  if (response.data && response.data.success) {
                    recipientIds = response.data.data.filter((id: string) => id !== senderId);
                  }
                } catch (err) {
                  logger.error(`Failed to fetch members for chat ${chatId}`, err);
                }
              }

              if (recipientIds && recipientIds.length > 0) {
                await NotificationService.createMessageNotification({
                  ...data,
                  recipientIds
                });
              } else {
                logger.warn(`Could not determine recipients for message ${data.messageId}`);
              }
              break;
            }

            case 'FRIEND_REQUEST_CREATED': {
              await NotificationService.createFriendRequestNotification(data);
              break;
            }

            case 'FRIEND_REQUEST_ACCEPTED': {
              await NotificationService.createFriendAcceptedNotification(data);
              break;
            }

            default:
              logger.debug(`Ignored event: ${type}`);
          }
        } catch (err) {
          logger.error('Failed to process Kafka event', err);
        }
      },
    });
  }
}

export const kafkaConsumer = new KafkaConsumer();
