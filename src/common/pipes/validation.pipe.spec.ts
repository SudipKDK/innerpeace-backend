import { CustomValidationPipe } from './validation.pipe';
import { BadRequestException, ArgumentMetadata } from '@nestjs/common';

describe('CustomValidationPipe', () => {
  let pipe: CustomValidationPipe;

  beforeEach(() => {
    pipe = new CustomValidationPipe();
  });

  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: Object,
  };

  it('should pass harmless objects and sanitize HTML entities', async () => {
    const input = { title: 'Hello <b>World</b>', count: 123 };
    const result = await pipe.transform(input, metadata);

    expect(result.title).toBe('Hello &lt;b&gt;World&lt;/b&gt;');
    expect(result.count).toBe(123);
  });

  it('should throw BadRequestException for XSS script pattern', async () => {
    const malicious = { content: '<script>alert("hacked")</script>' };

    await expect(pipe.transform(malicious, metadata)).rejects.toThrow(
      BadRequestException,
    );
  });
});
