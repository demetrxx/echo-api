import {
  IdeaEntity,
  PlatformType,
  PostEntity,
  PostNoteEntity,
  PostStatus,
  PostVersionEntity,
  PostVersionType,
  StrategyEntity,
  StrategyStatus,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { DS } from '@/common/types';
import { PaginationSortingQuery } from '@/common/utils';

import { PostRefineService } from './post-refine.service';

export interface PostCreateDto {
  themeId?: string;
  ideaId?: string;
  noteIds?: string[];
  text?: string;
}

const DEFAULT_PLATFORM = PlatformType.LinkedIn;

export interface PostUpdateDto {
  title?: string;
  themeId?: string;
  voiceId?: string;
  noteIds?: string[];
  platform?: PlatformType | null;
  status?: PostStatus;
  currentVersionId?: string;
}

@Injectable()
export class PostService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly postRefineService: PostRefineService,
  ) {}

  async refine(postId: string, userId: string, dto: { request: string }) {
    const post = await this.getOne(postId, userId);

    const strategy = await this.dataSource
      .getRepository(StrategyEntity)
      .findOne({
        where: { id: post.strategyId, userId },
      });

    const refinedPostText = await this.postRefineService.refine({
      post,
      notes: post.notes.map((note) => note.note),
      theme: post.theme,
      idea: post.idea,
      strategy,
      request: dto.request,
    });

    // create new version
    await this.dataSource.transaction(async (ds) => {
      await this.createPostVersion(
        {
          postId: post.id,
          text: refinedPostText,
          type: PostVersionType.AI,
          parentVersionNo: post.currentVersion.versionNo,
        },
        ds,
      );
    });

    return this.getOne(postId, userId);
  }

  async getMany(
    userId: string,
    query: PaginationSortingQuery & {
      themeId?: string;
      status?: PostStatus;
      platform?: PlatformType;
      search?: string;
      voiceId?: string;
    },
  ) {
    const {
      orderBy,
      order,
      skip,
      take,
      themeId,
      status,
      platform,
      voiceId,
      search,
    } = query;

    const qb = this.dataSource
      .getRepository(PostEntity)
      .createQueryBuilder('post')
      .where('post.userId = :userId', { userId })
      .leftJoinAndSelect('post.theme', 'theme')
      .leftJoinAndSelect('post.voice', 'voice')
      .leftJoinAndSelect('post.idea', 'idea')
      .leftJoinAndSelect('post.currentVersion', 'currentVersion')
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
      qb.andWhere('post.status not in (:...statuses)', {
        statuses: [PostStatus.Archived],
      });
    }

    if (platform) {
      qb.andWhere('post.platform = :platform', { platform });
    }

    if (voiceId) {
      qb.andWhere('post.voiceId = :voiceId', { voiceId });
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

  async getOne(id: string, userId: string) {
    const post = await this.dataSource.getRepository(PostEntity).findOne({
      where: { id, userId },
      relations: [
        'theme',
        'voice',
        'idea',
        'currentVersion',
        'notes',
        'notes.note',
        'versions',
      ],
    });

    if (!post) {
      throw Err.notFound('Post not found');
    }

    return post;
  }

  async updateOne(id: string, userId: string, dto: PostUpdateDto) {
    await this.checkExists(id, userId);

    const postRepository = this.dataSource.getRepository(PostEntity);

    await postRepository.update(id, {
      title: dto.title,
      themeId: dto.themeId,
      voiceId: dto.voiceId,
      platform: dto.platform,
      status: dto.status,
      currentVersionId: dto.currentVersionId,
    });

    await this.updatePostNotes(id, dto.noteIds);

    return this.getOne(id, userId);
  }

  async editText(postId: string, userId: string, dto: { text: string }) {
    const post = await this.getOne(postId, userId);

    let version = post.currentVersion;

    if (version.type !== PostVersionType.Manual) {
      // create new edit version
      version = await this.createPostVersion({
        postId: post.id,
        text: dto.text,
        type: PostVersionType.Manual,
        parentVersionNo: version.versionNo,
      });
    } else {
      await this.updatePostVersion(version.id, {
        text: dto.text,
      });
    }

    return this.getOne(postId, userId);
  }

  async create(userId: string, dto: PostCreateDto) {
    const lastPost = await this.getLastPost(userId);

    let themeId = dto.themeId;
    let title: string;

    if (dto.ideaId) {
      const idea = await this.dataSource.getRepository(IdeaEntity).findOne({
        where: { id: dto.ideaId, userId },
      });

      if (!idea) {
        throw Err.notFound('Idea not found');
      }

      if (!themeId && idea.themeId) {
        themeId = idea.themeId;
      }

      title = idea.name;
    }

    const activeStrategy = await this.dataSource
      .getRepository(StrategyEntity)
      .findOne({
        where: {
          userId,
          status: StrategyStatus.Active,
        },
      });

    const postId = await this.dataSource.transaction(async (ds) => {
      const postRepository = ds.getRepository(PostEntity);

      const post = await postRepository.save({
        userId,
        themeId,
        title,
        voiceId: lastPost?.voiceId,
        ideaId: dto.ideaId,
        status: PostStatus.Draft,
        platform: lastPost?.platform ?? DEFAULT_PLATFORM,
        strategyId: activeStrategy?.id,
      });

      const version = await this.createPostVersion(
        {
          postId: post.id,
          text: dto.text,
          type: PostVersionType.Manual,
          parentVersionNo: null,
        },
        ds,
      );

      if (dto.noteIds?.length) {
        await ds.getRepository(PostNoteEntity).save(
          dto.noteIds.map((noteId) => ({
            postId: post.id,
            noteId,
          })),
        );
      }

      await postRepository.update(post.id, {
        currentVersionId: version.id,
      });

      return post.id;
    });

    return this.getOne(postId, userId);
  }

  async deleteOne(id: string, userId: string) {
    await this.checkExists(id, userId);
    await this.dataSource.getRepository(PostEntity).softDelete(id);
  }

  // post notes
  async updatePostNotes(postId: string, noteIds?: string[]) {
    if (!noteIds) {
      return;
    }

    const postNotes = await this.dataSource.getRepository(PostNoteEntity).find({
      where: { postId, noteId: In(noteIds) },
    });

    // remove notes that are not in the list
    const postNotesToDelete = postNotes.filter(
      (postNote) => !noteIds.includes(postNote.noteId),
    );
    await this.dataSource
      .getRepository(PostNoteEntity)
      .remove(postNotesToDelete);

    // create new notes
    const postNotesToCreate = noteIds.filter(
      (noteId) => !postNotes.some((postNote) => postNote.noteId === noteId),
    );
    await this.dataSource
      .getRepository(PostNoteEntity)
      .save(postNotesToCreate.map((noteId) => ({ postId, noteId })));
  }

  // versions
  async createPostVersion(
    dto: {
      postId: string;
      text: string;
      type: PostVersionType;
      parentVersionNo: number | null;
    },
    ds: DS = this.dataSource,
  ) {
    const postVersionRepository = ds.getRepository(PostVersionEntity);
    const latestVersion = await this.getLatestVersion(dto.postId);
    const postRepository = ds.getRepository(PostEntity);

    const version = await postVersionRepository.save({
      ...dto,
      versionNo: (latestVersion?.versionNo || 0) + 1,
    });

    await postRepository.update(dto.postId, {
      currentVersionId: version.id,
    });

    return version;
  }

  async updatePostVersion(
    id: string,
    dto: {
      text?: string;
    },
    ds: DS = this.dataSource,
  ) {
    return ds.getRepository(PostVersionEntity).update(id, dto);
  }

  async listVersions(id: string, userId: string): Promise<PostVersionEntity[]> {
    await this.checkExists(id, userId);

    return this.dataSource.getRepository(PostVersionEntity).find({
      where: { postId: id },
      order: { createdAt: 'DESC' },
    });
  }

  async getVersion(
    postId: string,
    versionId: string,
    userId: string,
  ): Promise<PostVersionEntity> {
    await this.checkExists(postId, userId);

    const version = await this.dataSource
      .getRepository(PostVersionEntity)
      .findOne({
        where: { id: versionId, postId },
      });

    if (!version) {
      throw Err.notFound('Post version not found');
    }

    return version;
  }

  // helpers
  async checkExists(id: string, userId: string) {
    const post = await this.dataSource.getRepository(PostEntity).findOne({
      where: { id, userId },
    });

    if (!post) {
      throw Err.notFound('Post not found');
    }

    return post;
  }

  async getLastPost(userId: string) {
    return this.dataSource.getRepository(PostEntity).findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getLatestVersion(postId: string): Promise<PostVersionEntity | null> {
    return this.dataSource.getRepository(PostVersionEntity).findOne({
      where: { postId },
      order: { createdAt: 'DESC' },
    });
  }
}
