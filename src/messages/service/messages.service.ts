import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnonymousMessage } from '../entity/anonymous-message.entity';
import { CreateAnonymousMessageDto } from '../dto/create-anonymous-message.dto';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(AnonymousMessage)
        private readonly messageRepository: Repository<AnonymousMessage>,
    ) { }

    async createMessage(
        dto: CreateAnonymousMessageDto,
        ipAddress?: string,
    ): Promise<AnonymousMessage> {
        const message = this.messageRepository.create({
            message: dto.message,
            ipAddress: ipAddress || null,
            isRead: false,
        });

        return await this.messageRepository.save(message);
    }

    async findAll(): Promise<AnonymousMessage[]> {
        return await this.messageRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async markAsRead(id: number): Promise<void> {
        await this.messageRepository.update(id, { isRead: true });
    }

    async getUnreadCount(): Promise<number> {
        return await this.messageRepository.count({
            where: { isRead: false },
        });
    }

    async deleteMessage(id: number): Promise<void> {
        await this.messageRepository.delete(id);
    }
}
