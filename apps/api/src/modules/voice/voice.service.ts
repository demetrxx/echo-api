import {
  PlatformType,
  VoiceCalibrationEntity,
  VoiceCalibrationType,
  VoiceEntity,
  VoiceExampleEntity,
  VoiceStatus,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { toSql } from 'pgvector/utils';
import { DataSource } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { PaginationSortingQuery } from '@/common/utils';
import { LlmService } from '@/modules/llm';

import { ADAPT_TEXT_PROMPT } from './prompts/adapt-text.prompt';
import { VoiceCalibrationService } from './voice-calibration.service';

const SIMILARITY_THRESHOLD = 0.5;

@Injectable()
export class VoiceService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly llmService: LlmService,
    private readonly voiceCalibrationService: VoiceCalibrationService,
  ) {}

  // voice processing
  async calibrate(voiceId: string, userId: string, type: VoiceCalibrationType) {
    const voice = await this.getOne(voiceId, userId);

    const examples = await this.getExamples(voiceId, userId);

    await this.voiceCalibrationService.calibrate(
      voice,
      examples.map((e) => e.text),
      type,
    );

    // add step
  }

  async getRelevantExamples(
    voiceId: string,
    i: {
      text: string;
      count: number;
    },
  ) {
    const { text, count } = i;

    const repo = this.dataSource.getRepository(VoiceExampleEntity);

    const embeddings = await this.llmService.getEmbeddings(text);

    const examples = await repo
      .createQueryBuilder('example')
      .where('example.voiceId = :voiceId', { voiceId })
      .andWhere(
        'example.textEmbeddings <-> (:embeddings)::vector < :threshold',
        {
          embeddings: toSql(embeddings),
          threshold: SIMILARITY_THRESHOLD,
        },
      )
      .orderBy('example.textEmbeddings <-> (:embeddings)::vector', 'ASC')
      .take(count)
      .getMany();

    return examples;
  }

  async adaptText(
    voiceId: string,
    userId: string,
    i: {
      text: string;
      platform: PlatformType;
    },
  ) {
    const { platform, text } = i;

    const voice = await this.getOne(voiceId, userId);

    const examples = await this.getRelevantExamples(voiceId, {
      text,
      count: 10,
    });

    const prompt = ADAPT_TEXT_PROMPT({
      platform,
      text,
      examples,
      voice,
    });

    const response = await this.llmService.client.invoke([
      { role: 'user', content: prompt },
    ]);

    return response.content as string;
  }

  // CRUD

  async create(
    userId: string,
    dto: {
      platforms: PlatformType[];
    },
  ) {
    this.dataSource.transaction(async (ds) => {
      const repo = ds.getRepository(VoiceEntity);

      const voice = await repo.save({
        userId,
        name: `New Voice for ${dto.platforms.join(', ')}`,
        platforms: dto.platforms,
        data: {
          tov: [],
          rules: [],
          avoidRules: [],
          evidencePreferences: '',
          extra: {},
        },
        status: VoiceStatus.Calibrating,
      });

      await ds.getRepository(VoiceCalibrationEntity).save({
        voiceId: voice.id,
        data: {
          steps: [],
        },
      });

      return voice;
    });
  }

  async getOne(id: string, userId: string) {
    const voice = await this.dataSource.getRepository(VoiceEntity).findOne({
      where: { id, userId },
    });

    if (!voice) {
      throw Err.notFound('Voice not found');
    }

    return voice;
  }

  async getMany(userId: string, query: PaginationSortingQuery) {
    const { orderBy, order, skip, take } = query;

    const voices = await this.dataSource.getRepository(VoiceEntity).find({
      where: { userId },
      skip,
      take,
      order: {
        [orderBy]: order,
      },
    });

    return {
      total: voices.length,
      data: voices,
      skip,
      take,
    };
  }

  async updateOne(
    id: string,
    userId: string,
    dto: {
      name?: string;
      tov?: string;
      rules?: string[];
      avoidRules?: string[];
      evidencePreferences?: string;
    },
  ) {
    await this.checkExists(id, userId);

    await this.dataSource.getRepository(VoiceEntity).update(id, dto);

    return this.getOne(id, userId);
  }

  async checkExists(id: string, userId: string) {
    const voice = await this.dataSource.getRepository(VoiceEntity).findOne({
      where: { id, userId },
    });

    if (!voice) {
      throw Err.notFound('Voice not found');
    }
  }

  async deleteOne(id: string, userId: string) {
    await this.checkExists(id, userId);

    await this.dataSource.getRepository(VoiceEntity).softDelete(id);
  }

  // examples
  async addExamples(
    voiceId: string,
    userId: string,
    dto: { examples: string[] },
  ) {
    await this.checkExists(voiceId, userId);

    const { examples } = dto;

    const repo = this.dataSource.getRepository(VoiceExampleEntity);

    const embeddings = await Promise.all(
      examples.map((e) => this.llmService.getEmbeddings(e)),
    );

    await repo.save(
      examples.map((e, idx) => ({
        example: e,
        textEmbeddings: embeddings[idx],
        voiceId,
      })),
    );
  }

  async getExamples(voiceId: string, userId: string) {
    await this.checkExists(voiceId, userId);

    return this.dataSource.getRepository(VoiceExampleEntity).find({
      where: { voiceId },
    });
  }

  async deleteExamples(voiceId: string, userId: string, exampleIds: string[]) {
    await this.checkExists(voiceId, userId);

    await this.dataSource.getRepository(VoiceExampleEntity).delete(exampleIds);
  }
}
