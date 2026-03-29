import { Kafka, Producer } from 'kafkajs';
import { logger } from '@chat-app/logger';

class KafkaProducerService {
  private producer: Producer;

  constructor() {
    const kafka = new Kafka({
      clientId: 'websocket-service-producer',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });
    this.producer = kafka.producer();
  }

  async connect() {
    await this.producer.connect();
    logger.info('WebSocket Service: Kafka Producer connected');
  }

  async sendEvent(topic: string, type: string, data: any) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify({
              type,
              data,
              timestamp: new Date(),
            }),
          },
        ],
      });
    } catch (err) {
      logger.error('Failed to send Kafka event from WebSocket Service', err);
    }
  }

  async disconnect() {
    await this.producer.disconnect();
  }
}

export const kafkaProducer = new KafkaProducerService();
