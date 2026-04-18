import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { IdeaEntity } from './idea.entity';
import { PostNoteEntity } from './post-note.entity';
import { PostVersionEntity } from './post-version.entity';
import { ProfileEntity } from './profile.entity';
import { ThemeEntity } from './theme.entity';
import { UserEntity } from './user.entity';

export enum PlatformType {
  Telegram = 'telegram',
  X = 'x',
  Threads = 'threads',
  LinkedIn = 'linkedin',
  Instagram = 'instagram',
  TikTok = 'tiktok',
  YouTube = 'youtube',
  Facebook = 'facebook',
  Newsletter = 'newsletter',
  Blog = 'blog',
  Substack = 'substack',
  Medium = 'medium',
  Reddit = 'reddit',
  Discord = 'discord',
  Custom = 'custom',
}

export enum PostStatus {
  Draft = 'draft',
  Final = 'final',
  Archived = 'archived',
}

@Entity('post')
export class PostEntity extends AbstractEntity {
  @ManyToOne(() => UserEntity, (user) => user.posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Index('idx_post_user')
  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  userId: string;

  @ManyToOne(() => IdeaEntity, (idea) => idea.posts, { nullable: true })
  @JoinColumn({
    name: 'idea_id',
    referencedColumnName: 'id',
  })
  idea?: IdeaEntity;

  @Index('idx_post_idea')
  @Column({
    type: 'uuid',
    name: 'idea_id',
    nullable: true,
  })
  ideaId?: string;

  @ManyToOne(() => ThemeEntity, (theme) => theme.posts, { nullable: true })
  @JoinColumn({
    name: 'theme_id',
    referencedColumnName: 'id',
  })
  theme?: ThemeEntity;

  @Index('idx_post_theme')
  @Column({
    type: 'uuid',
    name: 'theme_id',
    nullable: true,
  })
  themeId?: string;

  @ManyToOne(() => ProfileEntity, (profile) => profile.posts, {
    nullable: true,
  })
  @JoinColumn({
    name: 'profile_id',
    referencedColumnName: 'id',
  })
  profile: ProfileEntity;

  @Index('idx_post_profile')
  @Column({
    type: 'uuid',
    name: 'profile_id',
    nullable: true,
  })
  profileId: string | null;

  @Index('idx_post_status')
  @Column({
    type: 'enum',
    enum: PostStatus,
    name: 'status',
    default: PostStatus.Draft,
  })
  status: PostStatus;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  title: string | null;

  @Column({
    type: 'enum',
    enum: PlatformType,
  })
  platform: PlatformType;

  @OneToMany(() => PostVersionEntity, (postVersion) => postVersion.post)
  versions: PostVersionEntity[];

  @OneToOne(() => PostVersionEntity, (postVersion) => postVersion.post, {
    nullable: true,
  })
  @JoinColumn({
    name: 'final_version_id',
    referencedColumnName: 'id',
  })
  finalVersion: PostVersionEntity | null;

  @OneToOne(() => PostVersionEntity, (postVersion) => postVersion.post, {
    nullable: true,
  })
  @JoinColumn({
    name: 'current_version_id',
    referencedColumnName: 'id',
  })
  currentVersion: PostVersionEntity | null;

  @Column({
    type: 'uuid',
    name: 'current_version_id',
    nullable: true,
  })
  currentVersionId: string | null;

  @Column({
    type: 'uuid',
    name: 'final_version_id',
    nullable: true,
  })
  finalVersionId: string | null;

  @OneToMany(() => PostNoteEntity, (postNote) => postNote.post)
  notes: PostNoteEntity[];
}
