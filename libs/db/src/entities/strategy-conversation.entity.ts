import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { StrategyEntity } from './strategy.entity';

export interface BaseMessageLike {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
}

export interface ToolMessage extends BaseMessageLike {
  role: 'tool';
  name: string;
  tool_call_id: string;
}

interface AiMessage {
  role: 'assistant';
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  args: any;
  type: 'tool_call';
}

export interface HumanMessage {
  id: string;
  role: 'user';
  content: string;
}

export type ChatMessage = HumanMessage | AiMessage | ToolMessage;

export type StrategyConversationHistory = ChatMessage[];

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
