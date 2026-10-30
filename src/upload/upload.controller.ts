import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { S3Service } from '../s3/s3.service';

export interface UploadImageResponse {
  message: string;
  key: string;
}

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly s3Service: S3Service) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload an image to S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Image uploaded successfully' },
        key: { type: 'string', example: 'images/3f8d9b1a-image.png' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'File is missing or invalid' })
  @ApiResponse({ status: 500, description: 'Failed to upload image' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadImageResponse> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      const key = await this.s3Service.uploadImage(file);
      return {
        message: 'Image uploaded successfully',
        key,
      };
    } catch (error) {
      this.logger.error(
        `Failed to process image upload: ${(error as Error).message}`,
        (error as Error).stack,
      );
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload image');
    }
  }
}
