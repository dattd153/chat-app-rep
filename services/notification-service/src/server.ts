import mongoose from 'mongoose';
import { app } from './app';
import { validateEnv } from '@chat-app/config';
import { logger } from '@chat-app/logger';
import { kafkaConsumer } from './services/kafka-consumer';

const start = async () => {
  logger.info('Starting Notification Service...');

  const config = validateEnv({});

  try {
    // 1. Connect MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/notification';
    await mongoose.connect(mongoUri);
    logger.info('Connected to Notification MongoDB');

    // 2. Connect Kafka Consumer (Background)
    kafkaConsumer.connect().catch(err => {
      logger.error('Failed to connect Kafka in Notification Service', err);
    });

    // 3. Start Server
    const port = config.PORT || 3000;
    app.listen(port, () => {
      logger.info(`Notification Service is listening on port ${port}`);
    });

  } catch (err) {
    logger.error('Notification Service startup failed', err);
    process.exit(1);
  }
};

start();
