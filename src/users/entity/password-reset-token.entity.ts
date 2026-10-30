
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    Check,
    Unique,
} from 'typeorm';
import { User } from 'src/users/entity/user.entity';

@Entity('password_reset_tokens')
@Index(['user', 'expiresAt'])
@Check(`"expiresAt" > "createdAt"`)
export class PasswordResetToken {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @Index()
    user: User;

    @Column({ type: 'varchar', length: 128, unique: true })
    tokenHash: string;

    @Column({ type: 'timestamptz' })
    expiresAt: Date;

    @Column({ type: 'boolean', default: false })
    isUsed: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    usedAt: Date | null;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}
