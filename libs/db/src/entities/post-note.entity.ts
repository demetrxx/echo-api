import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { NoteEntity } from './note.entity';
import { PostEntity } from './post.entity';

@Index('idx_unique_post_note', ['postId', 'noteId'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
@Entity('post_note')
export class PostNoteEntity extends AbstractEntity {
  @ManyToOne(() => NoteEntity, (note) => note.posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'note_id',
    referencedColumnName: 'id',
  })
  note: NoteEntity;

  @Index('idx_post_note_note')
  @Column({
    type: 'uuid',
    name: 'note_id',
  })
  noteId: string;

  @ManyToOne(() => PostEntity, (post) => post.notes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'post_id',
    referencedColumnName: 'id',
  })
  post: PostEntity;

  @Index('idx_post_note_post')
  @Column({
    type: 'uuid',
    name: 'post_id',
  })
  postId: string;
}
