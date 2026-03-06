import { PlatformType } from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { PaginationSortingQuery } from '@/common/utils';

import { ProfileStore } from './profile.store';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileStore: ProfileStore,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(
    userId: string,
    dto: {
      name: string;
      prompt?: string;
      tov?: string[];
      examples?: string[];
      isDefaultFor?: PlatformType[];
    },
  ) {
    return this.dataSource.transaction(async (ds) => {
      if (dto.isDefaultFor) {
        await this.profileStore.clearDefaultForUser(
          userId,
          dto.isDefaultFor,
          ds,
        );
      }

      return this.profileStore.create(
        {
          userId,
          name: dto.name,
          prompt: dto.prompt ?? null,
          tov: dto.tov ?? [],
          examples: dto.examples ?? [],
          isDefaultFor: dto.isDefaultFor ?? [],
        },
        ds,
      );
    });
  }

  async getOne(id: string, userId: string) {
    const profile = await this.profileStore.getOne({ id, userId });

    if (!profile) {
      throw Err.notFound('Profile not found');
    }

    return profile;
  }

  async getMany(userId: string, query: PaginationSortingQuery) {
    return this.profileStore.getManyPaginated(userId, query);
  }

  async updateOne(
    id: string,
    userId: string,
    dto: {
      name?: string;
      prompt?: string | null;
      tov?: string[] | null;
      examples?: string[];
      isDefaultFor?: PlatformType[];
    },
  ) {
    await this.getOne(id, userId);

    await this.dataSource.transaction(async (ds) => {
      if (dto.isDefaultFor) {
        await this.profileStore.clearDefaultForUser(
          userId,
          dto.isDefaultFor,
          ds,
        );
      }

      await this.profileStore.updateOne(
        id,
        {
          name: dto.name,
          prompt: dto.prompt,
          tov: dto.tov,
          examples: dto.examples,
          isDefaultFor: dto.isDefaultFor,
        },
        ds,
      );
    });
  }

  async deleteOne(id: string, userId: string) {
    await this.getOne(id, userId);

    await this.profileStore.deleteOne(id);
  }
}
