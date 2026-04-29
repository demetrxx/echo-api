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
  VoiceStatus,
} from '@app/db';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { z } from 'zod';

import { LlmService } from '@/modules/llm';
import { PostRefineService } from '@/modules/post';

import { IdeaGeneratorService } from '../idea/idea-generator.service';
import { NoteService } from '../note/note.service';
import { VOICE_CALIBRATE_PROMPT } from './prompts/voice-calibrate.prompt';
import { VoiceInfoDto } from './types/voice-info.dto';
import { VoiceService } from './voice.service';

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
  private readonly logger = new Logger(VoiceCalibrationService.name);

  constructor(
    private readonly llmService: LlmService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly postRefineService: PostRefineService,
    private readonly ideaGeneratorService: IdeaGeneratorService,
    private readonly voiceService: VoiceService,
    private readonly noteService: NoteService,
  ) {}

  // actions
  async calibrate(voiceId: string, userId: string, type: VoiceCalibrationType) {
    const calibration = await this.getOne(voiceId, userId);

    const { voice } = calibration;

    const examples = voice.examples.map((e) => e.text);

    const prompt = VOICE_CALIBRATE_PROMPT({
      calibrationType: type,
      steps: calibration.data.steps,
      voiceInfo: {
        data: voice.data,
        examples,
        platforms: voice.platforms,
      },
    });

    const response = await this.llmService.client.invoke([
      { role: 'user', content: prompt },
    ]);

    const voiceData = voiceDataSchema.parse(
      JSON.parse(response.content as string),
    );

    const samples = await this.generateSamples({
      voice,
      calibration,
      voiceData,
      examples,
    });

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

  async start(voiceId: string, userId: string) {
    await this.voiceService.checkExists(voiceId, userId);

    await this.dataSource.transaction(async (ds) => {
      await ds.getRepository(VoiceCalibrationEntity).save({
        voiceId: voiceId,
        data: {
          steps: [],
        },
      });

      await ds.getRepository(VoiceEntity).update(voiceId, {
        status: VoiceStatus.Calibrating,
      });
    });

    await this.calibrate(voiceId, userId, VoiceCalibrationType.Initial);

    return this.getOne(voiceId, userId);
  }

  async save(voiceId: string, userId: string) {
    await this.voiceService.checkExists(voiceId, userId);

    const calibration = await this.getOne(voiceId, userId);

    if (calibration.voice.status !== VoiceStatus.Calibrating) {
      throw new BadRequestException('Voice is not calibrating');
    }

    const lastStep = calibration.data.steps[calibration.data.steps.length - 1];

    await this.dataSource.getRepository(VoiceEntity).update(voiceId, {
      data: lastStep.data,
      status: VoiceStatus.Active,
    });
  }

  async addFeedback(voiceId: string, userId: string, feedback: string) {
    await this.voiceService.checkExists(voiceId, userId);

    const calibration = await this.dataSource
      .getRepository(VoiceCalibrationEntity)
      .findOne({
        where: {
          voiceId,
        },
      });

    calibration.data.steps[calibration.data.steps.length - 1].feedback =
      feedback;

    await this.dataSource.getRepository(VoiceCalibrationEntity).save({
      id: calibration.id,
      data: calibration.data,
    });

    await this.calibrate(voiceId, userId, VoiceCalibrationType.Feedback);

    return this.getOne(voiceId, userId);
  }

  async updateExamples(voiceId: string, userId: string, examples: string[]) {
    await this.voiceService.checkExists(voiceId, userId);

    await this.voiceService.addExamples(voiceId, userId, { examples });

    await this.calibrate(voiceId, userId, VoiceCalibrationType.UpdateExamples);

    return this.getOne(voiceId, userId);
  }

  async updateNote(voiceId: string, userId: string, note: string) {
    const calibration = await this.getOne(voiceId, userId);

    const examples = calibration.voice.examples.map((e) => e.text);

    if (!calibration.note) {
      const noteEntity = await this.noteService.create(userId, {
        name: 'Voice calibration',
        text: note,
      });

      await this.dataSource
        .getRepository(VoiceCalibrationEntity)
        .update(calibration.id, {
          noteId: noteEntity.id,
        });
    } else {
      await this.noteService.updateOne(calibration.note.id, userId, {
        text: note,
      });
    }

    const step = calibration.data.steps[calibration.data.steps.length - 1];

    // add samples
    const samples = await this.generateSamples({
      voice: calibration.voice,
      calibration,
      voiceData: step.data,
      examples,
    });

    step.samples = [...step.samples, ...samples];

    await this.dataSource.getRepository(VoiceCalibrationEntity).save({
      id: calibration.id,
      data: calibration.data,
    });
  }

  async getOne(voiceId: string, userId: string) {
    await this.voiceService.checkExists(voiceId, userId);
    const calibration = await this.dataSource
      .getRepository(VoiceCalibrationEntity)
      .findOne({
        where: {
          voiceId,
        },
        relations: ['note', 'voice', 'voice.examples'],
      });

    this.logger.debug(calibration.data.steps.length);

    return calibration;
  }

  // samples
  private async generateSamples(i: {
    voice: VoiceEntity;
    calibration: VoiceCalibrationEntity;
    voiceData: VoiceData;
    examples: string[];
  }) {
    const { voice, calibration, voiceData, examples } = i;

    const themes = await this.getUserThemes(voice.userId);

    const ideas = await this.generateIdeas(voice.userId, {
      themes,
      note: calibration.note,
      voice: { data: voice.data },
    });

    return Promise.all(
      ideas.map((idea) =>
        this.generateSample({
          data: voiceData,
          examples,
          idea,
          note: calibration.note?.text,
          platforms: voice.platforms,
        }),
      ),
    );
  }

  private async generateSample(i: {
    platforms: PlatformType[];
    data: VoiceData;
    examples: string[];
    idea: IdeaEntity;
    note: string | null;
  }): Promise<VoiceCalibrationSample> {
    const sample = await this.postRefineService.refine({
      platform: i.platforms[0],
      versions: [],
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

  // ideas
  private async generateIdeas(
    userId: string,
    i: {
      themes: ThemeEntity[];
      note: NoteEntity;
      voice: VoiceInfoDto;
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
            notes: i.note ? [i.note] : [],
            voice: i.voice,
            theme,
          },
          ideasAmountToGenerate[theme.id],
        ),
      ),
    );

    return ideas.flat();
  }

  // themes
  private async getUserThemes(userId: string): Promise<ThemeEntity[]> {
    return this.dataSource.getRepository(ThemeEntity).find({
      where: {
        userId,
      },
      take: 3,
    });
  }

  // examples
  // private async getExamples(voiceId: string, userId: string) {
  //   const exampleEntities = await this.voiceService.getExamples(
  //     voiceId,
  //     userId,
  //   );
  //   return exampleEntities.map((e) => e.text);
  // }
}
