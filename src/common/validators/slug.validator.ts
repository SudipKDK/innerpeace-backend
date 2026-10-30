import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsSlug(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSlug',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          // Slug should be lowercase, contain only letters, numbers, hyphens
          // Should not start or end with hyphens, no consecutive hyphens
          const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

          return slugRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid slug (lowercase letters, numbers, and hyphens only, no consecutive hyphens, cannot start or end with hyphens)`;
        },
      },
    });
  };
}