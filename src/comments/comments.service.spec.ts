import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './service/comments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './entity/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { NotFoundException } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepo: any;
  let postRepo: any;

  beforeEach(async () => {
    commentRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((c) => Promise.resolve({ id: 1, ...c })),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    postRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(Comment), useValue: commentRepo },
        { provide: getRepositoryToken(Post), useValue: postRepo },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createForPost', () => {
    it('should create comment if post exists', async () => {
      postRepo.findOne.mockResolvedValueOnce({ id: 1, title: 'Test Post' });

      const result = await service.createForPost(1, { comment: 'Nice!' }, '127.0.0.1');
      expect(result).toHaveProperty('id', 1);
      expect(result.comment).toBe('Nice!');
      expect(commentRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if post not found', async () => {
      postRepo.findOne.mockResolvedValueOnce(null);

      await expect(service.createForPost(999, { comment: 'Nice!' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('listForPost', () => {
    it('should return paginated comments', async () => {
      const mockComments = [{ id: 1, comment: 'Hello' }];
      commentRepo.findAndCount.mockResolvedValueOnce([mockComments, 1]);

      const result = await service.listForPost(1, 1, 10);
      expect(result.data).toEqual(mockComments);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('deleteComment', () => {
    it('should throw NotFoundException if comment does not exist', async () => {
      commentRepo.findOne.mockResolvedValueOnce(null);

      await expect(service.deleteComment(999)).rejects.toThrow(NotFoundException);
    });
  });
});
