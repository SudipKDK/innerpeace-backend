import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestSizeLimitMiddleware implements NestMiddleware {
  private readonly maxBodySize = 10 * 1024 * 1024; // 10MB for regular requests
  private readonly maxFileSize = 50 * 1024 * 1024; // 50MB for file uploads

  use(req: Request, res: Response, next: NextFunction) {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const isFileUpload = req.headers['content-type']?.includes('multipart/form-data');

    // Check Content-Length header
    if (contentLength > 0) {
      const maxSize = isFileUpload ? this.maxFileSize : this.maxBodySize;

      if (contentLength > maxSize) {
        throw new HttpException(
          {
            success: false,
            message: `Request size exceeds limit of ${maxSize / (1024 * 1024)}MB`,
            error: 'Payload Too Large',
          },
          HttpStatus.PAYLOAD_TOO_LARGE,
        );
      }
    }

    // Multer handles multipart streams; avoid double-consuming the stream.
    if (isFileUpload) {
      return next();
    }

    // Stream size monitoring for large payloads
    let receivedBytes = 0;
    const monitorSize = (chunk: any) => {
      if (chunk) {
        receivedBytes += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk);
        const maxSize = this.maxBodySize;

        if (receivedBytes > maxSize) {
          throw new HttpException(
            {
              success: false,
              message: `Request size exceeds limit of ${maxSize / (1024 * 1024)}MB`,
              error: 'Payload Too Large',
            },
            HttpStatus.PAYLOAD_TOO_LARGE,
          );
        }
      }
    };

    // Override write and end methods to monitor incoming data
    req.on('data', monitorSize);

    next();
  }
}
