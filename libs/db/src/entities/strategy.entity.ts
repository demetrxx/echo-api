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
import { IdeaEntity } from './idea.entity';
import { PostEntity } from './post.entity';
import { StrategyConversationEntity } from './strategy-conversation.entity';
import { StrategyThemeEntity } from './strategy-theme.entity';
import { UserEntity } from './user.entity';
import { VoiceEntity } from './voice.entity';

export enum StrategyStatus {
  Draft = 'draft',
  Active = 'active',
  Archived = 'archived',
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

  @ManyToOne(() => VoiceEntity, (voice) => voice.strategies, {
    nullable: true,
  })
  @JoinColumn({
    name: 'voice_id',
    referencedColumnName: 'id',
  })
  voice?: VoiceEntity;

  @Index('idx_strategy_voice')
  @Column({
    type: 'uuid',
    name: 'voice_id',
    nullable: true,
  })
  voiceId?: string;

  @OneToMany(
    () => StrategyThemeEntity,
    (strategyTheme) => strategyTheme.strategy,
  )
  themes: StrategyThemeEntity[];

  @OneToMany(() => IdeaEntity, (idea) => idea.strategy)
  ideas: IdeaEntity[];

  @OneToMany(() => PostEntity, (post) => post.strategy)
  posts: PostEntity[];

  @OneToOne(
    () => StrategyConversationEntity,
    (conversation) => conversation.strategy,
  )
  conversation: StrategyConversationEntity;
}
