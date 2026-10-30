import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reel } from '../entity/reel.entity';
import { CreateReelDto } from '../dto/create-reel.dto';
import { UpdateReelDto } from '../dto/update-reel.dto';

@Injectable()
export class ReelsService {
    constructor(
        @InjectRepository(Reel)
        private readonly reelRepository: Repository<Reel>,
    ) { }

    // Public: Get only active reels, ordered by displayOrder
    async findAll(): Promise<Reel[]> {
        return this.reelRepository.find({
            where: { isActive: true },
            order: { displayOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    // Admin: Get all reels
    async findAllAdmin(): Promise<Reel[]> {
        return this.reelRepository.find({
            order: { displayOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Reel> {
        const reel = await this.reelRepository.findOne({ where: { id } });
        if (!reel) {
            throw new NotFoundException(`Reel with ID ${id} not found`);
        }
        return reel;
    }

    async create(dto: CreateReelDto): Promise<Reel> {
        const reel = this.reelRepository.create({
            title: dto.title ?? null,
            youtubeUrl: dto.youtubeUrl,
            displayOrder: dto.displayOrder ?? 0,
            isActive: dto.isActive ?? true,
        });
        return this.reelRepository.save(reel);
    }

    async update(id: number, dto: UpdateReelDto): Promise<Reel> {
        const reel = await this.findOne(id);
        Object.assign(reel, dto);
        return this.reelRepository.save(reel);
    }

    async remove(id: number): Promise<void> {
        const reel = await this.findOne(id);
        await this.reelRepository.remove(reel);
    }
}
