import { app } from './app';
import { validateEnv } from '@chat-app/config';
import { logger } from '@chat-app/logger';

const start = async () => {
  logger.info('Starting API Gateway...');

  // 1. Validate Env
  const config = validateEnv({});

  try {
    // 2. Start Server
    const port = config.PORT || 3000;
    app.listen(port, () => {
      logger.info(`API Gateway is listening on port ${port}`);
    });

  } catch (err) {
    logger.error('API Gateway startup failed', { error: err });
    process.exit(1);
  }
};

start();
