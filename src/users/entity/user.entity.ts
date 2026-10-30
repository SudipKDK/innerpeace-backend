import { Role } from "src/common/enum/role.enum";
import { Post } from "src/posts/entities/post.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 30, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 128, select: false })
    password: string;

    @Column({
      type: 'enum',
      enum: Role,
      default: Role.READER,
      enumName: 'user_role_enum'
    })
    role: Role;


    @OneToMany(() => Post, (post) => post.user, { onDelete: 'CASCADE' })
    posts: Post[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
