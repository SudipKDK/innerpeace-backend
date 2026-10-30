import { Module } from '@nestjs/common';
import { JourneyService } from './service/journey.service';
import { JourneyController } from './controller/journey.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Journey } from './entity/journey.entity';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports:[TypeOrmModule.forFeature([Journey]),S3Module],
  controllers: [JourneyController],
  providers: [JourneyService],
})
export class JourneyModule {}
