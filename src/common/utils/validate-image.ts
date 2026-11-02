import { BadRequestException } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

/**
 * Validates a Multer file's actual content by inspecting its magic bytes.
 * Throws BadRequestException if the file is not a supported image type.
 */
export async function validateImageBuffer(
  file: Express.Multer.File,
): Promise<void> {
  if (!file.buffer || file.buffer.length === 0) {
    throw new BadRequestException('File buffer is empty');
  }

  const result = await fileTypeFromBuffer(file.buffer);

  if (!result || !ALLOWED_IMAGE_MIMES.has(result.mime)) {
    throw new BadRequestException(
      `File content is not a supported image type. Detected: ${result?.mime ?? 'unknown'}. Allowed: JPEG, PNG, WebP, GIF`,
    );
  }
}
