import { Test, TestingModule } from '@nestjs/testing';
import { MomentsController } from './controller/moments.controller';
import { MomentsService } from './service/moments.service';
import { BadRequestException } from '@nestjs/common';

describe('MomentsController', () => {
  let controller: MomentsController;
  let service: jest.Mocked<Partial<MomentsService>>;

  beforeEach(async () => {
    service = {
      createPresignedUpload: jest.fn(),
      markUploaded: jest.fn(),
      getPlayUrl: jest.fn(),
      listMoments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MomentsController],
      providers: [{ provide: MomentsService, useValue: service }],
    }).compile();

    controller = module.get<MomentsController>(MomentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('presign', () => {
    it('should validate mimeType and call createPresignedUpload', async () => {
      const mockResult = { momentId: 1, key: 'key', uploadUrl: 'http' };
      (service.createPresignedUpload as jest.Mock).mockResolvedValueOnce(
        mockResult,
      );

      const result = await controller.presign({
        mimeType: 'video/mp4',
        ext: 'mp4',
      });
      expect(result).toEqual(mockResult);
      expect(service.createPresignedUpload).toHaveBeenCalledWith(
        'video/mp4',
        'mp4',
      );
    });

    it('should throw BadRequestException for non-video mimeType', async () => {
      await expect(
        controller.presign({ mimeType: 'image/png' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('complete', () => {
    it('should mark moment as uploaded', async () => {
      (service.markUploaded as jest.Mock).mockResolvedValueOnce({
        success: true,
      });

      const result = await controller.complete({ momentId: 1 });
      expect(result).toEqual({ success: true });
      expect(service.markUploaded).toHaveBeenCalledWith(1);
    });
  });

  describe('play', () => {
    it('should return play URL', async () => {
      (service.getPlayUrl as jest.Mock).mockResolvedValueOnce({
        url: 'http://play',
      });

      const result = await controller.play(1);
      expect(result).toEqual({ url: 'http://play' });
      expect(service.getPlayUrl).toHaveBeenCalledWith(1);
    });
  });
});
