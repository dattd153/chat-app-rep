import http from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import { logger } from '@chat-app/logger';
import { validateEnv } from '@chat-app/config';
import { setupRedisAdapter } from './redis/adapter';
import { initSocketServer } from './gateway/socket-server';
import { startKafkaConsumer } from './services/kafka-consumer';
import { kafkaProducer } from './services/kafka-producer';

const start = async () => {
  logger.info('Starting WebSocket Service...');

  const config = validateEnv({});
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*', // For development
      methods: ['GET', 'POST'],
    },
  });

  try {
    // 1. Setup Redis Adapter
    await setupRedisAdapter(io);

    // 2. Initialize Socket Logic
    initSocketServer(io);

    // 3. Start Kafka (Consumer & Producer)
    const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
    await Promise.all([
      startKafkaConsumer(io),
      kafkaProducer.connect()
    ]);

    // 4. Start Server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      logger.info(`WebSocket Service listening on port ${PORT}`);
    });
  } catch (err) {
    logger.error('WebSocket Service startup failed', err);
    process.exit(1);
  }
};

start();
