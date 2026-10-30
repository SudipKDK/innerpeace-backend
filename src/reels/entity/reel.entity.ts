import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'reels' })
export class Reel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 140, nullable: true })
    title: string | null;

    @Column({ length: 500 })
    youtubeUrl: string;

    @Column({ type: 'int', default: 0 })
    displayOrder: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
