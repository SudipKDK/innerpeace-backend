import { Test, TestingModule } from '@nestjs/testing';
import { ReelsController } from './controller/reels.controller';
import { ReelsService } from './service/reels.service';

describe('ReelsController', () => {
  let controller: ReelsController;
  let service: jest.Mocked<Partial<ReelsService>>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findAllAdmin: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReelsController],
      providers: [{ provide: ReelsService, useValue: service }],
    }).compile();

    controller = module.get<ReelsController>(ReelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      (service.findAll as jest.Mock).mockResolvedValueOnce([]);

      const result = await controller.findAll();
      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { youtubeUrl: 'https://youtube.com/watch?v=1' };
      (service.create as jest.Mock).mockResolvedValueOnce({ id: 1, ...dto });

      const result = await controller.create(dto as any);
      expect(result).toEqual({ id: 1, ...dto });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto = { title: 'Updated' };
      (service.update as jest.Mock).mockResolvedValueOnce({ id: 1, ...dto });

      const result = await controller.update(1, dto as any);
      expect(result).toEqual({ id: 1, ...dto });
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      (service.remove as jest.Mock).mockResolvedValueOnce({ success: true });

      const result = await controller.remove(1);
      expect(result).toEqual({ success: true });
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
