import mongoose from 'mongoose';
import { app } from './app';
import { logger } from '@chat-app/logger';
import { validateEnv } from '@chat-app/config';
import { startOutboxWorker } from './services/outbox-worker';

const start = async () => {
  logger.info('Starting Message Service...');

  const config = validateEnv({});
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/message';

  try {
    // 1. Connect MongoDB
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');

    // 2. Start Outbox Worker
    await startOutboxWorker();
    logger.info('Outbox Worker started');

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
