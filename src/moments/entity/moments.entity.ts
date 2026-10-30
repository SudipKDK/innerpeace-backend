import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { MomentVideoStatus } from 'src/common/enum/moment-status.enum';

@Entity()
export class Moments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: MomentVideoStatus, default: MomentVideoStatus.PENDING })
  status: MomentVideoStatus;

  @Column()
  rawKey: string;

  @Column()
  mimeType: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
