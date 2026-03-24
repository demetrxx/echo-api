import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { NoteEntity } from './note.entity';
import { ThemeEntity } from './theme.entity';

@Index('idx_unique_note_theme', ['noteId', 'themeId'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
@Entity('note_theme')
export class NoteThemeEntity extends AbstractEntity {
  @ManyToOne(() => NoteEntity, (note) => note.themes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'note_id',
    referencedColumnName: 'id',
  })
  note: NoteEntity;

  @Index('idx_note_theme_note')
  @Column({
    type: 'uuid',
    name: 'note_id',
  })
  noteId: string;

  @ManyToOne(() => ThemeEntity, (theme) => theme.notes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'theme_id',
    referencedColumnName: 'id',
  })
  theme: ThemeEntity;

  @Index('idx_note_theme_theme')
  @Column({
    type: 'uuid',
    name: 'theme_id',
  })
  themeId: string;

  @Column({
    type: 'boolean',
    name: 'is_manual',
  })
  isManual: boolean;
}
