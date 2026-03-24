import { NoteEntity, PlatformType, ThemeEntity } from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { LlmService } from '@/modules/llm';

import { IdeaService } from './idea.service';

@Injectable()
export class IdeaGeneratorService {
  constructor(
    private readonly llmService: LlmService,
    private readonly ideaService: IdeaService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async suggestForNotes(
    userId: string,
    dto: {
      themeId?: string;
      noteIds?: string[];
      profileId?: string;
      platform?: PlatformType;
    },
  ) {
    const { themeId, noteIds, profileId, platform } = dto;

    let theme: ThemeEntity | null = null;

    if (themeId) {
      theme = await this.dataSource.getRepository(ThemeEntity).findOne({
        where: { id: themeId, userId },
      });
      if (!theme) {
        throw Err.notFound('Theme not found');
      }
    }

    let notes: NoteEntity[] = [];

    if (dto.noteIds?.length) {
      notes = await this.dataSource.getRepository(NoteEntity).find({
        where: { id: In(dto.noteIds), userId },
      });
      if (notes.length !== dto.noteIds.length) {
        throw Err.notFound('Some notes not found');
      }
    } else {
      notes = await this.getNoteCandidates(userId, dto.themeId);
    }
  }

  async suggestForTheme() {}

  async suggestForStrategy() {}

  async getNoteCandidates(
    userId: string,
    themeId: string,
  ): Promise<NoteEntity[]> {
    return [];
  }
}
