import { PostEntity } from '@app/db/entities/post.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { StrategyEntity } from './strategy.entity';
import { UserEntity } from './user.entity';

@Entity('profile')
export class ProfileEntity extends AbstractEntity {
  @ManyToOne(() => UserEntity, (user) => user.profiles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Index('idx_profile_user')
  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  userId: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'jsonb',
  })
  rules: string[];

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  avoidRules: string[];

  @Column({
    type: 'jsonb',
    nullable: true,
    default: [],
  })
  tov: string[];

  @Column({
    type: 'text',
    nullable: true,
  })
  examplesSummary: string;

  @Column({
    type: 'jsonb',
    default: [],
  })
  examples: string[];

  @OneToMany(() => PostEntity, (post) => post.profile)
  posts: PostEntity[];

  @OneToMany(() => StrategyEntity, (strategy) => strategy.profile)
  strategies: StrategyEntity[];
}
