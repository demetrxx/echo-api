import {
  IdeaEntity,
  NoteEntity,
  PlatformType,
  ThemeEntity,
  VoiceCalibrationEntity,
  VoiceCalibrationSample,
  VoiceCalibrationType,
  VoiceData,
  VoiceEntity,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { z } from 'zod';

import { LlmService } from '@/modules/llm';
import { PostRefineService } from '@/modules/post';

import { IdeaGeneratorService } from '../idea/idea-generator.service';
import { VOICE_CALIBRATE_PROMPT } from './prompts/voice-calibrate.prompt';

const MAX_SAMPLES = 3;

const voiceDataSchema = z.object({
  tov: z.array(z.string()).describe('Tone of voice'),
  rules: z.array(z.string()).describe('Rules'),
  avoidRules: z.array(z.string()).describe('Avoid rules'),
  evidencePreferences: z.string().describe('Evidence preferences'),
  extra: z.record(z.string(), z.string()).describe('Extra'),
});

@Injectable()
export class VoiceCalibrationService {
  constructor(
    private readonly llmService: LlmService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly postRefineService: PostRefineService,
    private readonly ideaGeneratorService: IdeaGeneratorService,
  ) {}

  async calibrate(
    voice: VoiceEntity,
    examples: string[],
    type: VoiceCalibrationType,
    feedback?: string,
  ) {
    const calibration = await this.dataSource
      .getRepository(VoiceCalibrationEntity)
      .findOne({
        where: {
          voiceId: voice.id,
        },
      });

    if (feedback) {
      calibration.data.steps[calibration.data.steps.length - 1].feedback =
        feedback;
    }

    const prompt = VOICE_CALIBRATE_PROMPT({
      voice,
      examples,
    });

    const response = await this.llmService.client.invoke([
      { role: 'user', content: prompt },
    ]);

    const voiceData = voiceDataSchema.parse(response);

    const themes = await this.getUserThemes(voice.userId);

    const ideas = await this.generateIdeas(voice.userId, {
      themes,
      note: calibration.note,
      voiceData,
    });

    const samples = await Promise.all(
      ideas.map((idea) =>
        this.generateSample({
          data: voiceData,
          examples,
          idea,
          note: calibration.data.note,
          platforms: voice.platforms,
        }),
      ),
    );

    calibration.data.steps.push({
      type,
      data: voiceData,
      samples,
      feedback: null,
    });

    await this.dataSource.getRepository(VoiceCalibrationEntity).save({
      id: calibration.id,
      data: calibration.data,
    });
  }

  async getUserThemes(userId: string): Promise<ThemeEntity[]> {
    return this.dataSource.getRepository(ThemeEntity).find({
      where: {
        userId,
      },
      take: 3,
    });
  }

  async generateIdeas(
    userId: string,
    i: {
      themes: ThemeEntity[];
      note: NoteEntity;
      voiceData: VoiceData;
    },
  ): Promise<IdeaEntity[]> {
    const ideasAmountToGenerate: Record<string, number> = i.themes.reduce(
      (acc, theme) => {
        // 1 idea for each theme
        acc[theme.id] = 1;

        // if we have less than 3 themes, repeat the last theme
        if (i.themes.length < MAX_SAMPLES) {
          acc[theme.id] = MAX_SAMPLES - i.themes.length;
        }

        return acc;
      },
      {},
    );

    const ideas = await Promise.all(
      i.themes.map((theme) =>
        this.ideaGeneratorService.suggest(
          userId,
          {
            notes: [i.note],
            voiceData: i.voiceData,
            theme,
          },
          ideasAmountToGenerate[theme.id],
        ),
      ),
    );

    return ideas.flat();
  }

  async generateSample(i: {
    platforms: PlatformType[];
    data: VoiceData;
    examples: string[];
    idea: IdeaEntity;
    note: string | null;
  }): Promise<VoiceCalibrationSample> {
    const sample = await this.postRefineService.refine({
      post: null,
      idea: i.idea,
      theme: i.idea.theme,
      request: 'Write the post',
      voice: {
        data: i.data,
        platforms: i.platforms,
        examples: i.examples,
      },
      notes: i.note ? [{ text: i.note } as NoteEntity] : [],
    });

    return {
      theme: {
        name: i.idea.theme.name,
        description: i.idea.theme.description,
      },
      idea: {
        name: i.idea.name,
        angle: i.idea.angle,
      },
      text: sample,
      note: i.note,
    };
  }
}
