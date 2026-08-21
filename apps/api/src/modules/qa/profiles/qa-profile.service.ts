import {
  NoteEntity,
  PostEntity,
  QaProfileEntity,
  QaProfileSegment,
  QaProfileSource,
  QaProfileStatus,
  StrategyEntity,
  ThemeEntity,
  VoiceEntity,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, ILike } from 'typeorm';

import { AppError } from '@/common/errors/app-error';
import { PaginationSortingQuery } from '@/common/utils';

import {
  applyDefinitionChanges,
  QaDefinitionChange,
} from '../lib/qa-definition-ops';
import { loadQaFixture, normalizeFixture } from '../lib/qa-fixture.loader';
import { QaMaterializerService } from '../materialization/qa-materializer.service';
import {
  CanonicalQaProfileDefinition,
  parseQaProfileDefinition,
} from '../types';

const FIXTURE_SEGMENTS: Record<string, QaProfileSegment> = {
  creator_founder_operator: QaProfileSegment.FounderOperator,
  creator_expert_educator: QaProfileSegment.ExpertEducator,
  creator_reflective_writer: QaProfileSegment.ReflectiveWriter,
};

export interface CreateQaProfileDto {
  name: string;
  segment?: QaProfileSegment;
  source: QaProfileSource;
  fixtureKey?: string;
  brief?: string;
  definition?: unknown;
}

export interface PatchQaProfileDto {
  name?: string;
  segment?: QaProfileSegment;
  definition?: unknown;
  changes?: QaDefinitionChange[];
  draftRevision?: number;
  status?: QaProfileStatus;
}

@Injectable()
export class QaProfileService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly materializer: QaMaterializerService,
  ) {}

  async create(dto: CreateQaProfileDto) {
    if (dto.source === QaProfileSource.RealClone) {
      throw new AppError(
        'QA_CLONE_CONFIRMATION_REQUIRED',
        'Real clone profiles are not available in this slice',
      );
    }

    let definition: CanonicalQaProfileDefinition;
    let fixtureKey: string | null = null;
    let segment = dto.segment ?? QaProfileSegment.Custom;

    if (dto.source === QaProfileSource.FixtureImport) {
      if (!dto.fixtureKey) {
        throw new AppError(
          'QA_PROFILE_INVALID',
          'fixtureKey is required for fixture_import',
        );
      }
      definition = loadQaFixture(dto.fixtureKey);
      fixtureKey = dto.fixtureKey;
      segment = FIXTURE_SEGMENTS[dto.fixtureKey] ?? segment;
    } else {
      const base = dto.definition
        ? this.parseDefinition(dto.definition)
        : parseQaProfileDefinition({
            profile: { name: dto.name },
            brief: dto.brief,
          });
      definition = dto.brief
        ? parseQaProfileDefinition({ ...base, brief: dto.brief })
        : base;
    }

    const profile = await this.dataSource.getRepository(QaProfileEntity).save({
      name: dto.name,
      segment,
      source: dto.source,
      fixtureKey,
      definition,
      draftRevision: 0,
      status: QaProfileStatus.Draft,
    });

    return this.getOne(profile.id);
  }

  async getMany(
    query: PaginationSortingQuery & {
      search?: string;
      segment?: QaProfileSegment;
      source?: QaProfileSource;
      status?: QaProfileStatus;
    },
  ) {
    const where: FindOptionsWhere<QaProfileEntity> = {};
    if (query.segment) where.segment = query.segment;
    if (query.source) where.source = query.source;
    if (query.status) where.status = query.status;
    if (query.search) where.name = ILike(`%${query.search}%`);

    const [data, total] = await this.dataSource
      .getRepository(QaProfileEntity)
      .findAndCount({
        where,
        order: { [query.orderBy]: query.order },
        skip: query.skip,
        take: query.take,
      });

    return {
      total,
      data,
      skip: query.skip,
      take: query.take,
    };
  }

  async getOne(id: string) {
    const profile = await this.dataSource.getRepository(QaProfileEntity).findOne({
      where: { id },
    });

    if (!profile) {
      throw new AppError('NOT_FOUND', 'QA profile not found', { id });
    }

    return profile;
  }

  async patch(id: string, dto: PatchQaProfileDto) {
    const profile = await this.getOne(id);

    if (
      dto.draftRevision !== undefined &&
      dto.draftRevision !== profile.draftRevision
    ) {
      throw new AppError('CONFLICT', 'Stale draft revision', {
        expected: profile.draftRevision,
        received: dto.draftRevision,
      });
    }

    if (dto.status === QaProfileStatus.Archived) {
      profile.status = QaProfileStatus.Archived;
    }

    if (dto.name) {
      profile.name = dto.name;
    }

    if (dto.segment) {
      profile.segment = dto.segment;
    }

    if (dto.definition || dto.changes?.length) {
      let next = dto.definition
        ? this.parseDefinition(dto.definition)
        : parseQaProfileDefinition(profile.definition);

      if (dto.changes?.length) {
        next = applyDefinitionChanges(next, dto.changes);
      }

      profile.definition = next;
      profile.draftRevision += 1;

      if (
        profile.status === QaProfileStatus.Ready ||
        profile.status === QaProfileStatus.OutOfDate
      ) {
        profile.status = QaProfileStatus.OutOfDate;
      }
    }

    await this.dataSource.getRepository(QaProfileEntity).save(profile);
    return this.getOne(id);
  }

  async materialize(id: string) {
    const profile = await this.getOne(id);
    return this.materializer.materialize(profile, false);
  }

  async rematerialize(id: string, confirm: boolean) {
    if (!confirm) {
      throw new AppError(
        'CONFLICT',
        'Rematerialize requires confirm: true',
      );
    }

    const profile = await this.getOne(id);
    return this.materializer.materialize(profile, true);
  }

  async materialization(id: string) {
    const profile = await this.getOne(id);
    const userId = profile.sandboxUserId;

    const counts = userId
      ? {
          notes: await this.dataSource
            .getRepository(NoteEntity)
            .count({ where: { userId } }),
          themes: await this.dataSource
            .getRepository(ThemeEntity)
            .count({ where: { userId } }),
          strategies: await this.dataSource
            .getRepository(StrategyEntity)
            .count({ where: { userId } }),
          voices: await this.dataSource
            .getRepository(VoiceEntity)
            .count({ where: { userId } }),
          posts: await this.dataSource
            .getRepository(PostEntity)
            .count({ where: { userId } }),
        }
      : {
          notes: 0,
          themes: 0,
          strategies: 0,
          voices: 0,
          posts: 0,
        };

    return {
      status: profile.status,
      sandboxUserId: profile.sandboxUserId,
      counts,
      error: profile.materializationError,
      materializedAt: profile.materializedAt,
    };
  }

  definitionCounts(definition: CanonicalQaProfileDefinition | unknown) {
    const parsed = parseQaProfileDefinition(definition ?? {});
    return {
      notes: (parsed.notes?.raw?.length ?? 0) + (parsed.notes?.noisy?.length ?? 0),
      themes: parsed.pillars?.length ?? 0,
      postSamples: parsed.postSamples?.length ?? 0,
    };
  }

  private parseDefinition(value: unknown): CanonicalQaProfileDefinition {
    try {
      return typeof value === 'object' &&
        value &&
        ('tone_rules' in (value as object) || 'post_samples' in (value as object))
        ? normalizeFixture(value as never)
        : parseQaProfileDefinition(value);
    } catch (error) {
      throw new AppError(
        'QA_PROFILE_INVALID',
        error instanceof Error ? error.message : 'Invalid profile definition',
      );
    }
  }
}
