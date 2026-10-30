import { GlobalExceptionFilter } from './global-exception.filter';
import { ArgumentsHost, BadRequestException, UnauthorizedException, HttpStatus } from '@nestjs/common';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
  });

  const createMockHost = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status };
    const request = { originalUrl: '/api/test', method: 'GET' };

    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(response),
        getRequest: jest.fn().mockReturnValue(request),
      }),
    } as unknown as ArgumentsHost;

    return { host, status, json };
  };

  it('should handle BadRequestException with validation error formatting', () => {
    const { host, status, json } = createMockHost();
    const exception = new BadRequestException(['title is required']);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation failed',
      }),
    );
  });

  it('should handle UnauthorizedException', () => {
    const { host, status, json } = createMockHost();
    const exception = new UnauthorizedException();

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Authentication required',
      }),
    );
  });
});
