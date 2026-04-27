import {
  IdeaEntity,
  NoteEntity,
  PlatformType,
  PostVersionEntity,
  StrategyEntity,
  ThemeEntity,
} from '@app/db';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { LlmService } from '@/modules/llm';

import { VoiceInfoDto } from '../voice';
import { REFINE_PROMPT } from './prompts/refine.prompt';

interface RefineInput {
  versions: PostVersionEntity[];
  platform: PlatformType;
  request: string;
  voice?: VoiceInfoDto;
  notes?: NoteEntity[];
  theme?: ThemeEntity;
  idea?: IdeaEntity;
  strategy?: StrategyEntity;
}

@Injectable()
export class PostRefineService {
  private readonly logger = new Logger(PostRefineService.name);

  constructor(private readonly llmService: LlmService) {}

  async refine(i: RefineInput): Promise<string> {
    const prompt = REFINE_PROMPT({
      request: i.request,
      voice: i.voice,
      notes: i.notes,
      theme: i.theme,
      idea: i.idea,
      strategy: i.strategy,
      platform: i.platform,
      versions: i.versions,
    });

    const response = await this.llmService.client.invoke([
      { role: 'user', content: prompt },
    ]);

    return response.content as string;
  }
}
