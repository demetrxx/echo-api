import { PlatformType, VoiceEntity, VoiceExampleEntity } from '@app/db';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { toSql } from 'pgvector/utils';
import { DataSource } from 'typeorm';
import { z } from 'zod';

import { Err } from '@/common/errors/app-error';
import { PaginationSortingQuery } from '@/common/utils';
import { LlmService } from '@/modules/llm';

import { ADAPT_TEXT_PROMPT } from './prompts/adapt-text.prompt';
import { VOICE_PROCESS_PROMPT } from './prompts/voice-process.prompt';

const SIMILARITY_THRESHOLD = 0.5;

const schema = z.object({
  tov: z.string().describe('Tone of voice'),
  rules: z.array(z.string()).describe('Rules'),
  avoidRules: z.array(z.string()).describe('Avoid rules'),
  evidencePreferences: z.string().describe('Evidence preferences'),
  platformOverrides: z
    .record(
      z.enum(PlatformType),
      z.object({
        tov: z.array(z.string()).describe('Tone of voice'),
        rules: z.array(z.string()).describe('Rules'),
        avoidRules: z.array(z.string()).describe('Avoid rules'),
        evidencePreferences: z.string().describe('Evidence preferences'),
      }),
    )
    .describe('Platform overrides'),
});

@Injectable()
export class VoiceService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly llmService: LlmService,
  ) {}

  // voice processing

  async process(id: string, userId: string) {
    const voice = await this.getOne(id, userId);

    const examples = await this.getExamples(id, userId);

    const prompt = VOICE_PROCESS_PROMPT({
      voice,
      examples,
    });

    const response = await this.llmService.client.invoke([
      { role: 'user', content: prompt },
    ]);

    const result = schema.parse(response);

    await this.updateOne(id, userId, result);
  }

  async getRelevantExamples(
    voiceId: string,
    i: {
      platform: PlatformType;
      text: string;
      count: number;
    },
  ) {
    const { platform, text, count } = i;

    const repo = this.dataSource.getRepository(VoiceExampleEntity);

    const embeddings = await this.llmService.getEmbeddings(text);

    const examples = await repo
      .createQueryBuilder('example')
      .where('example.voiceId = :voiceId', { voiceId })
      .andWhere('example.platform = :platform', { platform })
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
      platform: PlatformType;
      text: string;
    },
  ) {
    const { platform, text } = i;

    const voice = await this.getOne(voiceId, userId);

    const examples = await this.getRelevantExamples(voiceId, {
      platform,
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
      name: string;
    },
  ) {
    const repo = this.dataSource.getRepository(VoiceEntity);

    const voice = await repo.save({
      userId,
      name: dto.name,
    });

    return voice;
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
    examples: { platform: PlatformType; example: string }[],
  ) {
    const repo = this.dataSource.getRepository(VoiceExampleEntity);

    const embeddings = await Promise.all(
      examples.map(async (e) => {
        return this.llmService.getEmbeddings(e.example);
      }),
    );

    await repo.save(
      examples.map((e, idx) => ({
        platform: e.platform,
        example: e.example,
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
