import {
  PlatformType,
  PostEntity,
  PostStatus,
  PostType,
  PostVersionEntity,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { DS } from '@/common/types';
import { PaginationSortingQuery } from '@/common/utils';

type PostDto = Pick<
  PostEntity,
  | 'userId'
  | 'themeId'
  | 'angleId'
  | 'profileId'
  | 'platform'
  | 'postType'
  | 'generationId'
> & {
  status?: PostStatus;
  title?: string | null;
};

type PostVersionDto = Pick<
  PostVersionEntity,
  'postId' | 'text' | 'intent' | 'action' | 'versionNo' | 'parentVersionNo'
>;

@Injectable()
export class PostStore {
  constructor(private readonly dataSource: DataSource) {}

  async getOneWithRelations(
    dto: { id: string; userId?: string },
    relations?: string[],
    throwIfNotFound = true,
  ) {
    const post = this.dataSource.getRepository(PostEntity).findOne({
      where: { id: dto.id, userId: dto.userId },
      relations,
    });

    if (!post && throwIfNotFound) {
      throw Err.notFound('Post not found');
    }

    return post;
  }

  async getOne(dto: { id: string; userId?: string }, throwIfNotFound = true) {
    const post = await this.dataSource.getRepository(PostEntity).findOne({
      where: { id: dto.id, userId: dto.userId },
    });

    if (!post && throwIfNotFound) {
      throw Err.notFound('Post not found');
    }

    return post;
  }

  async deleteOne(id: string) {
    await this.dataSource.getRepository(PostEntity).softDelete(id);
  }

  async getManyPaginated(
    userId: string,
    query: PaginationSortingQuery & {
      themeId?: string;
      status?: PostStatus;
      postType?: PostType;
      platform?: PlatformType;
      search?: string;
      profileId?: string;
    },
  ) {
    const {
      orderBy,
      order,
      skip,
      take,
      themeId,
      status,
      postType,
      platform,
      profileId,
      search,
    } = query;

    const qb = this.dataSource
      .getRepository(PostEntity)
      .createQueryBuilder('post')
      .where('post.userId = :userId', { userId })
      .leftJoinAndSelect('post.theme', 'theme')
      .leftJoinAndSelect('post.profile', 'profile')
      .orderBy(`post.${orderBy}`, order)
      .skip(skip)
      .take(take);

    if (themeId) {
      qb.andWhere('post.themeId = :themeId', { themeId });
    }

    if (search) {
      qb.andWhere('post.title ILIKE :search', { search: `%${search}%` });
    }

    if (status) {
      qb.andWhere('post.status = :status', { status });
    } else {
      // not generating, archived, failed
      qb.andWhere('post.status not in (:...statuses)', {
        statuses: [
          PostStatus.Generating,
          PostStatus.Archived,
          PostStatus.Failed,
        ],
      });
    }

    if (postType) {
      qb.andWhere('post.postType = :postType', { postType });
    }

    if (platform) {
      qb.andWhere('post.platform = :platform', { platform });
    }

    if (profileId) {
      qb.andWhere('post.profileId = :profileId', { profileId });
    }

    const data = await qb.getMany();
    const total = await qb.getCount();

    return {
      total,
      data,
      skip,
      take,
    };
  }

  async listVersions(postId: string): Promise<PostVersionEntity[]> {
    return this.dataSource.getRepository(PostVersionEntity).find({
      where: { postId },
      order: { createdAt: 'DESC' },
    });
  }

  async getVersionForPost(
    postId: string,
    versionId: string,
  ): Promise<PostVersionEntity | null> {
    return this.dataSource.getRepository(PostVersionEntity).findOne({
      where: { id: versionId, postId },
    });
  }

  async getLatestVersion(postId: string): Promise<PostVersionEntity | null> {
    return this.dataSource.getRepository(PostVersionEntity).findOne({
      where: { postId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateOne(
    id: string,
    dto: {
      title?: string | null;
      status?: PostStatus;
      finalVersionId?: string | null;
      currentVersionId?: string | null;
      profileId?: string | null;
      postType?: PostType;
    },
    ds: DS = this.dataSource,
  ) {
    await ds.getRepository(PostEntity).update(id, dto);
  }

  createPost(dto: PostDto, ds: DS = this.dataSource): Promise<PostEntity> {
    const postRepository = ds.getRepository(PostEntity);

    return postRepository.save(dto);
  }

  createPostVersion(
    dto: PostVersionDto,
    ds: DS = this.dataSource,
  ): Promise<PostVersionEntity> {
    const postVersionRepository = ds.getRepository(PostVersionEntity);

    return postVersionRepository.save(dto);
  }

  updatePostVersion(
    id: string,
    dto: {
      text?: string;
    },
    ds: DS = this.dataSource,
  ) {
    const postVersionRepository = ds.getRepository(PostVersionEntity);

    return postVersionRepository.update(id, dto);
  }
}
