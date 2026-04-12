import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { IdeaEntity } from './idea.entity';
import { NoteEntity } from './note.entity';

@Index('idx_unique_note_idea', ['noteId', 'ideaId'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
@Entity('note_idea')
export class NoteIdeaEntity extends AbstractEntity {
  @ManyToOne(() => NoteEntity, (note) => note.ideas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'note_id',
    referencedColumnName: 'id',
  })
  note: NoteEntity;

  @Index('idx_note_idea_note')
  @Column({
    type: 'uuid',
    name: 'note_id',
  })
  noteId: string;

  @ManyToOne(() => IdeaEntity, (idea) => idea.notes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'idea_id',
    referencedColumnName: 'id',
  })
  idea: IdeaEntity;

  @Index('idx_note_idea_idea')
  @Column({
    type: 'uuid',
    name: 'idea_id',
  })
  ideaId: string;

  @Column({
    type: 'boolean',
    name: 'is_manual',
  })
  isManual: boolean;
}
