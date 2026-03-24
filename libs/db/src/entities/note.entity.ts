import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { NoteItemEntity } from './note-item.entity';
import { NoteThemeEntity } from './note-theme.entity';
import { UserEntity } from './user.entity';

@Entity('note')
export class NoteEntity extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name: string | null;

  @OneToMany(() => NoteItemEntity, (noteItem) => noteItem.note)
  items: NoteItemEntity[];

  @ManyToOne(() => UserEntity, (user) => user.notes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Index('idx_note_user')
  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  userId: string;

  @Column({
    type: 'text',
    default: '',
  })
  text: string;

  @Column({
    type: 'boolean',
    name: 'should_suggest_themes',
    default: true,
  })
  shouldSuggestThemes: boolean;

  @OneToMany(() => NoteThemeEntity, (noteTheme) => noteTheme.note)
  themes: NoteThemeEntity[];
}
