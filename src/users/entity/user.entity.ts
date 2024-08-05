import { Exclude } from 'class-transformer';
import { Role } from 'src/auth/enums/role.enum';
import { Post } from 'src/post/entity/post.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Exclude()
  @Column({ default: Role.User })
  role: Role;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}
