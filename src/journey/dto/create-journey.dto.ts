import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { JourneyStatus } from "src/common/enum/journey-status.enum";

export class CreateJourneyDto {
  @IsString()
  @MaxLength(140)
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  eventDate: string;



  @IsOptional()
  @IsEnum(JourneyStatus)
  status?: JourneyStatus;
}
