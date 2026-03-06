import {
  PlatformType,
  PostEntity,
  PostStatus,
  PostType,
  PostVersionAction,
  PostVersionEntity,
} from '@app/db';
import { Injectable } from '@nestjs/common';

import { Err } from '@/common/errors/app-error';
import { PaginationSortingQuery } from '@/common/utils';

import { PostStore } from './post.store';

@Injectable()
export class PostService {
  constructor(private readonly postStore: PostStore) {}

  async getMany(
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
    return this.postStore.getManyPaginated(userId, query);
  }

  async getOne(id: string, userId: string) {
    const post = await this.postStore.getOneWithRelations({ id, userId }, [
      'theme',
      'profile',
    ]);
    const version = await this.resolveCurrentVersion(post);

    if (!version) {
      throw Err.notFound('Post version not found');
    }

    return { post, version };
  }

  async listVersions(id: string, userId: string): Promise<PostVersionEntity[]> {
    await this.postStore.getOne({ id, userId });
    return this.postStore.listVersions(id);
  }

  async getVersion(
    postId: string,
    versionId: string,
    userId: string,
  ): Promise<PostVersionEntity> {
    await this.postStore.getOne({ id: postId, userId });

    const version = await this.postStore.getVersionForPost(postId, versionId);

    if (!version) {
      throw Err.notFound('Post version not found');
    }

    return version;
  }

  async updateOne(
    id: string,
    userId: string,
    dto: {
      title?: string | null;
      status?: PostStatus;
    },
  ) {
    const post = await this.postStore.getOne({ id, userId });

    await this.postStore.updateOne(post.id, dto);
  }

  async editText(postId: string, userId: string, dto: { text: string }) {
    const res = await this.getOne(postId, userId);

    let version = res.version;

    if (version.action !== PostVersionAction.Edit) {
      // create new edit version
      version = await this.postStore.createPostVersion({
        postId: res.post.id,
        text: dto.text,
        intent: version.intent,
        action: PostVersionAction.Edit,
        parentVersionNo: version.versionNo,
        versionNo: version.versionNo + 1,
      });

      await this.postStore.updateOne(res.post.id, {
        currentVersionId: version.id,
      });
    } else {
      await this.postStore.updatePostVersion(version.id, {
        text: dto.text,
      });
    }

    return { version, post: { ...res.post, currentVersionId: version.id } };
  }

  async deleteOne(id: string, userId: string) {
    await this.postStore.getOne({ id, userId });
    await this.postStore.deleteOne(id);
  }

  private async resolveCurrentVersion(
    post: PostEntity,
  ): Promise<PostVersionEntity | null> {
    if (post.currentVersionId) {
      const version = await this.postStore.getVersionForPost(
        post.id,
        post.currentVersionId,
      );

      if (version) {
        return version;
      }
    }

    return this.postStore.getLatestVersion(post.id);
  }
}
