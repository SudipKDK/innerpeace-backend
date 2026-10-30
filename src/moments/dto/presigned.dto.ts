import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PresignDto {
  @ApiProperty({ example: 'video/mp4' })
  @IsString()
  mimeType: string;

  @ApiPropertyOptional({ example: 'mp4' })
  @IsOptional()
  @IsString()
  ext?: string;
}
