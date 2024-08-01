import { Exclude } from 'class-transformer';
import { Role } from 'src/enums/role.enum';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Exclude()
  @Column({ default: Role.User })
  role: Role;
}
