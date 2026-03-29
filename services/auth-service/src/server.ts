import mongoose from 'mongoose';
import { app } from './app';
import { validateEnv } from '@chat-app/config';
import { logger } from '@chat-app/logger';
import { kafkaProducer } from './services/kafka-producer';

const start = async () => {
  logger.info('Starting Auth Service...');

  // 1. Validate Env
  const config = validateEnv({});

  try {
    // 2. Connect Kafka
    const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
    await kafkaProducer.connect(brokers);

    // 3. Connect MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/auth';
    await mongoose.connect(mongoUri);
    logger.info('Connected to Auth MongoDB');

    // 4. Start Server
    const port = config.PORT || 3000;
    app.listen(port, () => {
      logger.info(`Auth Service is listening on port ${port}`);
    });

  } catch (err) {
    logger.error('Auth Service startup failed', { error: err });
    process.exit(1);
  }
};

start();
