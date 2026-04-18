import {
  IdeaEntity,
  NoteEntity,
  ProfileEntity,
  StrategyEntity,
  StrategyStatus,
  ThemeEntity,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { PaginationSortingQuery } from '@/common/utils';

import { IdeaGeneratorService } from './idea-generator.service';

@Injectable()
export class IdeaService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly ideaGeneratorService: IdeaGeneratorService,
  ) {}

  async getMany(userId: string, query: PaginationSortingQuery) {
    const repo = this.dataSource.getRepository(IdeaEntity);

    const qb = repo
      .createQueryBuilder('idea')
      .where('idea.userId = :userId', { userId })
      .select([
        'idea.id',
        'idea.name',
        'idea.angle',
        'idea.createdAt',
        'idea.updatedAt',
      ])
      .leftJoin('idea.notes', 'idea_note')
      .leftJoin('idea_note.note', 'note')
      .addSelect(['note.id', 'note.name'])
      .leftJoin('idea.theme', 'theme')
      .addSelect(['theme.id', 'theme.name'])
      .leftJoin('idea.profile', 'profile')
      .addSelect(['profile.id', 'profile.name'])
      .orderBy(`idea.${query.orderBy}`, query.order)
      .skip(query.skip)
      .take(query.take);

    const [ideas, total] = await qb.getManyAndCount();

    return {
      total,
      data: ideas,
      skip: query.skip,
      take: query.take,
    };
  }

  /**
   * Suggest ideas
   *
   * @param userId - The user ID
   * @param dto - The suggest dto
   * @param count - The number of ideas to suggest
   * @returns The suggested ideas
   *
   * Profile and strategy are there always there if exist
   * Strategy is default active or none
   * Voice is provided, default, or none
   * Theme is either selected or none
   * Notes are either suggested or selected
   */
  async suggest(
    userId: string,
    dto: {
      themeId?: string;
      profileId?: string;
      notesBased?: boolean;
      forNoteIds?: string[];
    },
    count: number,
  ): Promise<IdeaEntity[]> {
    const { themeId, notesBased, profileId, forNoteIds } = dto;

    let notes: NoteEntity[] = [];
    let theme: ThemeEntity | undefined;
    let profile: ProfileEntity | undefined;

    if (themeId) {
      theme = await this.dataSource.getRepository(ThemeEntity).findOne({
        where: { id: themeId, userId },
      });
    }

    const strategy = await this.dataSource
      .getRepository(StrategyEntity)
      .findOne({
        where: { status: StrategyStatus.Active, userId },
      });

    if (profileId) {
      profile = await this.dataSource.getRepository(ProfileEntity).findOne({
        where: { id: profileId, userId },
      });
    } else {
      profile = await this.dataSource.getRepository(ProfileEntity).findOne({
        where: { userId },
      });
    }

    if (notesBased && !forNoteIds?.length) {
      // todo: get candidate notes
    }

    if (forNoteIds?.length) {
      notes = await this.dataSource.getRepository(NoteEntity).find({
        where: { id: In(forNoteIds), userId },
      });
    }

    if (!notes.length && !theme && !profile && !strategy) {
      throw Err.badRequest('No context provided');
    }

    const ideas = await this.ideaGeneratorService.suggest(
      userId,
      {
        profile,
        notes,
        strategy,
        theme,
      },
      count,
    );

    return ideas;
  }
}
