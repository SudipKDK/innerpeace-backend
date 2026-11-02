import { Test, TestingModule } from '@nestjs/testing';
import { ReelsService } from './service/reels.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reel } from './entity/reel.entity';
import { NotFoundException } from '@nestjs/common';

describe('ReelsService', () => {
  let service: ReelsService;
  let repo: any;

  beforeEach(async () => {
    repo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest
        .fn()
        .mockImplementation((r) => Promise.resolve({ id: 1, ...r })),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReelsService,
        { provide: getRepositoryToken(Reel), useValue: repo },
      ],
    }).compile();

    service = module.get<ReelsService>(ReelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return active reels', async () => {
      const mockReels = [{ id: 1, isActive: true }];
      repo.find.mockResolvedValueOnce(mockReels);

      const result = await service.findAll();
      expect(result).toEqual(mockReels);
      expect(repo.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { displayOrder: 'ASC', createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return reel if found', async () => {
      repo.findOne.mockResolvedValueOnce({ id: 1, title: 'Reel 1' });

      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and save a reel', async () => {
      const dto = {
        title: 'New Reel',
        youtubeUrl: 'https://youtube.com/reel1',
      };
      const result = await service.create(dto as any);

      expect(result.youtubeUrl).toBe('https://youtube.com/reel1');
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove reel', async () => {
      const mockReel = { id: 1, title: 'Reel 1' };
      repo.findOne.mockResolvedValueOnce(mockReel);

      await service.remove(1);
      expect(repo.remove).toHaveBeenCalledWith(mockReel);
    });
  });
});
