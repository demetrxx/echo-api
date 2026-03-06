import { Column, Entity, OneToMany } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { PostEntity } from './post.entity';
import { ProfileEntity } from './profile.entity';
import { RefreshSessionEntity } from './refresh-session.entity';
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

  @OneToMany(() => ThemeEntity, (theme) => theme.user)
  themes: ThemeEntity[];

  @OneToMany(() => PostEntity, (post) => post.user)
  posts: PostEntity[];

  @OneToMany(() => ProfileEntity, (profile) => profile.user)
  profiles: ProfileEntity[];

  @OneToMany(() => RefreshSessionEntity, (session) => session.user)
  refreshSessions: RefreshSessionEntity[];
}
