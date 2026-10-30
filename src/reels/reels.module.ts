import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reel } from './entity/reel.entity';
import { ReelsService } from './service/reels.service';
import { ReelsController } from './controller/reels.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Reel])],
    controllers: [ReelsController],
    providers: [ReelsService],
    exports: [ReelsService],
})
export class ReelsModule { }
