import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './service/auth.service';
import { UsersService } from '../users/service/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '../common/enum/role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(async () => {
    usersService = {
      validateUser: jest.fn(),
      createUser: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: Role.USER,
      } as any;
      (usersService.validateUser as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await service.validateUser({
        email: 'test@example.com',
        password: 'password',
      });
      expect(result).toEqual(mockUser);
      expect(usersService.validateUser).toHaveBeenCalledWith(
        'test@example.com',
        'password',
      );
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      (usersService.validateUser as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.validateUser({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Pass123!',
        username: 'testuser',
      } as any;
      const created = { id: 1, ...dto };
      (usersService.createUser as jest.Mock).mockResolvedValueOnce(created);

      const result = await service.register(dto);
      expect(result).toEqual(created);
      expect(usersService.createUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should return access token', () => {
      (jwtService.sign as jest.Mock).mockReturnValueOnce('mocked.jwt.token');

      const result = service.login({
        username: 'testuser',
        id: 1,
        role: 'user',
      });
      expect(result).toEqual({ access_token: 'mocked.jwt.token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 1,
        role: 'user',
      });
    });
  });

  describe('forgotPassword', () => {
    it('should delegate to usersService.forgotPassword', async () => {
      (usersService.forgotPassword as jest.Mock).mockResolvedValueOnce({
        message: 'Reset email sent',
      });

      const result = await service.forgotPassword('test@example.com');
      expect(result).toEqual({ message: 'Reset email sent' });
      expect(usersService.forgotPassword).toHaveBeenCalledWith(
        'test@example.com',
      );
    });
  });

  describe('resetPassword', () => {
    it('should delegate to usersService.resetPassword', async () => {
      (usersService.resetPassword as jest.Mock).mockResolvedValueOnce({
        message: 'Password reset',
      });

      const result = await service.resetPassword('token-123', 'newPass123!');
      expect(result).toEqual({ message: 'Password reset' });
      expect(usersService.resetPassword).toHaveBeenCalledWith(
        'token-123',
        'newPass123!',
      );
    });
  });
});
