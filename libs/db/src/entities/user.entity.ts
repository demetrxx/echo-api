import { Column, Entity, OneToMany, OneToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { NoteEntity } from './note.entity';
import { PostEntity } from './post.entity';
import { ProfileEntity } from './profile.entity';
import { RefreshSessionEntity } from './refresh-session.entity';
import { StrategyEntity } from './strategy.entity';
import { TgUserEntity } from './tg-user.entity';
import { ThemeEntity } from './theme.entity';

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
}

@Entity('user')
export class UserEntity extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  firstName: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  lastName: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  languageCode: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'password_hash',
    nullable: true,
  })
  passwordHash: string | null;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.Active,
  })
  status: UserStatus;

  @Column({
    type: 'boolean',
    name: 'email_confirmed',
    default: false,
  })
  emailConfirmed: boolean;

  @Column({
    type: 'timestamp',
    name: 'email_confirmed_at',
    nullable: true,
  })
  emailConfirmedAt: Date | null;

  @Column({
    type: 'timestamp',
    name: 'last_activity_at',
    nullable: true,
  })
  lastActivityAt: Date | null;

  @OneToOne(() => TgUserEntity, (tgUser) => tgUser.user)
  tgUser: TgUserEntity;

  @OneToMany(() => ThemeEntity, (theme) => theme.user)
  themes: ThemeEntity[];

  @OneToMany(() => NoteEntity, (note) => note.user)
  notes: NoteEntity[];

  @OneToMany(() => PostEntity, (post) => post.user)
  posts: PostEntity[];

  @OneToMany(() => ProfileEntity, (profile) => profile.user)
  profiles: ProfileEntity[];

  @OneToMany(() => RefreshSessionEntity, (session) => session.user)
  refreshSessions: RefreshSessionEntity[];

  @OneToMany(() => StrategyEntity, (strategy) => strategy.user)
  strategies: StrategyEntity[];
}
