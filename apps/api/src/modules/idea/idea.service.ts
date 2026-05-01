import {
  IdeaEntity,
  NoteEntity,
  NoteIdeaEntity,
  StrategyEntity,
  StrategyStatus,
  ThemeEntity,
  VoiceEntity,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { PaginationSortingQuery } from '@/common/utils';

import { IdeaGeneratorService } from './idea-generator.service';

interface UpdateIdeaDto {
  name?: string;
  angle?: string;
  isSaved?: boolean;
}

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
      .leftJoin('idea.voice', 'voice')
      .addSelect(['voice.id', 'voice.name'])
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

  async updateOne(id: string, userId: string, dto: UpdateIdeaDto) {
    const idea = await this.dataSource.getRepository(IdeaEntity).findOne({
      where: { id, userId },
    });

    if (!idea) {
      throw Err.notFound('Idea not found');
    }

    return this.dataSource.getRepository(IdeaEntity).save({
      id,
      ...dto,
    });
  }

  /**
   * Suggest ideas
   *
   * @param userId - The user ID
   * @param dto - The suggest dto
   * @param count - The number of ideas to suggest
   * @returns The suggested ideas
   *
   * Voice and strategy are there always there if exist
   * Strategy is default active or none
   * Voice is provided, default, or none
   * Theme is either selected or none
   * Notes are either suggested or selected
   */
  async suggest(
    userId: string,
    dto: {
      themeId?: string;
      voiceId?: string;
      notesBased?: boolean;
      forNoteIds?: string[];
    },
    count: number,
  ): Promise<IdeaEntity[]> {
    const { themeId, notesBased, voiceId, forNoteIds } = dto;

    let notes: NoteEntity[] = [];
    let theme: ThemeEntity | undefined;
    let voice: VoiceEntity | undefined;

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

    if (voiceId) {
      voice = await this.dataSource.getRepository(VoiceEntity).findOne({
        where: { id: voiceId, userId },
      });
    } else {
      voice = await this.dataSource.getRepository(VoiceEntity).findOne({
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

    if (!notes.length && !theme && !voice && !strategy) {
      throw Err.badRequest('No context provided');
    }

    const ideas = await this.ideaGeneratorService.suggest(
      userId,
      {
        voice: voice ? { data: voice.data } : undefined,
        notes,
        strategy,
        theme,
      },
      count,
    );

    return ideas;
  }
}
