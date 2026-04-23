import {
  VoiceCalibrationEntity,
  VoiceCalibrationType,
  VoiceData,
  VoiceEntity,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { z } from 'zod';

import { LlmService } from '@/modules/llm';

import { VOICE_CALIBRATE_PROMPT } from './prompts/voice-calibrate.prompt';

const schema = z.object({
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

    const result = schema.parse(response);

    const samples = await this.generateSamples(
      result,
      examples,
      calibration.data.themes,
    );

    const data = {
      ...calibration.data,
      steps: [
        ...calibration.data.steps,
        { type, data: result, samples, feedback: null },
      ],
    };

    await this.dataSource.getRepository(VoiceCalibrationEntity).save({
      id: calibration.id,
      data,
    });
  }

  async generateSamples(_i: {
    data: VoiceData;
    examples: string[];
    themes: string[];
    ideas: string[];
    note: string | null;
  }): Promise<{ theme: string; idea: string; note?: string; text: string }[]> {
    return [];
  }
}
