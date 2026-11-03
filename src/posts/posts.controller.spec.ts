jest.mock('../common/utils/validate-image', () => ({
  validateImageBuffer: jest.fn().mockResolvedValue(undefined),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './controller/posts.controller';
import { PostsService } from './service/posts.service';

describe('PostsController', () => {
  let controller: PostsController;
  let service: jest.Mocked<Partial<PostsService>>;

  beforeEach(async () => {
    service = {
      createPost: jest.fn(),
      findAllPosts: jest.fn(),
      findOneById: jest.fn(),
      findOneBySlug: jest.fn(),
      updatePost: jest.fn(),
      removePost: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: service }],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.createPost with user id', async () => {
      const dto = { title: 'New Post' } as any;
      const req: any = { user: { id: 10 } };
      (service.createPost as jest.Mock).mockResolvedValueOnce({
        id: 1,
        ...dto,
      });

      const result = await controller.create(dto, null as any, req);
      expect(result).toHaveProperty('id', 1);
      expect(service.createPost).toHaveBeenCalledWith(dto, null, 10);
    });
  });

  describe('findOne', () => {
    it('should return post by id', async () => {
      (service.findOneById as jest.Mock).mockResolvedValueOnce({
        id: 1,
        title: 'Test',
      } as any);

      const result = await controller.findOne(1);
      expect(result).toEqual({ id: 1, title: 'Test' });
      expect(service.findOneById).toHaveBeenCalledWith(1);
    });
  });

  describe('remove', () => {
    it('should delete post', async () => {
      const req: any = { user: { id: 10 } };
      (service.removePost as jest.Mock).mockResolvedValueOnce({
        message: 'Deleted',
      });

      const result = await controller.remove(1, req);
      expect(result).toEqual({ message: 'Deleted' });
      expect(service.removePost).toHaveBeenCalledWith(1, 10);
    });
  });
});
