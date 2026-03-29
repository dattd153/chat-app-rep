import { Kafka, Consumer } from 'kafkajs';
import { logger } from '@chat-app/logger';
import { EventSubjects } from '@chat-app/events';
import { Profile } from '../models/Profile';

class KafkaConsumer {
  private consumer: Consumer | null = null;

  async connect(brokers: string[], groupId: string) {
    const kafka = new Kafka({
      clientId: 'user-service',
      brokers,
    });

    this.consumer = kafka.consumer({ groupId });
    await this.consumer.connect();
    logger.info('User Service Kafka Consumer connected');

    // Subscribe to USER_CREATED (was AUTH_REGISTERED)
    await this.consumer.subscribe({ topic: 'USER_CREATED', fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;

        const data = JSON.parse(message.value.toString());
        logger.info(`Received event ${topic}`, { data });

        if (topic === 'USER_CREATED') {
          await this.handleUserCreated(data);
        }
      },
    });
  }

  private async handleUserCreated(data: { userId: string; name: string; email: string }) {
    try {
      const existing = await Profile.findOne({ userId: data.userId });
      if (existing) {
        logger.warn('Profile already exists', { userId: data.userId });
        return;
      }

      const profile = new Profile({
        userId: data.userId,
        name: data.name,
        email: data.email,
        status: 'offline',
      });

      await profile.save();
      logger.info('Created profile from USER_CREATED event', { userId: data.userId });
    } catch (err) {
      logger.error('Failed to create profile', { error: err });
    }
  }

  async disconnect() {
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }
}

export const kafkaConsumer = new KafkaConsumer();
