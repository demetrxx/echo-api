import { BaseMessageLike } from '@langchain/core/messages';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { StrategyEntity } from './strategy.entity';

export type StrategyConversationHistory = BaseMessageLike[];

@Entity('strategy_conversation')
export class StrategyConversationEntity extends AbstractEntity {
  @OneToOne(() => StrategyEntity, (strategy) => strategy.conversation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'strategy_id',
    referencedColumnName: 'id',
  })
  strategy: StrategyEntity;

  @Column({
    type: 'uuid',
    name: 'strategy_id',
  })
  strategyId: string;

  @Column({
    type: 'jsonb',
  })
  history: StrategyConversationHistory;
}
