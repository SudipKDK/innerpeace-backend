import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'reset-token-value',
    description: 'Password reset token received via email'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'Token is too long' })
  token: string;

  @ApiProperty({
    example: 'NewSecureP@ss123!',
    description: 'New password must meet security requirements'
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
  newPassword: string;
}
