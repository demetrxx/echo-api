import {
  StrategyConversationEntity,
  StrategyEntity,
  StrategySnapshot,
  StrategyThemeEntity,
  ThemeEntity,
  VoiceEntity,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { PaginationSortingQuery } from '@/common/utils';

import { FIRST_AI_MESSAGE } from './consts';
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
        'strategy.stage',

        'strategy.createdAt',
        'strategy.updatedAt',
        'strategy.status',
        'strategy.snapshot',
      ])
      .leftJoinAndSelect('strategy.voice', 'voice')
      .addSelect(['voice.id', 'voice.name'])
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
        relations: ['conversation', 'themes', 'themes.theme', 'voice'],
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
        history: [
          {
            role: 'assistant',
            content: FIRST_AI_MESSAGE,
          },
        ],
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
      name: strategy.name,
      snapshot: strategy.snapshot,
      history: strategy.conversation.history,
      userMessage: dto.content,
      stage: strategy.stage,
      themes: strategy.themes.map((st) => st.theme),
      voice: strategy.voice,
      userId,
      updates: {
        themesToLink: [],
        themesToCreate: [],
        themesToUpdate: [],
        themesToRemove: [],

        voiceToSet: undefined,
        voiceToCreate: null,
        voiceToUpdate: null,
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
      await this.linkThemes(manager, id, state.updates.themesToLink);
      await this.unlinkThemes(manager, id, state.updates.themesToRemove);
      await this.createThemes(manager, id, state.updates.themesToCreate);
      await this.updateThemes(manager, state.updates.themesToUpdate);

      // handle voice update
      await this.setVoice(manager, state.updates.voiceToSet, id);
      await this.createVoice(manager, id, state.updates.voiceToCreate);
      await this.updateVoice(
        manager,
        state.voice?.id,
        state.updates.voiceToUpdate,
      );
    });

    return await this.getOne(id, userId);
  }

  async deleteOne(id: string, userId: string) {
    await this.getOne(id, userId);

    await this.dataSource.getRepository(StrategyEntity).softDelete(id);
  }

  // helper methods for agent updates

  private async linkThemes(
    ds: EntityManager,
    strategyId: string,
    themeIds: string[],
  ) {
    if (!themeIds.length) return;

    const themesToAdd = themeIds.map((themeId) => ({
      strategyId,
      themeId,
    }));
    await ds.getRepository(StrategyThemeEntity).insert(themesToAdd);
  }

  private async unlinkThemes(
    ds: EntityManager,
    strategyId: string,
    themeIds: string[],
  ) {
    if (!themeIds.length) return;

    await ds
      .getRepository(StrategyThemeEntity)
      .createQueryBuilder()
      .delete()
      .where('strategyId = :strategyId', { strategyId })
      .andWhere('themeId IN (:...themeIds)', {
        themeIds,
      })
      .execute();
  }

  private async updateThemes(
    ds: EntityManager,
    dtos: StrategyAgentState['updates']['themesToUpdate'],
  ) {
    if (!dtos.length) return;

    for (const dto of dtos) {
      const { id, name, description } = dto;
      await ds.getRepository(ThemeEntity).update(id, {
        ...(name && { name }),
        ...(description && { description }),
      });
    }
  }

  private async createThemes(
    ds: EntityManager,
    strategyId: string,
    dtos: StrategyAgentState['updates']['themesToCreate'],
  ) {
    if (!dtos.length) return;

    const themes = (await ds.save(
      dtos.map((dto) => ({
        name: dto.name,
        description: dto.description,
      })),
    )) as ThemeEntity[];

    const strategyThemes = themes.map((theme) => ({
      strategyId,
      themeId: theme.id,
    }));

    await ds.getRepository(StrategyThemeEntity).insert(strategyThemes);
  }

  private async setVoice(
    ds: EntityManager,
    voiceId: string | null | undefined,
    strategyId: string,
  ) {
    if (voiceId === undefined) return;

    await ds.getRepository(StrategyEntity).update(strategyId, { voiceId });
  }

  private async createVoice(
    ds: EntityManager,
    strategyId: string,
    voiceData: StrategyAgentState['updates']['voiceToCreate'],
  ) {
    if (!voiceData) return;

    const voice = await ds.getRepository(VoiceEntity).insert({
      ...voiceData,
    });

    await ds
      .getRepository(StrategyEntity)
      .update(strategyId, { voiceId: voice.raw.id });
  }

  private async updateVoice(
    ds: EntityManager,
    voiceId: string,
    voiceData: StrategyAgentState['updates']['voiceToUpdate'],
  ) {
    if (!voiceData) return;

    await ds.getRepository(VoiceEntity).update(voiceId, voiceData);
  }
}
