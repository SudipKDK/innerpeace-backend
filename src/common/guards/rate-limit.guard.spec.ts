import { RateLimitGuard } from './rate-limit.guard';
import { ExecutionContext, HttpException } from '@nestjs/common';

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;

  beforeEach(() => {
    guard = new RateLimitGuard();
  });

  const createMockContext = (ip = '127.0.0.1'): ExecutionContext => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          ip,
          headers: {},
          connection: { remoteAddress: ip },
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow initial request', () => {
    const context = createMockContext();
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should block requests when limit is exceeded', () => {
    const context = createMockContext('192.168.1.1');

    for (let i = 0; i < 100; i++) {
      expect(guard.canActivate(context)).toBe(true);
    }

    expect(() => guard.canActivate(context)).toThrow(HttpException);
  });
});
