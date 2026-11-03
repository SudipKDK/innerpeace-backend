import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';

describe('S3Service', () => {
  let service: S3Service;
  let s3SendSpy: jest.SpyInstance;

  beforeEach(async () => {
    process.env.AWS_REGION = 'us-east-1';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AWS_REGION') return 'ap-south-1';
              if (key === 'AWS_BUCKET')
                return 'innerpeace-bucket-objects-store';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
    s3SendSpy = jest.spyOn(service['s3'], 'send').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('S3Client initialization', () => {
    it('should initialize S3Client without hardcoded credentials (using IAM default credential chain)', () => {
      const client = service['s3'];
      expect(client).toBeDefined();

      const clientConfig = client.config as { credentials?: unknown };
      // When no credentials are provided to S3Client constructor, credentials is a default credential provider function
      expect(clientConfig.credentials).toBeInstanceOf(Function);
    });
  });

  describe('uploadImage', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'avatar.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: 1024,
      buffer: Buffer.from('fake-image-bytes'),
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    it('should upload image to "innerpeace-bucket-objects-store" bucket under "images/" path and return object key', async () => {
      s3SendSpy.mockResolvedValueOnce({});

      const result = await service.uploadImage(mockFile);

      expect(result).toMatch(/^images\/[a-f0-9-]+-avatar\.png$/);
      expect(s3SendSpy).toHaveBeenCalledTimes(1);

      const command = s3SendSpy.mock.calls[0][0] as PutObjectCommand;
      expect(command).toBeInstanceOf(PutObjectCommand);
      expect(command.input).toMatchObject({
        Bucket: 'innerpeace-bucket-objects-store',
        Key: result,
        Body: mockFile.buffer,
        ContentType: 'image/png',
      });
    });

    it('should throw BadRequestException if file is missing', async () => {
      await expect(service.uploadImage(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if file buffer is missing', async () => {
      const invalidFile = { ...mockFile, buffer: null as any };
      await expect(service.uploadImage(invalidFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException when S3 upload fails', async () => {
      s3SendSpy.mockRejectedValueOnce(new Error('S3 Connection Timeout'));

      await expect(service.uploadImage(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
