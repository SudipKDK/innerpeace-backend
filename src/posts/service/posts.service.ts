import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/service/users.service';
import { PaginationQueryDto } from 'src/common/dto/paginationQuery.dto';
import { Post } from '../entities/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { S3Service } from 'src/s3/service/s3.service';
import { slugify } from 'src/common/utils/slugify';
import { PostStatus } from 'src/common/enum/post-status.enum';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly userService: UsersService,
    private readonly s3Service: S3Service
  ) { }

  private async generateUniqueSlugFromTitle(title: string): Promise<string> {
    const base = (slugify(title) || 'post').slice(0, 150);
    let slug = base;
    let i = 2;

    while (await this.postRepository.exists({ where: { slug } })) {
      const suffix = `-${i}`;
      slug = `${base.slice(0, 150 - suffix.length)}${suffix}`;
      i++;
    }

    return slug;
  }
  
  async createPost(createPostDto: CreatePostDto, image: Express.Multer.File, authorId: number) {
    const user = await this.userService.getUserById(authorId);
    const slug = await this.generateUniqueSlugFromTitle(createPostDto.title);
    let imageKey: string | null = null;
    if (image) {
      imageKey = await this.s3Service.uploadPublicFile(image, 'posts/images');
    }
    const publishedAt =
      createPostDto.status === PostStatus.PUBLISHED
        ? new Date()
        : null;

    const post = this.postRepository.create({
      ...createPostDto,
      image: imageKey,
      publishedAt,
      slug,
      user,
    });

    const createPost = await this.postRepository.save(post);


    return {
      ...createPost,
      image: this.s3Service.fileUrl(createPost.image),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async findOneBySlug(slug: string) {
    const post = await this.postRepository.findOne({
      where: { slug },
      relations: { user: true },
    });

    if (!post) throw new NotFoundException('Post not found');
    return this.withImageUrl(post);
  }



  async findAllPosts(paginationQueryDto: PaginationQueryDto) {
    const page = Math.max(1, Number(paginationQueryDto.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(paginationQueryDto.limit) || 10));

    const posts = await this.postRepository.find({
      relations: { user: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    return posts.map((post) => this.withImageUrl(post));
  }
  async findOneById(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!post) throw new NotFoundException('post not found');
    return this.withImageUrl(post);
  }

  async updatePost(
    id: number,
    updatePostDto: UpdatePostDto,
    image: Express.Multer.File,
    userId: number,
  ) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!post) throw new NotFoundException('post not found');
    if (post.user.id !== userId) {
      throw new ForbiddenException('Only the author can update this post');
    }

    let imageKey = post.image;
    if (image) {
      imageKey = await this.s3Service.uploadPublicFile(image, 'posts/images');
      await this.s3Service.deletePublicFile(post.image);
    }

    const prevStatus = post.status;
    const nextStatus = updatePostDto.status ?? prevStatus;

    let publishedAt = post.publishedAt;

    if (nextStatus === PostStatus.PUBLISHED && !publishedAt) {
      publishedAt = new Date();
    }

    const updated = this.postRepository.merge(post, {
      ...updatePostDto,
      image: imageKey,
      publishedAt,
    });

    const saved = await this.postRepository.save(updated);
    return this.withImageUrl(saved);
  }

  async removePost(id: number, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!post) throw new NotFoundException('post not found');

    if (post.user.id !== userId) {
      throw new ForbiddenException('Only the author can delete this post');
    }

    await this.s3Service.deletePublicFile(post.image);
    await this.postRepository.remove(post);
    return { message: 'Deleted' };
  }

  private withImageUrl(post: Post): Post {
    return {
      ...post,
      image: this.s3Service.fileUrl(post.image),
    };
  }
}
