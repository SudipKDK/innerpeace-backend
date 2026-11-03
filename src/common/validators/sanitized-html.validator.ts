import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import sanitizeHtml from 'sanitize-html';

export function IsSanitizedHtml(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSanitizedHtml',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          const clean = sanitizeHtml(value, {
            allowedTags: [
              'p',
              'br',
              'strong',
              'em',
              'ul',
              'ol',
              'li',
              'a',
              'img',
              'blockquote',
              'code',
              'pre',
              'h1',
              'h2',
              'h3',
            ],
            allowedAttributes: {
              a: ['href', 'title'],
              img: ['src', 'alt', 'title'],
            },
            allowedSchemes: ['http', 'https', 'mailto'],
          });

          return value === clean;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} contains potentially dangerous HTML content`;
        },
      },
    });
  };
}
