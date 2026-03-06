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
import { PostVersionEntity } from './post-version.entity';
import { ProfileEntity } from './profile.entity';
import { ThemeEntity } from './theme.entity';
import { UserEntity } from './user.entity';

export enum PlatformType {
  Telegram = 'telegram',
  X = 'x',
  LinkedIn = 'linkedin',
  Instagram = 'instagram',
}

export enum PostStatus {
  Generating = 'generating',
  Failed = 'failed',
  Draft = 'draft',
  Final = 'final',
  Archived = 'archived',
}

export enum PostType {
  Summary = 'summary',
  Opinion = 'opinion',
  Howto = 'howto',
  News = 'news',
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

  @ManyToOne(() => ThemeEntity, (theme) => theme.posts)
  @JoinColumn({
    name: 'theme_id',
    referencedColumnName: 'id',
  })
  theme: ThemeEntity;

  @Index('idx_post_theme')
  @Column({
    type: 'uuid',
    name: 'theme_id',
  })
  themeId: string;

  @Index('idx_post_angle')
  @Column({
    type: 'uuid',
    name: 'angle_id',
    nullable: true,
  })
  angleId: string | null;

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

  @Index('idx_post_type')
  @Column({
    type: 'enum',
    enum: PostType,
    name: 'post_type',
  })
  postType: PostType;

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

  @Column({
    type: 'uuid',
    name: 'generation_id',
    nullable: true,
  })
  generationId: string | null;
}
