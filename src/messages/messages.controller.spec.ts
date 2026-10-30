import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './controller/messages.controller';
import { MessagesService } from './service/messages.service';

describe('MessagesController', () => {
  let controller: MessagesController;
  let service: jest.Mocked<Partial<MessagesService>>;

  beforeEach(async () => {
    service = {
      createMessage: jest.fn(),
      findAll: jest.fn(),
      getUnreadCount: jest.fn(),
      markAsRead: jest.fn(),
      deleteMessage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [{ provide: MessagesService, useValue: service }],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendAnonymousMessage', () => {
    it('should create message and return success response', async () => {
      const dto = { message: 'Anonymous note' };
      const req: any = { ip: '192.168.1.1', socket: {} };

      const result = await controller.sendAnonymousMessage(dto, req);
      expect(result).toEqual({ message: 'Message sent successfully', success: true });
      expect(service.createMessage).toHaveBeenCalledWith(dto, '192.168.1.1');
    });
  });

  describe('getAllMessages', () => {
    it('should return messages and unreadCount', async () => {
      const messages = [{ id: 1, message: 'Hi' } as any];
      (service.findAll as jest.Mock).mockResolvedValueOnce(messages);
      (service.getUnreadCount as jest.Mock).mockResolvedValueOnce(1);

      const result = await controller.getAllMessages();
      expect(result).toEqual({ messages, unreadCount: 1 });
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read', async () => {
      const result = await controller.markAsRead(1);
      expect(result).toEqual({ message: 'Message marked as read', success: true });
      expect(service.markAsRead).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteMessage', () => {
    it('should delete message', async () => {
      const result = await controller.deleteMessage(1);
      expect(result).toEqual({ message: 'Message deleted', success: true });
      expect(service.deleteMessage).toHaveBeenCalledWith(1);
    });
  });
});
