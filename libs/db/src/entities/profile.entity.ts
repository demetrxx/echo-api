import { PlatformType, PostEntity } from '@app/db/entities/post.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { sha256 } from '@/common/utils';

import { AbstractEntity } from '../common/base.entity';
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
    type: 'text',
    nullable: true,
  })
  prompt: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    default: [],
  })
  tov: string[];

  @Column({
    type: 'jsonb',
    default: [],
  })
  examples: string[];

  @Column({
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  isDefaultFor: PlatformType[];

  @OneToMany(() => PostEntity, (post) => post.profile)
  posts: PostEntity[];

  static hash(profile: ProfileEntity): string {
    return sha256(
      JSON.stringify({
        prompt: profile.prompt,
        tov: profile.tov,
        examples: profile.examples,
      }),
    );
  }
}
