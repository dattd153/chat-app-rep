import { Kafka, Producer } from 'kafkajs';
import { logger } from '@chat-app/logger';

class KafkaProducer {
  private producer: Producer | null = null;

  async connect(brokers: string[]) {
    const kafka = new Kafka({
      clientId: 'auth-service',
      brokers,
    });

    this.producer = kafka.producer();
    await this.producer.connect();
    logger.info('Kafka Producer connected');
  }

  async emit(topic: string, message: any) {
    if (!this.producer) {
      throw new Error('Kafka Producer not connected');
    }

    await this.producer.send({
      topic,
      messages: [
        { value: JSON.stringify(message) },
      ],
    });
  }

  async disconnect() {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }
}

export const kafkaProducer = new KafkaProducer();
