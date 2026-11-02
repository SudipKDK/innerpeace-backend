import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './service/posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { UsersService } from '../users/service/users.service';
import { S3Service } from '../s3/s3.service';
import { PostStatus } from '../common/enum/post-status.enum';
import { NotFoundException } from '@nestjs/common';

describe('PostsService', () => {
  let service: PostsService;
  let postRepo: any;
  let userService: any;
  let s3Service: jest.Mocked<Partial<S3Service>>;

  beforeEach(async () => {
    postRepo = {
      exists: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest
        .fn()
        .mockImplementation((p) => Promise.resolve({ id: 1, ...p })),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    userService = {
      getUserById: jest.fn().mockResolvedValue({ id: 1, username: 'admin' }),
    };

    s3Service = {
      fileUrl: jest
        .fn()
        .mockImplementation((k) => (k ? `https://s3/${k}` : null)),
      uploadPublicFile: jest.fn().mockResolvedValue('posts/images/test.jpg'),
      deletePublicFile: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useValue: postRepo },
        { provide: UsersService, useValue: userService },
        { provide: S3Service, useValue: s3Service },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPost', () => {
    it('should create post without image', async () => {
      const dto = {
        title: 'First Post',
        content: 'Testing...',
        status: PostStatus.PUBLISHED,
      };

      const result = await service.createPost(dto as any, null as any, 1);
      expect(result.title).toBe('First Post');
      expect(result.slug).toBe('first-post');
      expect(result.image).toBeNull();
      expect(postRepo.save).toHaveBeenCalled();
    });

    it('should upload image if provided', async () => {
      const dto = {
        title: 'Image Post',
        content: 'Testing...',
        status: PostStatus.PUBLISHED,
      };
      const file = { originalname: 'banner.png' } as any;

      const result = await service.createPost(dto as any, file, 1);
      expect(s3Service.uploadPublicFile).toHaveBeenCalledWith(
        file,
        'posts/images',
      );
      expect(result.image).toBe('https://s3/posts/images/test.jpg');
    });
  });

  describe('findOneById', () => {
    it('should return post by id', async () => {
      postRepo.findOne.mockResolvedValueOnce({
        id: 1,
        title: 'Found',
        image: 'test.jpg',
      });

      const result = await service.findOneById(1);
      expect(result.id).toBe(1);
      expect(result.image).toBe('https://s3/test.jpg');
    });

    it('should throw NotFoundException if post not found', async () => {
      postRepo.findOne.mockResolvedValueOnce(null);

      await expect(service.findOneById(99)).rejects.toThrow(NotFoundException);
    });
  });
});
