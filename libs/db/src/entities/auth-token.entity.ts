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

export enum AuthTokenType {
  EmailConfirm = 'email_confirm',
  PasswordReset = 'password_reset',
}

@Index('idx_auth_token_user', ['userId'])
@Index('idx_auth_token_type', ['type'])
@Index('idx_auth_token_hash', ['tokenHash'], { unique: true })
@Entity('auth_token')
export class AuthTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity)
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
    type: 'enum',
    enum: AuthTokenType,
  })
  type: AuthTokenType;

  @Column({
    type: 'timestamp',
    name: 'expires_at',
  })
  expiresAt: Date;

  @Column({
    type: 'timestamp',
    name: 'used_at',
    nullable: true,
  })
  usedAt: Date | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
