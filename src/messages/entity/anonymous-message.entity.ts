import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity('anonymous_messages')
export class AnonymousMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'varchar', length: 45, nullable: true })
    ipAddress: string | null;

    @Column({ type: 'boolean', default: false })
    isRead: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
}
