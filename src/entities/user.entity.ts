import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FoodEntity } from './food.entity';

export type TRole = 'ADMIN' | 'REGULAR';

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false, select: false })
  password: string;

  @Column({ nullable: false, default: 'REGULAR' })
  role: TRole;

  @Column({ nullable: false, default: 2100 })
  threshold: number;

  @OneToMany(() => FoodEntity, (food) => food.user)
  foods: FoodEntity[];
}
