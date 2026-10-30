import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAnonymousMessageDto {
    @ApiProperty({
        example: 'Your website is beautiful! Keep up the great work.',
        description: 'The anonymous message content',
    })
    @IsString()
    @IsNotEmpty({ message: 'Message cannot be empty' })
    @MaxLength(2000, { message: 'Message is too long (max 2000 characters)' })
    message: string;
}
