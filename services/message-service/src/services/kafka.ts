import { Kafka, Producer } from 'kafkajs';
import { logger } from '@chat-app/logger';

const kafka = new Kafka({
  clientId: 'message-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

export const producer: Producer = kafka.producer();

export const connectKafka = async () => {
  await producer.connect();
  logger.info('Message Service: Kafka Producer connected');
};

export const createConsumer = (groupId: string) => {
  return kafka.consumer({ groupId });
};
