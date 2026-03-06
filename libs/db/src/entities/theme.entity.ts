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
import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

@Index('idx_unique_theme_name', ['name', 'userId'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
@Entity('theme')
export class ThemeEntity extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ManyToOne(() => UserEntity, (user) => user.themes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Index('idx_theme_user')
  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  userId: string;

  @OneToMany(() => PostEntity, (post) => post.theme)
  posts: PostEntity[];

  static hash(theme: ThemeEntity): string {
    return sha256(
      JSON.stringify({
        name: theme.name,
        description: theme.description,
      }),
    );
  }
}
