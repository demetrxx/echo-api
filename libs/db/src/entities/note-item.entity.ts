import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { FileEntity } from './file.entity';
import { NoteEntity } from './note.entity';

export enum NoteItemType {
  Text = 'text',
  File = 'file',
  Link = 'link',
  Image = 'image',
  Voice = 'voice',
}

export enum NoteItemStatus {
  Pending = 'pending',
  Processed = 'processed',
  Failed = 'failed',
}

@Entity('note_item')
export class NoteItemEntity extends AbstractEntity {
  @ManyToOne(() => NoteEntity, (note) => note.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'note_id',
    referencedColumnName: 'id',
  })
  note: NoteEntity;

  @Index('idx_note_item_note')
  @Column({
    type: 'uuid',
    name: 'note_id',
  })
  noteId: string;

  @Column({
    type: 'enum',
    enum: NoteItemStatus,
    name: 'status',
    default: NoteItemStatus.Pending,
  })
  status: NoteItemStatus;

  @Column({
    type: 'enum',
    enum: NoteItemType,
    name: 'type',
  })
  type: NoteItemType;

  @Column({
    type: 'text',
    name: 'value',
    nullable: true,
  })
  value: string | null;

  @ManyToOne(() => FileEntity, {
    nullable: true,
  })
  @JoinColumn({
    name: 'file_id',
    referencedColumnName: 'id',
  })
  file: FileEntity | null;

  @Index('idx_note_item_file')
  @Column({
    type: 'uuid',
    name: 'file_id',
    nullable: true,
  })
  fileId: string | null;

  @Column({
    type: 'jsonb',
    name: 'meta',
    nullable: true,
  })
  meta?: {
    duration?: number;
  };
}
