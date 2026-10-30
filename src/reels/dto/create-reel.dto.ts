import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReelDto {
    @ApiPropertyOptional({ maxLength: 140 })
    @IsOptional()
    @IsString()
    @MaxLength(140)
    title?: string;

    @ApiProperty({ description: 'YouTube URL or video ID' })
    @IsString()
    @MaxLength(500)
    youtubeUrl: string;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    displayOrder?: number;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
