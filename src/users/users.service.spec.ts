import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './service/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { PasswordResetToken } from './entity/password-reset-token.entity';
import { MailService } from '../mail/service/mail.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: any;
  let pwResetRepo: any;
  let mailService: jest.Mocked<Partial<MailService>>;

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((u) => Promise.resolve({ id: 1, ...u })),
      find: jest.fn().mockResolvedValue([]),
    };

    pwResetRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((t) => Promise.resolve({ id: 1, ...t })),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    mailService = {
      sendResetPassword: jest.fn().mockResolvedValue({ success: true } as any),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(PasswordResetToken), useValue: pwResetRepo },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should throw ConflictException if email exists', async () => {
      userRepo.findOne.mockResolvedValueOnce({ id: 1, email: 'exists@example.com' });

      await expect(
        service.createUser({ email: 'exists@example.com', username: 'u', password: 'P1!' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create and return safe user data without password', async () => {
      userRepo.findOne.mockResolvedValueOnce(null);

      const result = await service.createUser({
        email: 'new@example.com',
        username: 'newuser',
        password: 'Password123!',
      });

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('email', 'new@example.com');
      expect((result as any).password).toBeUndefined();
    });
  });

  describe('validateUser', () => {
    it('should return user without password if hash matches', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 10);
      userRepo.findOne.mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        username: 'test',
        password: hashedPassword,
        role: 'user',
      });

      const result = await service.validateUser('test@example.com', 'secret123');
      expect(result).toEqual({ id: 1, email: 'test@example.com', username: 'test', role: 'user' });
    });

    it('should return null if password does not match', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 10);
      userRepo.findOne.mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
      });

      const result = await service.validateUser('test@example.com', 'wrong');
      expect(result).toBeNull();
    });

    it('should return null if user does not exist', async () => {
      userRepo.findOne.mockResolvedValueOnce(null);

      const result = await service.validateUser('notfound@example.com', 'pass');
      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      userRepo.findOne.mockResolvedValueOnce({ id: 1, username: 'john' });

      const result = await service.getUserById(1);
      expect(result).toEqual({ id: 1, username: 'john' });
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepo.findOne.mockResolvedValueOnce(null);

      await expect(service.getUserById(99)).rejects.toThrow(NotFoundException);
    });
  });
});
