import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class RegisterUserDto{

    @ApiProperty({
      example: 'sudeep',
      description: 'Unique username (3-30 characters, alphanumeric and underscores only)'
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    @MaxLength(30, { message: 'Username cannot exceed 30 characters' })
    @Matches(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores'
    })
    username: string;

    @ApiProperty({
      example: 'user@example.com',
      description: 'Valid email address'
    })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty()
    @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
    email: string;

    @ApiProperty({
      example: 'MySecureP@ss123!',
      description: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
    @Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }
    )
    password: string;

}
