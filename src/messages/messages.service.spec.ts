import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './service/messages.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnonymousMessage } from './entity/anonymous-message.entity';

describe('MessagesService', () => {
  let service: MessagesService;
  let repo: any;

  beforeEach(async () => {
    repo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest
        .fn()
        .mockImplementation((m) => Promise.resolve({ id: 1, ...m })),
      find: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      count: jest.fn().mockResolvedValue(0),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: getRepositoryToken(AnonymousMessage), useValue: repo },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMessage', () => {
    it('should create and save an anonymous message', async () => {
      const dto = { message: 'Hello from secret friend' };
      const result = await service.createMessage(dto, '127.0.0.1');

      expect(result.message).toBe('Hello from secret friend');
      expect(result.ipAddress).toBe('127.0.0.1');
      expect(result.isRead).toBe(false);
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all messages', async () => {
      const mockList = [{ id: 1, message: 'Hi' }];
      repo.find.mockResolvedValueOnce(mockList);

      const result = await service.findAll();
      expect(result).toEqual(mockList);
    });
  });

  describe('markAsRead', () => {
    it('should update isRead to true', async () => {
      await service.markAsRead(1);
      expect(repo.update).toHaveBeenCalledWith(1, { isRead: true });
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread messages', async () => {
      repo.count.mockResolvedValueOnce(5);
      const count = await service.getUnreadCount();
      expect(count).toBe(5);
    });
  });

  describe('deleteMessage', () => {
    it('should delete message by id', async () => {
      await service.deleteMessage(1);
      expect(repo.delete).toHaveBeenCalledWith(1);
    });
  });
});
