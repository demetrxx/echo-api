import {
  StrategyConversationEntity,
  StrategyEntity,
  StrategySnapshot,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { PaginationSortingQuery } from '@/common/utils';

import { STRATEGY_SNAPSHOT_DEFAULT } from './consts';
import { StrategyAgent, StrategyAgentState } from './strategy.agent';

@Injectable()
export class StrategyService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly strategyAgent: StrategyAgent,
  ) {}

  async getMany(userId: string, query: PaginationSortingQuery) {
    const qb = this.dataSource
      .getRepository(StrategyEntity)
      .createQueryBuilder('strategy')
      .where('strategy.userId = :userId', { userId })
      .select([
        'strategy.id',
        'strategy.name',
        'strategy.createdAt',
        'strategy.updatedAt',
        'strategy.status',
        'strategy.completenessLevel',
      ])
      .orderBy(`strategy.${query.orderBy}`, query.order)
      .skip(query.skip)
      .take(query.take);

    const [total, strategies] = await Promise.all([
      qb.getCount(),
      qb.getMany(),
    ]);

    return {
      total,
      data: strategies,
      skip: query.skip,
      take: query.take,
    };
  }

  async getOne(id: string, userId: string) {
    const strategy = await this.dataSource
      .getRepository(StrategyEntity)
      .findOne({
        where: { id, userId },
        relations: ['conversation', 'themes'],
      });

    if (!strategy) {
      throw Err.notFound('Strategy not found');
    }

    return strategy;
  }

  async create(userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const strategyRepository = manager.getRepository(StrategyEntity);
      const conversationRepository = manager.getRepository(
        StrategyConversationEntity,
      );

      const strategy = await strategyRepository.save({
        userId,
        snapshot: STRATEGY_SNAPSHOT_DEFAULT,
      });

      await conversationRepository.save({
        strategyId: strategy.id,
        history: [],
      });

      return strategy;
    });
  }

  async updateOne(
    id: string,
    userId: string,
    dto: { name?: string; snapshot?: StrategySnapshot },
  ) {
    await this.getOne(id, userId);

    await this.dataSource.getRepository(StrategyEntity).update(id, dto);

    return;
  }

  async messageAgent(id: string, userId: string, dto: { message: string }) {
    const strategy = await this.getOne(id, userId);

    const state: StrategyAgentState = {
      snapshot: strategy.snapshot,
      history: strategy.conversation.history,
      userMessage: dto.message,
      stage: strategy.stage,
    };

    await this.strategyAgent.process(state);

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(StrategyEntity).update(id, {
        snapshot: state.snapshot,
      });

      await manager
        .getRepository(StrategyConversationEntity)
        .update(strategy.conversation.id, {
          history: state.history,
        });
    });

    return await this.getOne(id, userId);
  }
}
