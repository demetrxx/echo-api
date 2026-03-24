import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { NoteThemeEntity } from './note-theme.entity';
import { PostEntity } from './post.entity';
import { StrategyThemeEntity } from './strategy-theme.entity';
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
    type: 'varchar',
    length: 255,
    name: 'clean_name',
    comment:
      'System-generated clean name for the theme (lowercase, no spaces, special characters)',
  })
  cleanName: string;

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

  @OneToMany(() => NoteThemeEntity, (noteTheme) => noteTheme.theme)
  notes: NoteThemeEntity[];

  @OneToMany(() => StrategyThemeEntity, (strategyTheme) => strategyTheme.theme)
  strategies: StrategyThemeEntity[];
}
