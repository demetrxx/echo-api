import { ThemeEntity } from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { PaginationSortingQuery } from '@/common/utils';

interface ThemesAdminQuery {
  userId?: string;
}

@Injectable()
export class ThemeAdminService {
  constructor(
    @InjectDataSource()
    private readonly ds: DataSource,
  ) {}

  async getMany(q: ThemesAdminQuery & PaginationSortingQuery) {
    const query = this.ds
      .createQueryBuilder(ThemeEntity, 'theme')
      .select(['theme.id', 'theme.name', 'theme.createdAt', 'theme.updatedAt'])
      .skip(q.skip)
      .take(q.take)
      .orderBy(q.orderBy, q.order);

    if (q.userId) {
      query.andWhere('theme.userId = :userId', { userId: q.userId });
    }

    const [themes, total] = await query.getManyAndCount();

    return {
      data: themes,
      total,
      skip: q.skip,
      take: q.take,
    };
  }
}
