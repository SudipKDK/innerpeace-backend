  import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
  } from 'class-validator';

  export function IsSanitizedHtml(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'isSanitizedHtml',
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: {
          validate(value: any, args: ValidationArguments) {
            if (typeof value !== 'string') return false;

            // Check for potentially dangerous HTML/script tags
            const dangerousPatterns = [
              /<script[^>]*>.*?<\/script>/gi,
              /<iframe[^>]*>.*?<\/iframe>/gi,
              /javascript:/gi,
              /on\w+\s*=/gi,
              /<object[^>]*>.*?<\/object>/gi,
              /<embed[^>]*>.*?<\/embed>/gi,
            ];

            return !dangerousPatterns.some(pattern => pattern.test(value));
          },
          defaultMessage(args: ValidationArguments) {
            return `${args.property} contains potentially dangerous HTML content`;
          },
        },
      });
    };
  }