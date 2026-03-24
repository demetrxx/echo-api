import { PlatformType, ProfileEntity } from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { DS } from '@/common/types';
import { PaginationSortingQuery } from '@/common/utils';

@Injectable()
export class ProfileStore {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  getDefaultProfile(userId: string): Promise<ProfileEntity | null> {
    return this.dataSource.getRepository(ProfileEntity).findOne({
      where: {
        userId,
      },
    });
  }

  getProfile(profileId: string): Promise<ProfileEntity | null> {
    return this.dataSource.getRepository(ProfileEntity).findOne({
      where: { id: profileId },
    });
  }

  async getOne(input: { id: string; userId: string }) {
    return this.dataSource.getRepository(ProfileEntity).findOne({
      where: { id: input.id, userId: input.userId },
    });
  }

  async getManyPaginated(userId: string, query: PaginationSortingQuery) {
    const { orderBy, order, skip, take } = query;

    const profiles = await this.dataSource.getRepository(ProfileEntity).find({
      where: { userId },
      skip,
      take,
      order: {
        [orderBy]: order,
      },
    });

    return {
      total: profiles.length,
      data: profiles,
      skip,
      take,
    };
  }

  async create(
    dto: {
      userId: string;
      name: string;
      prompt?: string | null;
      examples: string[];
    },
    ds: DS = this.dataSource,
  ): Promise<ProfileEntity> {
    return ds.getRepository(ProfileEntity).save(dto);
  }

  async updateOne(
    id: string,
    dto: {
      name?: string;
      prompt?: string | null;
      tov?: string[] | null;
      examples?: string[];
      isDefaultFor?: PlatformType[];
    },
    ds: DS = this.dataSource,
  ) {
    await ds.getRepository(ProfileEntity).update(id, dto);
  }

  async deleteOne(id: string) {
    await this.dataSource.getRepository(ProfileEntity).softDelete(id);
  }
}
