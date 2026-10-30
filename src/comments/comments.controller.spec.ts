import { Test, TestingModule } from '@nestjs/testing';
import { PostCommentsController } from './controller/comments.controller';
import { CommentsService } from './service/comments.service';

describe('PostCommentsController', () => {
  let controller: PostCommentsController;
  let service: jest.Mocked<Partial<CommentsService>>;

  beforeEach(async () => {
    service = {
      createForPost: jest.fn(),
      listForPost: jest.fn(),
      deleteComment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostCommentsController],
      providers: [{ provide: CommentsService, useValue: service }],
    }).compile();

    controller = module.get<PostCommentsController>(PostCommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create comment and return data', async () => {
      const mockComment = { id: 1, comment: 'Great' };
      (service.createForPost as jest.Mock).mockResolvedValueOnce(mockComment);

      const mockReq: any = {
        headers: { 'x-forwarded-for': '127.0.0.1' },
        socket: {},
      };

      const result = await controller.create(1, { comment: 'Great' }, mockReq);
      expect(result).toEqual({ success: true, data: mockComment });
      expect(service.createForPost).toHaveBeenCalledWith(1, { comment: 'Great' }, '127.0.0.1');
    });
  });

  describe('list', () => {
    it('should return comments list', async () => {
      const mockResult = { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      (service.listForPost as jest.Mock).mockResolvedValueOnce(mockResult);

      const result = await controller.list(1, '1', '20');
      expect(result).toEqual(mockResult);
      expect(service.listForPost).toHaveBeenCalledWith(1, 1, 20);
    });
  });

  describe('deleteComment', () => {
    it('should delete comment', async () => {
      (service.deleteComment as jest.Mock).mockResolvedValueOnce({ success: true });

      const result = await controller.deleteComment(1);
      expect(result).toEqual({ success: true, message: 'Comment deleted successfully' });
      expect(service.deleteComment).toHaveBeenCalledWith(1);
    });
  });
});
