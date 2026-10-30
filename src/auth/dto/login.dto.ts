import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  email: string;

  @ApiProperty({
    example: 'MySecureP@ss123!',
    description: 'User password'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  password: string;
}
