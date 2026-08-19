import { StrategyThemeEntity, ThemeEntity } from '@app/db';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { PaginationSortingQuery } from '@/common/utils';

@Injectable()
export class ThemeStore {
  constructor(private readonly dataSource: DataSource) {}

  async getOne(i: {
    id: string;
    userId?: string;
  }): Promise<ThemeEntity | null> {
    const { id, userId } = i;

    return this.dataSource.getRepository(ThemeEntity).findOne({
      where: { id, userId },
      relations: ['strategies', 'strategies.strategy'],
    });
  }

  async getManyPaginated(userId: string, query: PaginationSortingQuery) {
    const { orderBy, order, skip, take } = query;

    const themesRepo = this.dataSource.getRepository(ThemeEntity);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const themesQb = await themesRepo
      .createQueryBuilder('theme')
      .select([
        'theme.id',
        'theme.name',
        'theme.description',
        'theme.createdAt',
      ])
      .addSelect('COUNT(post.id)', 'recentPostsCount')
      .leftJoin('theme.posts', 'post', 'post.createdAt >= :weekAgo', {
        weekAgo,
      })
      .where('theme.userId = :userId', { userId })
      .groupBy('theme.id')
      .addGroupBy('theme.name')
      .addGroupBy('theme.description')
      .addGroupBy('theme.createdAt')
      .orderBy(`theme.${orderBy}`, order)
      .skip(skip)
      .take(take);

    const themes = await themesQb.getRawMany();

    const themesCount = await themesQb.getCount();

    if (!themes.length) {
      return {
        total: 0,
        data: [],
        skip,
        take,
      };
    }

    const strategies = await this.dataSource
      .getRepository(StrategyThemeEntity)
      .createQueryBuilder('strategyTheme')
      .leftJoin('strategyTheme.strategy', 'strategy')
      .addSelect(['strategy.id', 'strategy.name', 'strategy.userId'])
      .where('strategyTheme.themeId IN (:...themeIds)', {
        themeIds: themes.map((theme) => theme.id),
      })
      .andWhere('strategy.userId = :userId', { userId })
      .getMany();

    const data = themes.map((theme) => ({
      id: theme.theme_id,
      name: theme.theme_name,
      description: theme.theme_description,
      createdAt: theme.theme_createdAt,
      recentPostsCount: Number(theme.recentPostsCount) || 0,
      strategies: strategies.filter(
        (strategy) => strategy.themeId === theme.id,
      ),
    }));

    return {
      total: themesCount,
      data,
      skip,
      take,
    };
  }

  create(theme: {
    userId: string;
    name: string;
    description?: string;
    cleanName: string;
  }): Promise<ThemeEntity> {
    return this.dataSource.getRepository(ThemeEntity).save(theme);
  }

  async isUnique(dto: { userId: string; name: string }): Promise<boolean> {
    return this.dataSource
      .getRepository(ThemeEntity)
      .findOne({
        where: { userId: dto.userId, name: dto.name },
      })
      .then((theme) => !theme);
  }

  async updateOne(
    id: string,
    dto: { name?: string; description?: string; defaultAngleId?: string },
  ) {
    await this.dataSource.getRepository(ThemeEntity).update(id, dto);
  }

  async deleteOne(id: string) {
    await this.dataSource.getRepository(ThemeEntity).softDelete(id);
  }
}
