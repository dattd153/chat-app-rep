import { logger } from '@chat-app/logger';
import { validateEnv } from '@chat-app/config';
import { z } from 'zod';

console.log('--- 🛡️ Starting Phase 0 Verification ---');

// 1. Check Logger
logger.info('Logger is working correctly!', { detail: 'Verification script' });
logger.warn('This is a warning log test');
logger.error('This is an error log test with metadata', { errorId: 'TEST-123' });

// 2. Check Config (Bỏ qua nếu chưa config .env)
try {
  console.log('Validating environment...');
  const env = validateEnv({
    // Thử yêu cầu một biến không tồn tại để xem nó có báo lỗi chuẩn không
    // APP_NAME: z.string() 
  });
  logger.info('Config validation passed!', { nodeEnv: env.NODE_ENV });
} catch (err) {
  console.error('Config validation failed as expected (if missing vars)');
}

console.log('--- ✅ Phase 0 Verification Completed ---');
