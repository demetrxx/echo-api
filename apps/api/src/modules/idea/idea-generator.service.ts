import {
  IdeaEntity,
  NoteEntity,
  NoteIdeaEntity,
  StrategyEntity,
  ThemeEntity,
  VoiceData,
  VoiceEntity,
} from '@app/db';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { z } from 'zod';

import { LlmService } from '@/modules/llm';

import { VoiceInfoDto } from '../voice';
import { IDEA_GENERATION_PROMPT } from './idea-generation.prompt';

const shemaNoNotes = z.array(
  z.object({
    name: z.string().max(255).describe('The name of the idea'),
    angle: z.string().max(255).describe('The angle of the idea'),
  }),
);

const schemaWithNotes = z.array(
  z.object({
    name: z.string().describe('The name of the idea'),
    angle: z.string().describe('The angle of the idea'),
    noteIds: z
      .array(z.string())
      .optional()
      .describe('The notes that support or inspired the idea'),
  }),
);

const schema = (withNotes: boolean) =>
  withNotes ? schemaWithNotes : shemaNoNotes;

// todo: add generation
@Injectable()
export class IdeaGeneratorService {
  private readonly logger = new Logger(IdeaGeneratorService.name);

  constructor(
    private readonly llmService: LlmService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async suggest(
    userId: string,
    dto: {
      voice?: VoiceInfoDto;
      notes?: NoteEntity[];
      strategy?: StrategyEntity;
      theme?: ThemeEntity;
    },
    count: number,
  ) {
    const { voice, notes, strategy, theme } = dto;

    const systemPrompt = IDEA_GENERATION_PROMPT({
      notes,
      theme,
      voice,
      strategy,
      count,
    });

    const wihtNotes = !!notes?.length;

    const response = await this.llmService.client.invoke([
      { role: 'user', content: systemPrompt },
    ]);

    const ideas = schema(wihtNotes).parse(
      JSON.parse(response.content as string),
    );

    this.logger.debug(response);

    return await this.dataSource.transaction(async (ds) => {
      const ideaRepository = ds.getRepository(IdeaEntity);
      const noteIdeaRepository = ds.getRepository(NoteIdeaEntity);

      const ideasEntities = await ideaRepository.save(
        ideas.map((i) => ({
          name: i.name,
          angle: i.angle,
          strategyId: strategy?.id,
          userId,
          themeId: theme?.id,
        })),
      );

      if (notes?.length) {
        const noteIdeas = ideas.flatMap((i, idx) =>
          // @ts-expect-error - noteIds is optional
          i.noteIds.map((noteId) => ({
            noteId,
            ideaId: ideasEntities[idx].id,
          })),
        );

        await noteIdeaRepository.save(noteIdeas);
      }

      return ideasEntities;
    });
  }

  async suggestForTheme() {}

  async suggestForStrategy() {}

  // async getNoteCandidates(
  //   userId: string,
  //   themeId: string,
  // ): Promise<NoteEntity[]> {
  //   return [];
  // }
}
