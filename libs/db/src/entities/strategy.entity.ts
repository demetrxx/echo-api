import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { StrategySnapshot } from '../common/strategy';
import { ProfileEntity } from './profile.entity';
import { StrategyConversationEntity } from './strategy-conversation.entity';
import { StrategyThemeEntity } from './strategy-theme.entity';
import { UserEntity } from './user.entity';

export enum StrategyStatus {
  Draft = 'draft',
  Active = 'active',
  Archived = 'archived',
}

export enum StrategyCompletenessLevel {
  Minimal = 'minimal',
  Refined = 'refined',
  Advanced = 'advanced',
}

export enum StrategyStage {
  Diagnose = 'diagnose',
  Context = 'context',
  Direction = 'direction',
  Themes = 'themes',
  Voice = 'voice',
  Sharpen = 'sharpen',
  FreeRefine = 'free_refine',
}

@Entity('strategy')
export class StrategyEntity extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name?: string;

  @Column({
    type: 'enum',
    enum: StrategyStage,
    default: StrategyStage.Diagnose,
  })
  stage: StrategyStage;

  @Column({
    type: 'enum',
    enum: StrategyStatus,
    default: StrategyStatus.Draft,
  })
  status: StrategyStatus;

  @Column({
    type: 'enum',
    enum: StrategyCompletenessLevel,
    default: StrategyCompletenessLevel.Minimal,
  })
  completenessLevel: StrategyCompletenessLevel;

  @Column({
    type: 'jsonb',
  })
  snapshot: StrategySnapshot;

  @ManyToOne(() => UserEntity, (user) => user.strategies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Index('idx_strategy_user')
  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  userId: string;

  @ManyToOne(() => ProfileEntity, (profile) => profile.strategies, {
    nullable: true,
  })
  @JoinColumn({
    name: 'profile_id',
    referencedColumnName: 'id',
  })
  profile?: ProfileEntity;

  @Index('idx_strategy_profile')
  @Column({
    type: 'uuid',
    name: 'profile_id',
    nullable: true,
  })
  profileId?: string;

  @OneToMany(
    () => StrategyThemeEntity,
    (strategyTheme) => strategyTheme.strategy,
  )
  themes: StrategyThemeEntity[];

  @OneToOne(
    () => StrategyConversationEntity,
    (conversation) => conversation.strategy,
  )
  conversation: StrategyConversationEntity;
}
