import { validateEnv } from './index';
import { z } from 'zod';

describe('Config', () => {
  it('should validate common variables', () => {
    // This will work since defaults are provided in the setup
    const config = validateEnv({});
    expect(config.NODE_ENV).toBeDefined();
    expect(config.PORT).toBe('3000');
  });

  it('should fail when missing required property', () => {
    // Mock exit to prevent actual crash
    const spy = jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // This should fail because DB_URL is missing
    validateEnv({
      DB_URL: z.string()
    });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    consoleSpy.mockRestore();
  });
});
