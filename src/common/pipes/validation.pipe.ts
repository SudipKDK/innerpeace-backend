import {
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
  ValidationError,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    // First, apply standard validation
    const validatedValue = await super.transform(value, metadata);

    // Additional security checks
    if (typeof validatedValue === 'object' && validatedValue !== null) {
      // Sanitize string fields to prevent XSS
      this.sanitizeObject(validatedValue);

      // Check for suspicious patterns
      this.checkForSuspiciousPatterns(validatedValue);
    }

    return validatedValue;
  }

  private sanitizeObject(obj: any): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Basic HTML entity encoding for XSS vectors
        // Note: forward slashes are safe and should NOT be encoded (breaks URLs)
        obj[key] = obj[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.sanitizeObject(obj[key]);
      }
    }
  }

  private checkForSuspiciousPatterns(obj: any): void {
    const suspiciousPatterns = [
      /\b(script|javascript|vbscript|onload|onerror)\b/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /data:\s*text\/html/i,
    ];

    const checkValue = (value: any): void => {
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            throw new BadRequestException(
              'Input contains potentially malicious content'
            );
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        for (const key in value) {
          checkValue(value[key]);
        }
      }
    };

    checkValue(obj);
  }
}