import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { S3Module } from 'src/s3/s3.module';
import { PostsController } from './controller/posts.controller';
import { Post } from './entities/post.entity';
import { PostsService } from './service/posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
    S3Module,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
