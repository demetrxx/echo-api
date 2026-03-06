import { PostEntity, ThemeEntity } from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { PaginationSortingQuery } from '@/common/utils';

import { ThemeStore } from './theme.store';

@Injectable()
export class ThemeService {
  constructor(
    private readonly themeStore: ThemeStore,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async create(
    userId: string,
    dto: { name: string; description?: string; defaultAngle?: string },
  ) {
    if (!(await this.themeStore.isUnique({ name: dto.name, userId }))) {
      throw Err.conflict('Theme with this name already exists');
    }

    const theme = await this.themeStore.create({ ...dto, userId });

    return theme;
  }

  async getOne(id: string, userId: string) {
    const theme = await this.themeStore.getOne({ id, userId });

    if (!theme) {
      throw Err.notFound('Theme not found');
    }

    const recentPosts = await this.dataSource
      .getRepository(PostEntity)
      .createQueryBuilder('post')
      .select(['post.id', 'post.title', 'post.status'])
      .where('post.themeId = :themeId', { themeId: id })
      .andWhere('post.userId = :userId', { userId })
      .orderBy('post.createdAt', 'DESC')
      .take(3)
      .getMany();

    return {
      ...theme,
      recentPosts,
    } as ThemeEntity & { recentPosts: PostEntity[] };
  }

  async getMany(userId: string, query: PaginationSortingQuery) {
    return this.themeStore.getManyPaginated(userId, query);
  }

  async updateOne(
    id: string,
    userId: string,
    dto: { name?: string; description?: string },
  ) {
    if (dto.name) {
      if (!(await this.themeStore.isUnique({ name: dto.name, userId }))) {
        throw Err.conflict('Theme with this name already exists');
      }
    }

    await this.themeStore.getOne({ id, userId });
    return this.themeStore.updateOne(id, dto);
  }

  async deleteOne(id: string, userId: string) {
    await this.themeStore.getOne({ id, userId });

    return this.themeStore.deleteOne(id);
  }
}
