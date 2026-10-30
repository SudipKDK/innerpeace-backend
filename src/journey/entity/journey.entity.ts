import { JourneyStatus } from '../../common/enum/journey-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'journey_entries' })
export class Journey {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 140 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Index()
  @Column({ type: 'date' })
  eventDate!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image!: string | null;

  @Column({
    type: 'enum',
    enum: JourneyStatus,
    default: JourneyStatus.PUBLISHED,
  })
  status!: JourneyStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
