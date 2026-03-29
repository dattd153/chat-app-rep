import { logger } from './index';

describe('Logger', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have a log method', () => {
    expect(typeof logger.info).toBe('function');
  });
});
