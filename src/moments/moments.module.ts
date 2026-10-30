import { Module } from '@nestjs/common';
import { MomentsService } from './service/moments.service';
import { MomentsController } from './controller/moments.controller';
import { S3Module } from 'src/s3/s3.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Moments } from './entity/moments.entity';

@Module({
  imports:[S3Module,TypeOrmModule.forFeature([Moments])],
  controllers: [MomentsController],
  providers: [MomentsService],
})
export class MomentsModule {}
