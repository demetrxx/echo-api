import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { IdeaEntity } from './idea.entity';
import { PostEntity } from './post.entity';
import { StrategyEntity } from './strategy.entity';
import { UserEntity } from './user.entity';
import { VoiceEntity } from './voice.entity';

export enum CreditPaymentType {
  Strategy = 'strategy',
  Idea = 'idea',
  Post = 'post',
  Voice = 'voice',
}

@Entity('credit_payment')
export class CreditPaymentEntity extends AbstractEntity {
  @Column({
    enum: CreditPaymentType,
    name: 'type',
    enumName: 'credit_payment_type',
  })
  type: CreditPaymentType;

  @Column({
    type: 'integer',
    name: 'amount',
  })
  amount: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Index('idx_credit_payment_user')
  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId: string;

  @Column({
    type: 'boolean',
    name: 'is_refunded',
    default: false,
  })
  isRefunded: boolean;

  @ManyToOne(() => StrategyEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'strategy_id',
    referencedColumnName: 'id',
  })
  strategy: StrategyEntity | null;

  @Index('idx_credit_payment_strategy')
  @Column({
    type: 'uuid',
    name: 'strategy_id',
    nullable: true,
  })
  strategyId: string | null;

  @ManyToOne(() => IdeaEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'idea_id',
    referencedColumnName: 'id',
  })
  idea: IdeaEntity | null;

  @Index('idx_credit_payment_idea')
  @Column({
    type: 'uuid',
    name: 'idea_id',
    nullable: true,
  })
  ideaId: string | null;

  @ManyToOne(() => PostEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'post_id',
    referencedColumnName: 'id',
  })
  post: PostEntity | null;

  @Index('idx_credit_payment_post')
  @Column({
    type: 'uuid',
    name: 'post_id',
    nullable: true,
  })
  postId: string | null;

  @ManyToOne(() => VoiceEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'voice_id',
    referencedColumnName: 'id',
  })
  voice: VoiceEntity | null;

  @Index('idx_credit_payment_voice')
  @Column({
    type: 'uuid',
    name: 'voice_id',
    nullable: true,
  })
  voiceId: string | null;
}
