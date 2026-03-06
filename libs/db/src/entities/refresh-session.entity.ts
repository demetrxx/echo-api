import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserEntity } from './user.entity';

@Index('idx_refresh_session_user', ['userId'])
@Index('idx_refresh_session_expires', ['expiresAt'])
@Index('idx_refresh_session_token_hash', ['tokenHash'], { unique: true })
@Entity('refresh_session')
export class RefreshSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.refreshSessions, {
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
    name: 'token_hash',
  })
  tokenHash: string;

  @Column({
    type: 'timestamp',
    name: 'expires_at',
  })
  expiresAt: Date;

  @Column({
    type: 'timestamp',
    name: 'revoked_at',
    nullable: true,
  })
  revokedAt: Date | null;

  @Column({
    type: 'uuid',
    name: 'replaced_by_id',
    nullable: true,
  })
  replacedById: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'user_agent',
    nullable: true,
  })
  userAgent: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'ip',
    nullable: true,
  })
  ip: string | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
