import {
  ProfileEntity,
  StrategyConversationEntity,
  StrategyEntity,
  StrategySnapshot,
  StrategyThemeEntity,
  ThemeEntity,
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
        'strategy.createdAt',
        'strategy.updatedAt',
        'strategy.status',
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
      snapshot: strategy.snapshot,
      history: strategy.conversation.history,
      userMessage: dto.content,
      stage: strategy.stage,
      themes: strategy.themes.map((st) => st.theme),
      profile: strategy.profile,
      userId,
      updates: {
        themesToLink: [],
        themesToCreate: [],
        themesToUpdate: [],
        themesToRemove: [],

        profileToSet: undefined,
        profileToCreate: null,
        profileToUpdate: null,
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

      // handle profile update
      await this.setProfile(manager, state.updates.profileToSet, id);
      await this.createProfile(manager, id, state.updates.profileToCreate);
      await this.updateProfile(
        manager,
        state.profile?.id,
        state.updates.profileToUpdate,
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

  private async setProfile(
    ds: EntityManager,
    profileId: string | null | undefined,
    strategyId: string,
  ) {
    if (profileId === undefined) return;

    await ds.getRepository(StrategyEntity).update(strategyId, { profileId });
  }

  private async createProfile(
    ds: EntityManager,
    strategyId: string,
    profileData: StrategyAgentState['updates']['profileToCreate'],
  ) {
    if (!profileData) return;

    const profile = await ds.getRepository(ProfileEntity).insert({
      ...profileData,
    });

    await ds
      .getRepository(StrategyEntity)
      .update(strategyId, { profileId: profile.raw.id });
  }

  private async updateProfile(
    ds: EntityManager,
    profileId: string,
    profileData: StrategyAgentState['updates']['profileToUpdate'],
  ) {
    if (!profileData) return;

    await ds.getRepository(ProfileEntity).update(profileId, profileData);
  }
}
