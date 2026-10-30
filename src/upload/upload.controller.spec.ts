import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { S3Service } from '../s3/s3.service';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('UploadController', () => {
  let controller: UploadController;
  let s3Service: jest.Mocked<Partial<S3Service>>;

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 2048,
    buffer: Buffer.from('test-buffer'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };

  beforeEach(async () => {
    s3Service = {
      uploadImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: S3Service,
          useValue: s3Service,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should call S3Service.uploadImage and return success message with object key', async () => {
      const mockKey = 'images/abc-123-test.jpg';
      (s3Service.uploadImage as jest.Mock).mockResolvedValueOnce(mockKey);

      const response = await controller.uploadImage(mockFile);

      expect(s3Service.uploadImage).toHaveBeenCalledWith(mockFile);
      expect(response).toEqual({
        message: 'Image uploaded successfully',
        key: mockKey,
      });
    });

    it('should throw BadRequestException if file is not provided', async () => {
      await expect(controller.uploadImage(null as any)).rejects.toThrow(
        BadRequestException,
      );
      expect(s3Service.uploadImage).not.toHaveBeenCalled();
    });

    it('should propagate InternalServerErrorException when S3Service throws', async () => {
      (s3Service.uploadImage as jest.Mock).mockRejectedValueOnce(
        new InternalServerErrorException('Upload failed'),
      );

      await expect(controller.uploadImage(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
