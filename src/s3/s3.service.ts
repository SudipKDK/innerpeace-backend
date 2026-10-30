import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  HttpException,
  Logger,
  Optional,
} from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  GetObjectCommand,
  S3Client,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly publicBaseUrl?: string;

  constructor(@Optional() private readonly configService?: ConfigService) {
    const region =
      this.configService?.get<string>('AWS_REGION') ||
      process.env.AWS_REGION ||
      'ap-south-1';

    // Initialize S3Client passing ONLY region to fall back to the default AWS credential provider chain (e.g. IAM roles)
    this.s3 = new S3Client({
      region,
    });

    this.bucketName =
      this.configService?.get<string>('AWS_BUCKET') ||
      process.env.AWS_BUCKET ||
      'innerpeace-bucket-objects-store';

    this.publicBaseUrl =
      this.configService?.get<string>('AWS_S3_PUBLIC_BASE_URL') ||
      process.env.AWS_S3_PUBLIC_BASE_URL;
  }

  /**
   * Upload an image buffer to S3 bucket under 'images/' path.
   *
   * @param file Express.Multer.File object containing buffer and mimetype
   * @returns S3 object key of the uploaded file
   */
  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestException(
        'A valid file buffer is required for upload',
      );
    }

    const ext = file.originalname
      ? extname(file.originalname).toLowerCase()
      : '';
    const safeName = file.originalname
      ? this.safeFilename(file.originalname.replace(ext, ''))
      : 'image';
    const uniqueFilename = `${randomUUID()}-${safeName}${ext}`;
    const key = `images/${uniqueFilename}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3.send(command);
      return key;
    } catch (error) {
      this.logger.error(
        `Failed to upload image to S3 bucket '${this.bucketName}': ${(error as Error).message}`,
        (error as Error).stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload image to S3');
    }
  }

  async uploadPublicFile(
    file: Express.Multer.File,
    prefix: string,
  ): Promise<string> {
    const safeName = this.safeFilename(file.originalname);
    const key = `${prefix.replace(/\/+$/, '')}/${randomUUID()}-${safeName}`;

    const params: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const acl = this.configService?.get<string>('AWS_S3_ACL');
    if (acl) {
      params.ACL = acl as ObjectCannedACL;
    }

    try {
      await this.s3.send(new PutObjectCommand(params));
      return key;
    } catch (error) {
      this.logger.error(
        `Failed to upload public file: ${(error as Error).message}`,
        (error as Error).stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  async deletePublicFile(key?: string | null): Promise<void> {
    if (!key) return;

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key.replace(/^\/+/, ''),
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete file from S3: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }

  fileUrl(key?: string | null): string | null {
    if (!key) return null;

    // If key is already a full URL, return as-is
    if (/^https?:\/\//i.test(key)) return key;

    // If public base URL is configured, use it
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}`;
    }

    // Fallback to S3 standard URL format
    const region =
      this.configService?.get<string>('AWS_REGION') ||
      process.env.AWS_REGION ||
      'ap-south-1';
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key.replace(/^\/+/, '')}`;
  }

  async presignPutObject(
    key: string,
    mimeType: string,
    expiresInSec = 60 * 5,
  ): Promise<string> {
    try {
      const cmd = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: mimeType,
      });

      return await getSignedUrl(this.s3, cmd, {
        expiresIn: expiresInSec,
      });
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned PUT URL: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException('Failed to generate upload URL');
    }
  }

  /**
   * Create a presigned GET URL for secure playback/download.
   */
  async presignGetObject(key: string, expiresInSec = 60 * 10): Promise<string> {
    try {
      const cmd = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3, cmd, {
        expiresIn: expiresInSec,
      });
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned GET URL: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException('Failed to generate access URL');
    }
  }

  private safeFilename(name: string): string {
    const cleaned = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9._-]/g, '');

    return cleaned || 'file';
  }
}
