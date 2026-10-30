import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnonymousMessage } from './entity/anonymous-message.entity';
import { MessagesService } from './service/messages.service';
import { MessagesController } from './controller/messages.controller';

@Module({
    imports: [TypeOrmModule.forFeature([AnonymousMessage])],
    providers: [MessagesService],
    controllers: [MessagesController],
    exports: [MessagesService],
})
export class MessagesModule { }
