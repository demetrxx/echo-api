import {
  IdeaEntity,
  NoteEntity,
  PlatformType,
  PostEntity,
  StrategyEntity,
  ThemeEntity,
  VoiceData,
} from '@app/db';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { LlmService } from '@/modules/llm';

import { REFINE_PROMPT } from './prompts/refine.prompt';

interface RefineInput {
  post: PostEntity;
  request: string;
  voice?: { data: VoiceData; platforms: PlatformType[]; examples: string[] };
  notes?: NoteEntity[];
  theme?: ThemeEntity;
  idea?: IdeaEntity;
  strategy?: StrategyEntity;
}

@Injectable()
export class PostRefineService {
  private readonly logger = new Logger(PostRefineService.name);

  constructor(
    @InjectDataSource()
    private readonly llmService: LlmService,
  ) {}

  async refine(i: RefineInput): Promise<string> {
    const prompt = REFINE_PROMPT({
      post: i.post.currentVersion.text,
      request: i.request,
      voice: i.voice,
      notes: i.notes,
      theme: i.theme,
      idea: i.idea,
      strategy: i.strategy,
    });

    const response = await this.llmService.client.invoke([
      { role: 'user', content: prompt },
    ]);

    return response.content as string;
  }
}
