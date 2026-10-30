import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Comment } from '../entity/comment.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { Post } from 'src/posts/entities/post.entity';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
        @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    ) { }

    async createForPost(postId: number, dto: CreateCommentDto, ipAddress?: string) {
        const post = await this.postRepo.findOne({ where: { id: postId } });
        if (!post) throw new NotFoundException('Post not found');

        const comment = this.commentRepo.create({
            comment: dto.comment,
            ipAddress: ipAddress ?? null,
            postId,
            post,
        });

        return this.commentRepo.save(comment);
    }

    async listForPost(postId: number, page = 1, limit = 20) {
        const safeLimit = Math.min(Math.max(limit, 1), 50);
        const safePage = Math.max(page, 1);

        const [data, total] = await this.commentRepo.findAndCount({
            where: { postId },
            order: { commentedAt: 'DESC' },
            take: safeLimit,
            skip: (safePage - 1) * safeLimit,
            select: {
                id: true,
                comment: true,
                commentedAt: true,
            },
        });

        return {
            data,
            meta: {
                page: safePage,
                limit: safeLimit,
                total,
                totalPages: Math.ceil(total / safeLimit),
            },
        };
    }

    async deleteComment(id: number) {
        const comment = await this.commentRepo.findOne({ where: { id } });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        await this.commentRepo.delete(id);
        return { deleted: true };
    }
}
