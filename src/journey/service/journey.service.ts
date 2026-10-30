import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Journey } from "../entity/journey.entity";
import { CreateJourneyDto } from "../dto/create-journey.dto";
import { UpdateJourneyDto } from "../dto/update-journey.dto";
import { S3Service } from "src/s3/service/s3.service";
import { JourneyStatus } from "src/common/enum/journey-status.enum";

@Injectable()
export class JourneyService {
  constructor(
    @InjectRepository(Journey)
    private readonly journeyRepo: Repository<Journey>,
    private readonly s3Service: S3Service,
  ) {}
  private withImageUrl(journey: Journey) {
    return {
      ...journey,
      image: journey.image ? this.s3Service.fileUrl(journey.image) : null,
    };
  }

  async createJourney(dto: CreateJourneyDto, image?: Express.Multer.File) {
    let imageKey: string | null = null;

    if (image) {
      imageKey = await this.s3Service.uploadPublicFile(image, "journey/images");
    }

    const journey = this.journeyRepo.create({
      ...dto,
      image: imageKey,
    });

    const saved = await this.journeyRepo.save(journey);
    return this.withImageUrl(saved);
  }

  
  async getJourney() {
    const journeys = await this.journeyRepo.find({
      where: { status: JourneyStatus.PUBLISHED },
      order: { eventDate: "DESC" },
    });

    return journeys.map((j) => this.withImageUrl(j));
  }

  async getAllJourneyAdmin() {
    const journeys = await this.journeyRepo.find({
      order: { createdAt: "DESC" },
    });

    return journeys.map((j) => this.withImageUrl(j));
  }

  async getJourneyById(id: number) {
    const journey = await this.journeyRepo.findOne({ where: { id } });
    if (!journey) throw new NotFoundException("journey with given id not found");
    return this.withImageUrl(journey);
  }

  async updateJourney(
    id: number,
    dto: UpdateJourneyDto,
    image?: Express.Multer.File,
  ) {
    const journey = await this.journeyRepo.findOne({ where: { id } });
    if (!journey) throw new NotFoundException("journey with given id not found");

    let imageKey = journey.image;

    if (image) {
      const newKey = await this.s3Service.uploadPublicFile(image, "journey/images");
      if (journey.image) {
        await this.s3Service.deletePublicFile(journey.image);
      }
      imageKey = newKey;
    }

    const updatedEntity = this.journeyRepo.merge(journey, {
      ...dto,
      image: imageKey,
    });

    const saved = await this.journeyRepo.save(updatedEntity);
    return this.withImageUrl(saved);
  }

  async removeJourney(id: number) {
    const journey = await this.journeyRepo.findOne({ where: { id } });
    if (!journey) throw new NotFoundException("journey not found");

    if (journey.image) {
      await this.s3Service.deletePublicFile(journey.image);
    }

    await this.journeyRepo.remove(journey);
    return { message: "Deleted" };
  }
}
