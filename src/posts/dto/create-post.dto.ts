import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from "class-validator";
import { PostStatus } from "src/common/enum/post-status.enum";
import { Transform } from 'class-transformer';

export class CreatePostDto {
  @ApiProperty({
    example: 'My Amazing Blog Post Title',
    description: 'Post title (5-255 characters)',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiPropertyOptional({
    example: 'This is the content of my blog post. It can be quite long and contain various information...',
    description: 'Post content (optional, max 50,000 characters)'
  })
  @IsString()
  @IsOptional()
  @MaxLength(50000, { message: 'Content cannot exceed 50,000 characters' })
  content?: string;



  @ApiPropertyOptional({
    enum: PostStatus,
    example: PostStatus.DRAFT,
    description: 'Post status (defaults to draft)'
  })
  @IsEnum(PostStatus, { message: 'Status must be one of: draft, published, archived' })
  @IsOptional()
  status?: PostStatus;
}
