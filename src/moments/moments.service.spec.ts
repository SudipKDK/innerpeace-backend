import { Test, TestingModule } from '@nestjs/testing';
import { MomentsService } from './service/moments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Moments } from './entity/moments.entity';
import { S3Service } from '../s3/s3.service';
import { MomentVideoStatus } from '../common/enum/moment-status.enum';
import { NotFoundException } from '@nestjs/common';

describe('MomentsService', () => {
  let service: MomentsService;
  let repo: any;
  let s3Service: jest.Mocked<Partial<S3Service>>;

  beforeEach(async () => {
    repo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((m) => Promise.resolve({ id: 1, ...m })),
      findOneBy: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
    };

    s3Service = {
      presignPutObject: jest.fn().mockResolvedValue('https://s3-upload-url'),
      presignGetObject: jest.fn().mockResolvedValue('https://s3-get-url'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MomentsService,
        { provide: getRepositoryToken(Moments), useValue: repo },
        { provide: S3Service, useValue: s3Service },
      ],
    }).compile();

    service = module.get<MomentsService>(MomentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPresignedUpload', () => {
    it('should create moment record and return presigned upload url', async () => {
      const result = await service.createPresignedUpload('video/mp4', 'mp4');

      expect(result.momentId).toBe(1);
      expect(result.uploadUrl).toBe('https://s3-upload-url');
      expect(result.key).toMatch(/^moments\/raw\/[a-f0-9-]+\.mp4$/);
      expect(repo.save).toHaveBeenCalled();
      expect(s3Service.presignPutObject).toHaveBeenCalledWith(result.key, 'video/mp4');
    });
  });

  describe('markUploaded', () => {
    it('should update moment status to UPLOADED', async () => {
      const mockMoment = { id: 1, status: MomentVideoStatus.PENDING };
      repo.findOneBy.mockResolvedValueOnce(mockMoment);

      const result = await service.markUploaded(1);
      expect(result).toEqual({ success: true });
      expect(mockMoment.status).toBe(MomentVideoStatus.UPLOADED);
      expect(repo.save).toHaveBeenCalledWith(mockMoment);
    });

    it('should throw NotFoundException if moment not found', async () => {
      repo.findOneBy.mockResolvedValueOnce(null);

      await expect(service.markUploaded(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPlayUrl', () => {
    it('should return presigned get URL', async () => {
      repo.findOneBy.mockResolvedValueOnce({ id: 1, rawKey: 'moments/raw/1.mp4' });

      const result = await service.getPlayUrl(1);
      expect(result).toEqual({ url: 'https://s3-get-url' });
      expect(s3Service.presignGetObject).toHaveBeenCalledWith('moments/raw/1.mp4', 600);
    });
  });
});
