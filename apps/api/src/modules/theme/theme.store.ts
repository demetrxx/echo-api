import { ThemeEntity } from '@app/db';
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

    return this.dataSource
      .getRepository(ThemeEntity)
      .createQueryBuilder('theme')
      .where('theme.id = :id', { id })
      .andWhere('theme.userId = :userId', { userId })
      .getOne();
  }

  async getManyPaginated(userId: string, query: PaginationSortingQuery) {
    const { orderBy, order, skip, take } = query;

    const themesRepo = this.dataSource.getRepository(ThemeEntity);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const themes = await themesRepo
      .createQueryBuilder('theme')
      .select(['theme.id', 'theme.name', 'theme.createdAt'])
      .addSelect('COUNT(post.id)', 'recentPostsCount')
      .leftJoin('theme.posts', 'post', 'post.createdAt >= :weekAgo', {
        weekAgo,
      })
      .where('theme.userId = :userId', { userId })
      .groupBy('theme.id')
      .addGroupBy('theme.name')
      .addGroupBy('theme.createdAt')
      .orderBy(`theme.${orderBy}`, order)
      .skip(skip)
      .take(take)
      .getRawMany();

    return {
      total: themes.length,
      data: themes.map((theme) => ({
        id: theme.theme_id,
        name: theme.theme_name,
        createdAt: theme.theme_createdAt,
        recentPostsCount: Number(theme.recentPostsCount) || 0,
      })),
      skip,
      take,
    };
  }

  create(theme: {
    userId: string;
    name: string;
    description?: string;
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
