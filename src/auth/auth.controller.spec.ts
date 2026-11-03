import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { UsersService } from '../users/service/users.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Partial<AuthService>>;
  let usersService: jest.Mocked<Partial<UsersService>>;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      validateUser: jest.fn(),
      login: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    };

    usersService = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerUser', () => {
    it('should call authService.register and return the user', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Pass!',
        username: 'user',
      } as any;
      const expected = { id: 1, ...dto };
      (authService.register as jest.Mock).mockResolvedValueOnce(expected);

      const result = await controller.registerUser(dto);
      expect(result).toEqual(expected);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should validate and log in user', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const user = { id: 1, username: 'testuser', role: 'user' };
      (authService.validateUser as jest.Mock).mockResolvedValueOnce(user);
      (authService.login as jest.Mock).mockReturnValueOnce({
        access_token: 'token',
      });

      const result = await controller.login(loginDto);
      expect(result).toEqual({ access_token: 'token' });
      expect(authService.validateUser).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledWith(user);
    });
  });

  describe('forgot', () => {
    it('should call authService.forgotPassword', async () => {
      (authService.forgotPassword as jest.Mock).mockResolvedValueOnce({
        success: true,
      });

      const result = await controller.forgot({ email: 'test@example.com' });
      expect(result).toEqual({ success: true });
      expect(authService.forgotPassword).toHaveBeenCalledWith(
        'test@example.com',
      );
    });
  });

  describe('reset', () => {
    it('should call authService.resetPassword', async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValueOnce({
        success: true,
      });

      const result = await controller.reset({
        token: 'tok',
        newPassword: 'new',
      });
      expect(result).toEqual({ success: true });
      expect(authService.resetPassword).toHaveBeenCalledWith('tok', 'new');
    });
  });

  describe('me', () => {
    it('should return req.user', () => {
      const mockReq = { user: { id: 1, username: 'test' } };
      expect(controller.me(mockReq)).toEqual(mockReq.user);
    });
  });
});
