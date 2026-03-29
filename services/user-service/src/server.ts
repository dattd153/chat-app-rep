import mongoose from 'mongoose';
import { app } from './app';
import { validateEnv } from '@chat-app/config';
import { logger } from '@chat-app/logger';
import { kafkaConsumer } from './services/kafka-consumer';

const start = async () => {
  logger.info('Starting User Service...');

  // 1. Validate Env
  const config = validateEnv({});

  try {
    // 2. Connect Kafka Consumer
    const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
    await kafkaConsumer.connect(brokers, 'user-service-group');

    // 3. Connect MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/user';
    await mongoose.connect(mongoUri);
    logger.info('Connected to User MongoDB');

    // 4. Start Server
    const port = config.PORT || 3000;
    app.listen(port, () => {
      logger.info(`User Service is listening on port ${port}`);
    });

  } catch (err) {
    logger.error('User Service startup failed', { error: err });
    process.exit(1);
  }
};

start();
