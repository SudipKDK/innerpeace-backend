import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CompleteDto {
  @Type(() => Number)
  @IsInt()
  momentId: number;
}
