import {
  StrategyConversationEntity,
  StrategyEntity,
  StrategySnapshot,
  StrategyThemeEntity,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { PaginationSortingQuery } from '@/common/utils';

import { STRATEGY_SNAPSHOT_DEFAULT } from './lib';
import { StrategyAgent } from './strategy.agent';
import { StrategyAgentState } from './types';

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
      .leftJoinAndSelect('strategy.profile', 'profile')
      .addSelect(['profile.id', 'profile.name'])
      .leftJoinAndSelect('strategy.themes', 'strategy_theme')
      .leftJoinAndSelect('strategy_theme.theme', 'theme')
      .addSelect(['theme.id', 'theme.name'])
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
        relations: ['conversation', 'themes', 'themes.theme', 'profile'],
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

      const conversation = await conversationRepository.save({
        strategyId: strategy.id,
        history: [],
      });

      strategy.themes = [];
      strategy.conversation = conversation;

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

  async messageAgent(id: string, userId: string, dto: { content: string }) {
    const strategy = await this.getOne(id, userId);

    const state: StrategyAgentState = {
      snapshot: strategy.snapshot,
      history: strategy.conversation.history,
      userMessage: dto.content,
      stage: strategy.stage,
      themes: strategy.themes.map((st) => st.theme),
      voice: strategy.profile,
      updates: {
        themesToAdd: [],
        themesToRemove: [],
        voiceToSet: undefined,
      },
    };

    await this.strategyAgent.process(state);

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(StrategyEntity).update(id, {
        snapshot: state.snapshot,
        stage: state.stage,
      });

      await manager
        .getRepository(StrategyConversationEntity)
        .update(strategy.conversation.id, {
          history: state.history,
        });

      // handle themes updates
      if (state.updates.themesToAdd.length > 0) {
        const themesToAdd = state.updates.themesToAdd.map((themeId) => ({
          strategyId: id,
          themeId,
        }));
        await manager.getRepository(StrategyThemeEntity).insert(themesToAdd);
      }

      if (state.updates.themesToRemove.length > 0) {
        await manager
          .getRepository(StrategyThemeEntity)
          .createQueryBuilder()
          .delete()
          .where('strategyId = :strategyId', { strategyId: id })
          .andWhere('themeId IN (:...themeIds)', {
            themeIds: state.updates.themesToRemove,
          })
          .execute();
      }

      if (state.updates.voiceToSet !== undefined) {
        await manager
          .getRepository(StrategyEntity)
          .update(id, { profileId: state.updates.voiceToSet });
      }
    });

    return await this.getOne(id, userId);
  }

  async deleteOne(id: string, userId: string) {
    await this.getOne(id, userId);

    await this.dataSource.getRepository(StrategyEntity).softDelete(id);
  }
}
