import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { PostEntity } from './post.entity';

export enum PostVersionType {
  Manual = 'manual',
  AI = 'ai',
}

@Entity('post_version')
export class PostVersionEntity extends AbstractEntity {
  @ManyToOne(() => PostEntity, (post) => post.versions)
  @JoinColumn({
    name: 'post_id',
    referencedColumnName: 'id',
  })
  post: PostEntity;

  @Index('idx_post_version_post')
  @Column({
    type: 'uuid',
    name: 'post_id',
  })
  postId: string;

  @Column({
    type: 'int',
    name: 'version_no',
  })
  versionNo: number;

  @Column({
    type: 'int',
    name: 'parent_version_no',
    nullable: true,
  })
  parentVersionNo: number;

  @Column({
    type: 'enum',
    enum: PostVersionType,
    name: 'type',
  })
  type: PostVersionType;

  @Column({
    type: 'text',
  })
  text: string;
}
