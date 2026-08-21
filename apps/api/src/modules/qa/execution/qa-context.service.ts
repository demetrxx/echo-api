import {
  NoteEntity,
  PostEntity,
  QaProfileEntity,
  QaProfileStatus,
  StrategyEntity,
  ThemeEntity,
  UserEntity,
  VoiceEntity,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ZodError } from 'zod';

import { AppError } from '@/common/errors/app-error';

import { hashStable } from '../lib/qa-fixture.loader';
import { assertSandboxUser } from '../lib/qa-sandbox';
import {
  QaContextPreview,
  qaContextPreviewSchema,
} from '../types';
import { QaCapabilityRegistry } from './qa-capability.registry';

@Injectable()
export class QaContextService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly registry: QaCapabilityRegistry,
  ) {}

  async preview(params: {
    profileId: string;
    capabilityKey: string;
    input?: Record<string, unknown>;
    overrides?: Record<string, unknown>;
  }): Promise<QaContextPreview> {
    const { profile, sandboxUser } = await this.loadReadyProfile(
      params.profileId,
    );
    const capability = this.registry.get(params.capabilityKey);
    const mergedInput = {
      ...(params.input ?? {}),
      ...(params.overrides ?? {}),
    };

    let parsedInput: Record<string, unknown>;
    try {
      parsedInput = capability.parseInput(mergedInput);
    } catch (error) {
      throw this.invalidInput(error);
    }

    const resolved = await capability.resolveContext({
      sandboxUserId: sandboxUser.id,
      input: parsedInput,
      services: this.registry.services(),
    });

    const blocking = resolved.warnings.find((warning) => warning.blocking);
    if (blocking) {
      throw new AppError('QA_CONTEXT_INVALID', blocking.message, resolved);
    }

    const preview = qaContextPreviewSchema.parse({
      profileId: profile.id,
      sandboxUserId: sandboxUser.id,
      capabilityKey: capability.key,
      input: resolved.input,
      context: resolved.context,
      warnings: resolved.warnings,
      contextHash: '',
    });

    preview.contextHash = this.hashPreview(preview);
    return preview;
  }

  annotatePriorStep(preview: QaContextPreview, ids: string[]): QaContextPreview {
    const idSet = new Set(ids.filter(Boolean));
    if (!idSet.size) {
      return preview;
    }

    const next: QaContextPreview = {
      ...preview,
      context: preview.context.map((item) => ({
        ...item,
        source: item.ids.some((id) => idSet.has(id))
          ? 'prior_step'
          : item.source,
      })),
      contextHash: '',
    };
    next.contextHash = this.hashPreview(next);
    return next;
  }

  async assertFreshHash(preview: QaContextPreview, expectedHash?: string) {
    const current = await this.preview({
      profileId: preview.profileId,
      capabilityKey: preview.capabilityKey,
      input: preview.input,
    });

    const actualHash = expectedHash ?? preview.contextHash;
    if (current.contextHash !== actualHash) {
      throw new AppError(
        'QA_CONTEXT_INVALID',
        'Context hash is stale; preview context again',
        {
          expected: actualHash,
          actual: current.contextHash,
        },
      );
    }

    return current;
  }

  async loadReadyProfile(profileId: string) {
    const profile = await this.dataSource.getRepository(QaProfileEntity).findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new AppError('NOT_FOUND', 'QA profile not found', { profileId });
    }

    if (
      profile.status !== QaProfileStatus.Ready &&
      profile.status !== QaProfileStatus.OutOfDate
    ) {
      throw new AppError(
        'QA_PROFILE_NOT_READY',
        'Profile must be materialized before preview or execution',
        { status: profile.status },
      );
    }

    if (!profile.sandboxUserId) {
      throw new AppError(
        'QA_SANDBOX_REQUIRED',
        'Profile does not have a sandbox user',
      );
    }

    const sandboxUser = await assertSandboxUser(
      this.dataSource,
      profile.sandboxUserId,
    );

    return { profile, sandboxUser };
  }

  async countsForUser(userId: string) {
    const [notes, themes, strategies, voices, posts] = await Promise.all([
      this.dataSource.getRepository(NoteEntity).count({ where: { userId } }),
      this.dataSource.getRepository(ThemeEntity).count({ where: { userId } }),
      this.dataSource.getRepository(StrategyEntity).count({ where: { userId } }),
      this.dataSource.getRepository(VoiceEntity).count({ where: { userId } }),
      this.dataSource.getRepository(PostEntity).count({ where: { userId } }),
    ]);

    return { notes, themes, strategies, voices, posts };
  }

  async getSandboxUser(userId: string): Promise<UserEntity> {
    return assertSandboxUser(this.dataSource, userId);
  }

  private hashPreview(preview: Omit<QaContextPreview, 'contextHash'>): string {
    return hashStable({
      profileId: preview.profileId,
      sandboxUserId: preview.sandboxUserId,
      capabilityKey: preview.capabilityKey,
      input: preview.input,
      context: preview.context.map((item) => ({
        key: item.key,
        source: item.source,
        ids: item.ids,
      })),
    });
  }

  private invalidInput(error: unknown) {
    if (error instanceof ZodError) {
      return new AppError(
        'QA_CONTEXT_INVALID',
        'Invalid capability input',
        error.issues,
      );
    }

    return new AppError(
      'QA_CONTEXT_INVALID',
      error instanceof Error ? error.message : 'Invalid capability input',
    );
  }
}
