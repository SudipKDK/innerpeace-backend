import { Module } from '@nestjs/common';
import { CommentsService } from './service/comments.service';
import { PostCommentsController } from './controller/comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entity/comment.entity';
import { Post } from 'src/posts/entities/post.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Comment,Post])],
  controllers: [PostCommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
