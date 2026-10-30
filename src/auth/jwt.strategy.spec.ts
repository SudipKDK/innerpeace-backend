import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(configService);
  });

  it('should validate and return user payload', async () => {
    const payload = { sub: 1, username: 'john', role: 'admin' };
    const result = await strategy.validate(payload);
    expect(result).toEqual({ id: 1, username: 'john', role: 'admin' });
  });

  it('should throw UnauthorizedException if sub is missing', async () => {
    await expect(strategy.validate({ username: 'john' })).rejects.toThrow(UnauthorizedException);
  });
});
