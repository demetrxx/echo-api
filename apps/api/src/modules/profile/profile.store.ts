import { PlatformType, ProfileEntity } from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Raw } from 'typeorm';

import { DS } from '@/common/types';
import { PaginationSortingQuery } from '@/common/utils';

@Injectable()
export class ProfileStore {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  getDefaultProfile(
    userId: string,
    platform: PlatformType,
  ): Promise<ProfileEntity | null> {
    return this.dataSource.getRepository(ProfileEntity).findOne({
      where: {
        userId,
        isDefaultFor: Raw((alias) => `${alias} @> :v::jsonb`, {
          v: JSON.stringify([platform]),
        }),
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
      tov?: string[] | null;
      examples: string[];
      isDefaultFor: PlatformType[];
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

  async clearDefaultForUser(
    userId: string,
    platforms: PlatformType[],
    ds: DS = this.dataSource,
  ) {
    if (!platforms.length) {
      return;
    }

    const repo = ds.getRepository(ProfileEntity);
    const profiles = await repo.find({ where: { userId } });

    const updates = profiles
      .map((profile) => {
        const next = profile.isDefaultFor.filter(
          (platform) => !platforms.includes(platform),
        );

        if (next.length === profile.isDefaultFor.length) {
          return null;
        }

        return Object.assign(profile, { isDefaultFor: next });
      })
      .filter(Boolean) as ProfileEntity[];

    if (updates.length > 0) {
      await repo.save(updates);
    }
  }
}
