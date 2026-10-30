import { Test, TestingModule } from '@nestjs/testing';
import { JourneyController } from './controller/journey.controller';
import { JourneyService } from './service/journey.service';

describe('JourneyController', () => {
  let controller: JourneyController;
  let service: jest.Mocked<Partial<JourneyService>>;

  beforeEach(async () => {
    service = {
      createJourney: jest.fn(),
      getJourney: jest.fn(),
      getAllJourneyAdmin: jest.fn(),
      getJourneyById: jest.fn(),
      updateJourney: jest.fn(),
      removeJourney: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JourneyController],
      providers: [{ provide: JourneyService, useValue: service }],
    }).compile();

    controller = module.get<JourneyController>(JourneyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.createJourney', async () => {
      const dto = { title: 'Trip', eventDate: '2026-01-01' } as any;
      (service.createJourney as jest.Mock).mockResolvedValueOnce({ id: 1, ...dto });

      const result = await controller.create(dto, null as any, {});
      expect(result).toHaveProperty('id', 1);
      expect(service.createJourney).toHaveBeenCalledWith(dto, null);
    });
  });

  describe('get', () => {
    it('should call service.getJourney', async () => {
      (service.getJourney as jest.Mock).mockResolvedValueOnce([{ id: 1 }]);

      const result = await controller.get();
      expect(result).toEqual([{ id: 1 }]);
      expect(service.getJourney).toHaveBeenCalled();
    });
  });

  describe('getAllAdmin', () => {
    it('should call service.getAllJourneyAdmin', async () => {
      (service.getAllJourneyAdmin as jest.Mock).mockResolvedValueOnce([{ id: 1 }]);

      const result = await controller.getAllAdmin();
      expect(result).toEqual([{ id: 1 }]);
      expect(service.getAllJourneyAdmin).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should call service.removeJourney', async () => {
      (service.removeJourney as jest.Mock).mockResolvedValueOnce({ message: 'Deleted' });

      const result = await controller.delete(1, {});
      expect(result).toEqual({ message: 'Deleted' });
      expect(service.removeJourney).toHaveBeenCalledWith(1);
    });
  });
});
