import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { UserEntity } from './user.entity';

@Entity('tg_user')
export class TgUserEntity extends AbstractEntity {
  @OneToOne(() => UserEntity, (user) => user.tgUser, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  userId: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'telegram_username',
    nullable: true,
    unique: true,
  })
  username: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'telegram_id',
    nullable: true,
    unique: true,
  })
  telegramId: string | null;

  @Column({
    type: 'uuid',
    name: 'active_note_id',
    nullable: true,
  })
  activeNoteId: string | null;

  @Column({
    type: 'timestamp',
    name: 'last_activity_at',
    nullable: true,
  })
  lastActivityAt: Date | null;
}
