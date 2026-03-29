import mongoose from 'mongoose';
import { app } from './app';
import { logger } from '@chat-app/logger';
import { validateEnv } from '@chat-app/config';
import { startOutboxWorker } from './services/outbox-worker';
import { connectKafka } from './services/kafka';
import { startKafkaConsumer } from './services/kafka-consumer';

const start = async () => {
  logger.info('Starting Message Service...');

  const config = validateEnv({});
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/message';

  try {
    // 1. Connect MongoDB
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');

    // 2. Connect Kafka & Start Services
    await connectKafka();
    await Promise.all([
      startOutboxWorker(),
      startKafkaConsumer()
    ]);
    logger.info('Message Service: Kafka Worker & Consumer started');

    // 3. Start Server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Message Service listening on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Message Service startup failed', err);
    process.exit(1);
  }
};

start();
