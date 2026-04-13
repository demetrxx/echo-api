import {
  IdeaEntity,
  NoteEntity,
  NoteIdeaEntity,
  ProfileEntity,
  StrategyEntity,
  ThemeEntity,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { z } from 'zod';

import { LlmService } from '@/modules/llm';

import { IDEA_GENERATION_PROMPT } from './idea-generation.prompt';

const schema = z
  .array(
    z.object({
      name: z.string().describe('The name of the idea'),
      angle: z.string().describe('The angle of the idea'),
      noteIds: z
        .array(z.string())
        .optional()
        .describe('The notes that support or inspired the idea'),
    }),
  )
  .describe('An array of ideas');

@Injectable()
export class IdeaGeneratorService {
  constructor(
    private readonly llmService: LlmService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async suggest(
    userId: string,
    dto: {
      profile?: ProfileEntity;
      notes?: NoteEntity[];
      strategy?: StrategyEntity;
      theme?: ThemeEntity;
    },
    count: number,
  ) {
    const { profile, notes, strategy, theme } = dto;

    const systemPrompt = IDEA_GENERATION_PROMPT({
      notes,
      theme,
      profile,
      strategy,
      count,
    });

    const response = await this.llmService.client
      .withStructuredOutput(schema)
      .invoke([{ role: 'user', content: systemPrompt }]);

    return await this.dataSource.transaction(async (ds) => {
      const ideaRepository = ds.getRepository(IdeaEntity);
      const noteIdeaRepository = ds.getRepository(NoteIdeaEntity);

      const ideas = await ideaRepository.save(
        response.map((i) => ({
          name: i.name,
          angle: i.angle,
          strategyId: strategy.id,
          userId,
          themeId: theme.id,
        })),
      );

      if (notes?.length) {
        const noteIdeas = response.flatMap((i, idx) =>
          i.noteIds.map((noteId) => ({
            noteId,
            ideaId: ideas[idx].id,
          })),
        );

        await noteIdeaRepository.save(noteIdeas);
      }

      return ideas;
    });
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
