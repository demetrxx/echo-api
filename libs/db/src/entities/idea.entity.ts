import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { NoteIdeaEntity } from './note-idea.entity';
import { PostEntity } from './post.entity';
import { ProfileEntity } from './profile.entity';
import { StrategyEntity } from './strategy.entity';
import { ThemeEntity } from './theme.entity';
import { UserEntity } from './user.entity';

export enum IdeaStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
}

@Entity('idea')
export class IdeaEntity extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  angle?: string;

  // relations
  @ManyToOne(() => StrategyEntity, (strategy) => strategy.ideas, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({
    name: 'strategy_id',
    referencedColumnName: 'id',
  })
  strategy: StrategyEntity;

  @Index('idx_note_strategy')
  @Column({
    type: 'uuid',
    name: 'strategy_id',
    nullable: true,
  })
  strategyId: string;

  @ManyToOne(() => ThemeEntity, (theme) => theme.ideas, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({
    name: 'theme_id',
    referencedColumnName: 'id',
  })
  theme: ThemeEntity;

  @Index('idx_idea_theme')
  @Column({
    type: 'uuid',
    name: 'theme_id',
    nullable: true,
  })
  themeId: string;

  @ManyToOne(() => ProfileEntity, (profile) => profile.ideas, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({
    name: 'profile_id',
    referencedColumnName: 'id',
  })
  profile?: ProfileEntity;

  @Index('idx_idea_profile')
  @Column({
    type: 'uuid',
    name: 'profile_id',
    nullable: true,
  })
  profileId?: string;

  @ManyToOne(() => UserEntity, (user) => user.ideas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Index('idx_idea_user')
  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  userId: string;

  @OneToMany(() => NoteIdeaEntity, (noteIdea) => noteIdea.idea)
  notes: NoteIdeaEntity[];

  @OneToMany(() => PostEntity, (post) => post.idea)
  posts: PostEntity[];
}
