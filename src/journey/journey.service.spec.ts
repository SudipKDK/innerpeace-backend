import { Test, TestingModule } from '@nestjs/testing';
import { JourneyService } from './service/journey.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Journey } from './entity/journey.entity';
import { S3Service } from '../s3/s3.service';
import { NotFoundException } from '@nestjs/common';
import { JourneyStatus } from '../common/enum/journey-status.enum';

describe('JourneyService', () => {
  let service: JourneyService;
  let repo: any;
  let s3Service: jest.Mocked<Partial<S3Service>>;

  beforeEach(async () => {
    repo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((j) => Promise.resolve({ id: 1, ...j })),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    s3Service = {
      fileUrl: jest.fn().mockImplementation((key) => `https://s3/${key}`),
      uploadPublicFile: jest.fn().mockResolvedValue('journey/images/test.jpg'),
      deletePublicFile: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyService,
        { provide: getRepositoryToken(Journey), useValue: repo },
        { provide: S3Service, useValue: s3Service },
      ],
    }).compile();

    service = module.get<JourneyService>(JourneyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJourney', () => {
    it('should create journey without image', async () => {
      const dto = { title: 'Trip', description: 'Fun', eventDate: '2026-01-01', status: JourneyStatus.PUBLISHED };
      const result = await service.createJourney(dto as any);

      expect(result.title).toBe('Trip');
      expect(result.image).toBeNull();
      expect(repo.save).toHaveBeenCalled();
    });

    it('should upload image if provided', async () => {
      const dto = { title: 'Trip', description: 'Fun', eventDate: '2026-01-01', status: JourneyStatus.PUBLISHED };
      const mockFile = { originalname: 'pic.jpg' } as any;

      const result = await service.createJourney(dto as any, mockFile);

      expect(s3Service.uploadPublicFile).toHaveBeenCalledWith(mockFile, 'journey/images');
      expect(result.image).toBe('https://s3/journey/images/test.jpg');
    });
  });

  describe('getJourney', () => {
    it('should return published journeys', async () => {
      repo.find.mockResolvedValueOnce([{ id: 1, title: 'Published', status: JourneyStatus.PUBLISHED, image: 'img.jpg' }]);

      const result = await service.getJourney();
      expect(result).toHaveLength(1);
      expect(result[0].image).toBe('https://s3/img.jpg');
    });
  });

  describe('getJourneyById', () => {
    it('should return journey by id', async () => {
      repo.findOne.mockResolvedValueOnce({ id: 1, title: 'Found', image: null });

      const result = await service.getJourneyById(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne.mockResolvedValueOnce(null);

      await expect(service.getJourneyById(99)).rejects.toThrow(NotFoundException);
    });
  });
});
