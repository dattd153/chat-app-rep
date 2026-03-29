import mongoose from 'mongoose';
import { app } from './app';
import { logger } from '@chat-app/logger';
import { validateEnv } from '@chat-app/config';

const start = async () => {
  logger.info('Starting Chat Service...');

  const config = validateEnv({});
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chat';

  try {
    // 1. Connect MongoDB
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');

    // 2. Start Kafka Consumer
    const { startKafkaConsumer } = await import('./services/kafka-consumer');
    await startKafkaConsumer();
    logger.info('Kafka consumer started');

    // 3. Start Server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Chat Service listening on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Chat Service startup failed', err);
    process.exit(1);
  }
};

start();
