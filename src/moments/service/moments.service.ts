import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3Service } from 'src/s3/service/s3.service';
import { Moments } from '../entity/moments.entity';
import { randomUUID } from 'crypto';
import { MomentVideoStatus } from 'src/common/enum/moment-status.enum';
import { Repository } from 'typeorm';

@Injectable()
export class MomentsService {

    constructor(
        private readonly s3Service: S3Service,
        @InjectRepository(Moments)
        private readonly momentsRepo: Repository<Moments>
    ) {
    }

    async createPresignedUpload(mimeType: string, ext?: string) {
        const safeExt = (ext || mimeType.split('/')[1] || 'mp4').toLowerCase();
        const key = `moments/raw/${randomUUID()}.${safeExt}`;

        const vid = this.momentsRepo.create({
            rawKey: key,
            mimeType,
            status: MomentVideoStatus.PENDING,
        });

        const record = await this.momentsRepo.save(vid);
        const uploadUrl = await this.s3Service.presignPutObject(key, mimeType);
        return { momentId: record.id, key, uploadUrl };
    }
    async markUploaded(momentId: number) {
        const video = await this.momentsRepo.findOneBy({ id: momentId });
        if (!video) throw new NotFoundException('Moment video not found');

        video.status = MomentVideoStatus.UPLOADED;
        await this.momentsRepo.save(video);
        return { success: true };
    }

    async getPlayUrl(momentId: number) {
        const video = await this.momentsRepo.findOneBy({ id: momentId });
        if (!video) throw new NotFoundException('Moment video not found');

        const url = await this.s3Service.presignGetObject(video.rawKey, 60 * 10);
        return { url };
    }

    async listMoments(status?: MomentVideoStatus) {
        const where = status ? { status } : undefined;
        return this.momentsRepo.find({
            where,
            order: { createdAt: 'DESC' },
        });
    }

}
